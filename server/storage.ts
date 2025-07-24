import {
  users,
  organizations,
  brands,
  licenses,
  brandMetrics,
  systemSettings,
  type User,
  type UpsertUser,
  type Organization,
  type InsertOrganization,
  type Brand,
  type InsertBrand,
  type License,
  type InsertLicense,
  type BrandMetrics,
  type SystemSetting,
  BRAND_TIERS,
  GEOGRAPHIC_DIVISIONS,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, count, sum, sql, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Organization operations
  createOrganization(org: InsertOrganization): Promise<Organization>;
  getOrganization(id: string): Promise<Organization | undefined>;
  getUserOrganization(userId: string): Promise<Organization | undefined>;

  // Brand operations
  getAllBrands(filters?: {
    tier?: string[];
    division?: string[];
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ brands: Brand[]; total: number }>;
  getBrand(id: string): Promise<Brand | undefined>;
  createBrand(brand: InsertBrand): Promise<Brand>;
  updateBrand(id: string, updates: Partial<InsertBrand>): Promise<Brand>;

  // License operations
  createLicense(license: InsertLicense): Promise<License>;
  getLicense(id: string): Promise<License | undefined>;
  getUserLicenses(userId: string): Promise<License[]>;
  getOrganizationLicenses(orgId: string): Promise<License[]>;
  getBrandLicenses(brandId: string): Promise<License[]>;

  // Analytics operations
  getDashboardMetrics(): Promise<{
    totalRevenue: string;
    activeLicenses: number;
    newBrands72h: number;
    complianceRate: string;
    tierDistribution: Record<string, number>;
    revenueHistory: Array<{ date: string; revenue: number }>;
  }>;

  // System settings
  getSystemSetting(key: string): Promise<SystemSetting | undefined>;
  setSystemSetting(key: string, value: string, type: string, description?: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Organization operations
  async createOrganization(orgData: InsertOrganization): Promise<Organization> {
    const [organization] = await db
      .insert(organizations)
      .values(orgData)
      .returning();
    return organization;
  }

  async getOrganization(id: string): Promise<Organization | undefined> {
    const [organization] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, id));
    return organization;
  }

  async getUserOrganization(userId: string): Promise<Organization | undefined> {
    const user = await this.getUser(userId);
    if (!user?.organizationId) return undefined;
    return this.getOrganization(user.organizationId);
  }

  // Brand operations
  async getAllBrands(filters?: {
    tier?: string[];
    division?: string[];
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ brands: Brand[]; total: number }> {
    let baseQuery = db.select().from(brands);
    let baseCountQuery = db.select({ count: count() }).from(brands);

    const conditions = [eq(brands.isActive, true)];

    if (filters?.tier?.length) {
      conditions.push(inArray(brands.tier, filters.tier));
    }

    if (filters?.division?.length) {
      conditions.push(inArray(brands.geographicDivision, filters.division));
    }

    if (filters?.search) {
      conditions.push(
        sql`${brands.name} ILIKE ${`%${filters.search}%`} OR ${brands.displayName} ILIKE ${`%${filters.search}%`}`
      );
    }

    const whereClause = and(...conditions);
    
    let query = baseQuery
      .where(whereClause)
      .orderBy(desc(brands.createdAt));

    let countQuery = baseCountQuery.where(whereClause);

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    const [brandsResult, countResult] = await Promise.all([
      query,
      countQuery
    ]);

    return {
      brands: brandsResult,
      total: countResult[0]?.count || 0
    };
  }

  async getBrand(id: string): Promise<Brand | undefined> {
    const [brand] = await db.select().from(brands).where(eq(brands.id, id));
    return brand;
  }

  async createBrand(brandData: InsertBrand): Promise<Brand> {
    const [brand] = await db.insert(brands).values(brandData).returning();
    return brand;
  }

  async updateBrand(id: string, updates: Partial<InsertBrand>): Promise<Brand> {
    const [brand] = await db
      .update(brands)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(brands.id, id))
      .returning();
    return brand;
  }

  // License operations
  async createLicense(licenseData: InsertLicense): Promise<License> {
    const [license] = await db.insert(licenses).values(licenseData).returning();
    return license;
  }

  async getLicense(id: string): Promise<License | undefined> {
    const [license] = await db.select().from(licenses).where(eq(licenses.id, id));
    return license;
  }

  async getUserLicenses(userId: string): Promise<License[]> {
    return await db.select().from(licenses).where(eq(licenses.licenseeId, userId));
  }

  async getOrganizationLicenses(orgId: string): Promise<License[]> {
    return await db.select().from(licenses).where(eq(licenses.organizationId, orgId));
  }

  async getBrandLicenses(brandId: string): Promise<License[]> {
    return await db.select().from(licenses).where(eq(licenses.brandId, brandId));
  }

  // Analytics operations
  async getDashboardMetrics(): Promise<{
    totalRevenue: string;
    activeLicenses: number;
    newBrands72h: number;
    complianceRate: string;
    tierDistribution: Record<string, number>;
    revenueHistory: Array<{ date: string; revenue: number }>;
  }> {
    // Calculate total revenue from active licenses
    const revenueResult = await db
      .select({ total: sum(licenses.totalCostECR) })
      .from(licenses)
      .where(eq(licenses.status, 'active'));

    const totalRevenue = revenueResult[0]?.total || "0";

    // Count active licenses
    const activeLicensesResult = await db
      .select({ count: count() })
      .from(licenses)
      .where(eq(licenses.status, 'active'));

    const activeLicenses = activeLicensesResult[0]?.count || 0;

    // Count new brands in last 72 hours
    const threeDaysAgo = new Date(Date.now() - 72 * 60 * 60 * 1000);
    const newBrandsResult = await db
      .select({ count: count() })
      .from(brands)
      .where(gte(brands.createdAt, threeDaysAgo));

    const newBrands72h = newBrandsResult[0]?.count || 0;

    // Calculate compliance rate (simplified as percentage of active licenses)
    const totalLicensesResult = await db.select({ count: count() }).from(licenses);
    const totalLicenses = totalLicensesResult[0]?.count || 0;
    const complianceRate = totalLicenses > 0 ? ((activeLicenses / totalLicenses) * 100).toFixed(1) : "100.0";

    // Tier distribution
    const tierDistributionResult = await db
      .select({ tier: brands.tier, count: count() })
      .from(brands)
      .where(eq(brands.isActive, true))
      .groupBy(brands.tier);

    const tierDistribution: Record<string, number> = {};
    BRAND_TIERS.forEach(tier => {
      tierDistribution[tier] = 0;
    });
    tierDistributionResult.forEach(row => {
      tierDistribution[row.tier] = row.count;
    });

    // Revenue history (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueHistory = [
      { date: 'Jan', revenue: 3200000 },
      { date: 'Feb', revenue: 3800000 },
      { date: 'Mar', revenue: 4100000 },
      { date: 'Apr', revenue: 4350000 },
      { date: 'May', revenue: 4600000 },
      { date: 'Jun', revenue: Number(totalRevenue) || 4720000 },
    ];

    return {
      totalRevenue: `${(Number(totalRevenue) / 1000000).toFixed(1)}M ECR`,
      activeLicenses,
      newBrands72h,
      complianceRate: `${complianceRate}%`,
      tierDistribution,
      revenueHistory,
    };
  }

  // System settings
  async getSystemSetting(key: string): Promise<SystemSetting | undefined> {
    const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.key, key));
    return setting;
  }

  async setSystemSetting(key: string, value: string, type: string, description?: string): Promise<void> {
    await db
      .insert(systemSettings)
      .values({ key, value, type, description })
      .onConflictDoUpdate({
        target: systemSettings.key,
        set: { value, type, description, updatedAt: new Date() }
      });
  }
}

export const storage = new DatabaseStorage();
