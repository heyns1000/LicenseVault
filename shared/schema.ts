import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  uuid,
  primaryKey
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("viewer"), // admin, manager, client, viewer
  organizationId: varchar("organization_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // enterprise, agency, individual
  contactEmail: varchar("contact_email"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const brands = pgTable("brands", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name").notNull(),
  displayName: varchar("display_name").notNull(), // With ™ symbol
  tier: varchar("tier").notNull(), // sovereign, dynastic, operational, market
  description: text("description"),
  category: varchar("category"),
  geographicDivision: varchar("geographic_division").notNull(), // A, B, C, D, E, F, G
  licenseFeeECR: decimal("license_fee_ecr", { precision: 10, scale: 2 }).notNull(),
  licenseFeeUSD: decimal("license_fee_usd", { precision: 10, scale: 2 }),
  royaltyRate: decimal("royalty_rate", { precision: 5, scale: 2 }).notNull(), // Percentage
  isActive: boolean("is_active").default(true),
  faaSystemsIntegration: jsonb("faa_systems_integration").$type<string[]>(), // ClaimRoot, VaultPay, etc
  iconClass: varchar("icon_class"), // Font Awesome class
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const licenses = pgTable("licenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  brandId: uuid("brand_id").notNull().references(() => brands.id),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  licenseeId: varchar("licensee_id").notNull().references(() => users.id),
  scope: varchar("scope").notNull(), // local, regional, global
  geographicDivision: varchar("geographic_division").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  durationMonths: integer("duration_months").notNull(),
  masterFeeECR: decimal("master_fee_ecr", { precision: 10, scale: 2 }).notNull(),
  monthlyFeeECR: decimal("monthly_fee_ecr", { precision: 10, scale: 2 }).notNull(),
  totalCostECR: decimal("total_cost_ecr", { precision: 10, scale: 2 }).notNull(),
  royaltyRate: decimal("royalty_rate", { precision: 5, scale: 2 }).notNull(),
  status: varchar("status").notNull().default("pending"), // pending, active, expired, cancelled
  paymentStatus: varchar("payment_status").notNull().default("pending"), // pending, paid, overdue
  contractUrl: text("contract_url"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const brandMetrics = pgTable("brand_metrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  brandId: uuid("brand_id").notNull().references(() => brands.id),
  date: timestamp("date").notNull(),
  activeLicenses: integer("active_licenses").default(0),
  revenueECR: decimal("revenue_ecr", { precision: 12, scale: 2 }).default("0"),
  revenueUSD: decimal("revenue_usd", { precision: 12, scale: 2 }).default("0"),
  newLicenses: integer("new_licenses").default(0),
  renewals: integer("renewals").default(0),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const systemSettings = pgTable("system_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: varchar("key").notNull().unique(),
  value: text("value").notNull(),
  type: varchar("type").notNull(), // string, number, boolean, json
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// HSOMNI9000 ECOSYSTEM TABLES (imported from FruitfulPlanetChange repository)
// Separate namespace to avoid conflicts with FAA Brand Licensing system

export const hsomniSectors = pgTable("hsomni_sectors", {
  id: serial("id").primaryKey(),
  sectorKey: text("sector_key").notNull().unique(),
  name: text("name").notNull(),
  emoji: text("emoji").notNull(),
  description: text("description"),
  brandCount: integer("brand_count").default(0),
  subnodeCount: integer("subnode_count").default(0),
  price: text("price").default("88.00"),
  currency: text("currency").default("USD"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const hsomniBrands = pgTable("hsomni_brands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  sectorId: integer("sector_id").references(() => hsomniSectors.id),
  integration: text("integration").notNull(), // VaultMesh™, GridCore™, etc.
  status: text("status").notNull().default("active"),
  isCore: boolean("is_core").default(true),
  parentId: integer("parent_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const hsomniAdminPanelBrands = pgTable("hsomni_admin_panel_brands", {
  id: serial("id").primaryKey(),
  sectorKey: text("sector_key").notNull(),
  sectorName: text("sector_name").notNull(),
  sectorEmoji: text("sector_emoji").notNull(),
  brandName: text("brand_name").notNull(),
  subNodes: jsonb("sub_nodes").$type<string[]>().default([]),
  isCore: boolean("is_core").default(true),
  status: text("status").notNull().default("active"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// SEEDWAVE VERIFIED BRANDS TABLE (third ecosystem)
// Premium brands with advanced metadata and licensing features
export const seedwaveBrands = pgTable("seedwave_brands", {
  id: serial("id").primaryKey(),
  brandId: text("brand_id").notNull().unique(), // Original ID from source (01, 02, etc.)
  name: text("name").notNull(),
  sector: text("sector").notNull(), // SEEDWAVE VERIFIED BRANDS, SOAZA BRAND FAMILY, etc.
  subBrands: jsonb("sub_brands").$type<string[]>().default([]),
  faaSystemLinks: jsonb("faa_system_links").$type<string[]>().default([]),
  type: text("type").notNull(),
  masterLicenseFee: text("master_license_fee").notNull(),
  monthlyFee: text("monthly_fee").notNull(),
  royalty: text("royalty").notNull(),
  usePhrase: text("use_phrase"),
  omnidropKit: text("omnidrop_kit"),
  claimRoot: text("claim_root"),
  pulseTrade: text("pulse_trade"),
  vaultPay: text("vault_pay"),
  activationTime: text("activation_time"),
  ghostTrace: text("ghost_trace"),
  deploymentRegion: text("deployment_region"),
  familyBundle: text("family_bundle"),
  description: text("description"),
  tier: text("tier").notNull(), // Market, Operational, Dynastic, Sovereign
  status: text("status").notNull().default("active"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// HEALTHTRACK MODULE - Legacy integration from ancient codebase (pre-1984)
// Connects users to HSOMNI Health & Hygiene sector (465 brands)
export const healthTracks = pgTable("health_tracks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  hsomniHealthBrandId: integer("hsomni_health_brand_id").references(() => hsomniBrands.id),
  metricType: varchar("metric_type").notNull(), // vitals, appointments, medications, etc.
  value: text("value").notNull(),
  unit: varchar("unit"),
  recordedAt: timestamp("recorded_at").notNull(),
  vaultMeshId: text("vault_mesh_id"), // Integration ID for VaultMesh™
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const healthConnections = pgTable("health_connections", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  hsomniHealthBrandId: integer("hsomni_health_brand_id").notNull().references(() => hsomniBrands.id),
  connectionType: varchar("connection_type").notNull(), // provider, monitor, analytics, etc.
  status: varchar("status").notNull().default("active"), // active, paused, disconnected
  credentials: jsonb("credentials"), // Encrypted connection credentials
  lastSync: timestamp("last_sync"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  licenses: many(licenses),
  healthTracks: many(healthTracks),
  healthConnections: many(healthConnections),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  licenses: many(licenses),
}));

export const brandsRelations = relations(brands, ({ many }) => ({
  licenses: many(licenses),
  metrics: many(brandMetrics),
}));

export const licensesRelations = relations(licenses, ({ one }) => ({
  brand: one(brands, {
    fields: [licenses.brandId],
    references: [brands.id],
  }),
  organization: one(organizations, {
    fields: [licenses.organizationId],
    references: [organizations.id],
  }),
  licensee: one(users, {
    fields: [licenses.licenseeId],
    references: [users.id],
  }),
}));

export const brandMetricsRelations = relations(brandMetrics, ({ one }) => ({
  brand: one(brands, {
    fields: [brandMetrics.brandId],
    references: [brands.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  role: true,
  organizationId: true,
});

export const insertOrganizationSchema = createInsertSchema(organizations).pick({
  name: true,
  type: true,
  contactEmail: true,
});

export const insertBrandSchema = createInsertSchema(brands).pick({
  name: true,
  displayName: true,
  tier: true,
  description: true,
  category: true,
  geographicDivision: true,
  licenseFeeECR: true,
  licenseFeeUSD: true,
  royaltyRate: true,
  isActive: true,
  faaSystemsIntegration: true,
  iconClass: true,
  metadata: true,
});

export const insertLicenseSchema = createInsertSchema(licenses).pick({
  brandId: true,
  organizationId: true,
  licenseeId: true,
  scope: true,
  geographicDivision: true,
  startDate: true,
  endDate: true,
  durationMonths: true,
  masterFeeECR: true,
  monthlyFeeECR: true,
  totalCostECR: true,
  royaltyRate: true,
  status: true,
  paymentStatus: true,
  contractUrl: true,
  metadata: true,
});

export const insertHealthTrackSchema = createInsertSchema(healthTracks).pick({
  userId: true,
  hsomniHealthBrandId: true,
  metricType: true,
  value: true,
  unit: true,
  recordedAt: true,
  vaultMeshId: true,
  metadata: true,
});

export const insertHealthConnectionSchema = createInsertSchema(healthConnections).pick({
  userId: true,
  hsomniHealthBrandId: true,
  connectionType: true,
  status: true,
  credentials: true,
  metadata: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type Brand = typeof brands.$inferSelect;
export type InsertBrand = z.infer<typeof insertBrandSchema>;
export type License = typeof licenses.$inferSelect;
export type InsertLicense = z.infer<typeof insertLicenseSchema>;
export type BrandMetrics = typeof brandMetrics.$inferSelect;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type HealthTrack = typeof healthTracks.$inferSelect;
export type InsertHealthTrack = z.infer<typeof insertHealthTrackSchema>;
export type HealthConnection = typeof healthConnections.$inferSelect;
export type InsertHealthConnection = z.infer<typeof insertHealthConnectionSchema>;

// Enums for validation
export const BRAND_TIERS = ["sovereign", "dynastic", "operational", "market"] as const;
export const GEOGRAPHIC_DIVISIONS = ["A", "B", "C", "D", "E", "F", "G"] as const;
export const LICENSE_SCOPES = ["local", "regional", "global"] as const;
export const USER_ROLES = ["admin", "manager", "client", "viewer"] as const;
export const LICENSE_STATUSES = ["pending", "active", "expired", "cancelled"] as const;
export const PAYMENT_STATUSES = ["pending", "paid", "overdue"] as const;
