import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./replitAuth";
import { insertBrandSchema, insertLicenseSchema, insertHealthTrackSchema, insertHealthConnectionSchema, healthTracks, healthConnections, hsomniBrands, hsomniSectors } from "@shared/schema";
// import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";
import { z } from "zod";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware - TEMPORARILY DISABLED (auth env vars not configured)
  // await setupAuth(app);
  
  // TEMPORARY: Mock auth bypass middleware
  app.use((req: any, res, next) => {
    req.user = {
      claims: {
        sub: 'demo-user-123',
        email: 'demo@faa-licensing.com',
        first_name: 'Demo',
        last_name: 'User'
      }
    };
    next();
  });

  // Auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard metrics
  app.get('/api/dashboard/metrics', async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Get single brand by ID
  app.get('/api/brands/:id', async (req, res) => {
    try {
      const { id } = req.params;
      console.log('Fetching brand with ID:', id);
      
      const brand = await storage.getBrand(id);
      if (!brand) {
        return res.status(404).json({ error: 'Brand not found' });
      }
      
      res.json(brand);
    } catch (error) {
      console.error('Error fetching brand:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Brand routes  
  app.get('/api/brands', async (req, res) => {
    try {
      // Parse filters from query parameters - they come in as JSON strings from the frontend
      let filters = {};
      try {
        // Extract filter parameters from the stringified query
        const queryString = new URLSearchParams(req.url?.split('?')[1] || '').toString();
        console.log('Raw query string:', queryString);
        
        // Parse individual parameters
        const { tier, division, search, limit = 50, offset = 0 } = req.query;
        
        // Handle tier filter (can be JSON array string)
        let tierFilter = undefined;
        if (tier) {
          try {
            tierFilter = typeof tier === 'string' && tier.startsWith('[') ? JSON.parse(tier) : [tier];
          } catch {
            tierFilter = Array.isArray(tier) ? tier : [tier as string];
          }
        }
        
        // Handle division filter (can be JSON array string)  
        let divisionFilter = undefined;
        if (division) {
          try {
            divisionFilter = typeof division === 'string' && division.startsWith('[') ? JSON.parse(division) : [division];
          } catch {
            divisionFilter = Array.isArray(division) ? division : [division as string];
          }
        }
        
        filters = {
          tier: tierFilter,
          division: divisionFilter,
          search: search as string || undefined,
          limit: Number(limit),
          offset: Number(offset),
        };
        
        console.log('Parsed filters:', filters);
      } catch (parseError) {
        console.error('Error parsing filters:', parseError);
        filters = { limit: 50, offset: 0 };
      }

      const result = await storage.getAllBrands(filters);
      console.log('Brands result:', { total: result.total, returned: result.brands.length });
      
      res.json(result);
    } catch (error) {
      console.error("Error fetching brands:", error);
      res.status(500).json({ message: "Failed to fetch brands" });
    }
  });

  app.get('/api/brands/:id', async (req, res) => {
    try {
      const { id } = req.params;
      console.log('Fetching brand with ID:', id, 'Type:', typeof id);
      
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        console.log('Invalid UUID format:', id);
        return res.status(400).json({ message: "Invalid brand ID format" });
      }
      
      const brand = await storage.getBrand(id);
      if (!brand) {
        return res.status(404).json({ message: "Brand not found" });
      }
      
      res.json(brand);
    } catch (error) {
      console.error("Error fetching brand:", error);
      res.status(500).json({ message: "Failed to fetch brand" });
    }
  });

  app.post('/api/brands', async (req: any, res) => {
    try {
      // Check if user has admin or manager role
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !['admin', 'manager'].includes(user.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const validatedData = insertBrandSchema.parse(req.body);
      const brand = await storage.createBrand(validatedData);
      res.status(201).json(brand);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating brand:", error);
      res.status(500).json({ message: "Failed to create brand" });
    }
  });

  // License routes
  app.post('/api/licenses', async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const validatedData = insertLicenseSchema.parse({
        ...req.body,
        licenseeId: userId,
      });

      const license = await storage.createLicense(validatedData);
      res.status(201).json(license);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating license:", error);
      res.status(500).json({ message: "Failed to create license" });
    }
  });

  app.get('/api/licenses/user/:userId', async (req: any, res) => {
    try {
      const requestingUserId = req.user.claims.sub;
      const targetUserId = req.params.userId;

      // Users can only view their own licenses unless they're admin/manager
      const user = await storage.getUser(requestingUserId);
      if (requestingUserId !== targetUserId && !['admin', 'manager'].includes(user?.role || '')) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const licenses = await storage.getUserLicenses(targetUserId);
      res.json(licenses);
    } catch (error) {
      console.error("Error fetching user licenses:", error);
      res.status(500).json({ message: "Failed to fetch user licenses" });
    }
  });

  // License calculator
  app.post('/api/calculate-license', async (req, res) => {
    try {
      const { brandId, scope, geographicDivision, durationMonths } = req.body;

      const brand = await storage.getBrand(brandId);
      if (!brand) {
        return res.status(404).json({ message: "Brand not found" });
      }

      // Calculate pricing based on scope and duration
      let scopeMultiplier = 1;
      switch (scope) {
        case 'regional':
          scopeMultiplier = 1.5;
          break;
        case 'global':
          scopeMultiplier = 2.5;
          break;
      }

      // Geographic division pricing adjustments
      const divisionMultipliers: Record<string, number> = {
        'A': 1.2, // North America
        'B': 1.1, // Europe
        'C': 1.0, // Asia-Pacific
        'D': 0.9, // MENA
        'E': 0.8, // Sub-Saharan Africa
        'F': 0.85, // LATAM
        'G': 2.0, // Interstellar
      };

      const divisionMultiplier = divisionMultipliers[geographicDivision] || 1.0;
      
      const masterFee = Number(brand.licenseFeeECR) * scopeMultiplier * divisionMultiplier;
      const monthlyFee = masterFee * 0.05; // 5% of master fee per month
      const totalMonthlyCost = monthlyFee * durationMonths;
      const totalCost = masterFee + totalMonthlyCost;

      // Convert to USD (example rate)
      const ecrToUsdRate = 3.4;
      const totalCostUSD = totalCost * ecrToUsdRate;

      res.json({
        brandName: brand.displayName,
        tier: brand.tier,
        masterFeeECR: masterFee.toFixed(2),
        monthlyFeeECR: monthlyFee.toFixed(2),
        totalMonthlyCostECR: totalMonthlyCost.toFixed(2),
        totalCostECR: totalCost.toFixed(2),
        totalCostUSD: totalCostUSD.toFixed(2),
        royaltyRate: brand.royaltyRate,
        scope,
        geographicDivision,
        durationMonths,
        calculations: {
          scopeMultiplier,
          divisionMultiplier,
          ecrToUsdRate,
        }
      });
    } catch (error) {
      console.error("Error calculating license:", error);
      res.status(500).json({ message: "Failed to calculate license" });
    }
  });

  // Water The Seed Protocol - Brand growth tracking
  app.get('/api/water-the-seed/status', async (req, res) => {
    try {
      // Get current brand growth metrics
      const metrics = await storage.getDashboardMetrics();
      
      res.json({
        isActive: true,
        newBrands72h: metrics.newBrands72h,
        totalBrands: 4643 + metrics.newBrands72h,
        targetBrands: 9000,
        progress: ((4643 + metrics.newBrands72h) / 9000) * 100,
        nextSeedwave: "SEEDWAVE 04: DESIGN SOVEREIGNTY",
        eta: "34 hours"
      });
    } catch (error) {
      console.error("Error fetching Water The Seed status:", error);
      res.status(500).json({ message: "Failed to fetch protocol status" });
    }
  });

  // HEALTHTRACK MODULE (Ancient integration - pre-1984 legacy)
  // Connects to HSOMNI Health & Hygiene sector (465 brands)
  
  app.get('/api/healthtrack/brands', async (req, res) => {
    try {
      const healthBrands = await db.select()
        .from(hsomniBrands)
        .innerJoin(hsomniSectors, eq(hsomniBrands.sectorId, hsomniSectors.id))
        .where(eq(hsomniSectors.sectorKey, 'health'));
      
      res.json({ brands: healthBrands.map(b => b.hsomni_brands) });
    } catch (error) {
      console.error("Error fetching health brands:", error);
      res.status(500).json({ message: "Failed to fetch health brands" });
    }
  });

  app.get('/api/healthtrack/metrics', async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const metrics = await db.select()
        .from(healthTracks)
        .where(eq(healthTracks.userId, userId))
        .orderBy(desc(healthTracks.recordedAt))
        .limit(100);
      
      res.json({ metrics });
    } catch (error) {
      console.error("Error fetching health metrics:", error);
      res.status(500).json({ message: "Failed to fetch health metrics" });
    }
  });

  app.post('/api/healthtrack/metrics', async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertHealthTrackSchema.parse({
        ...req.body,
        userId,
        recordedAt: new Date(),
      });
      
      const [metric] = await db.insert(healthTracks).values(validatedData).returning();
      res.status(201).json(metric);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating health metric:", error);
      res.status(500).json({ message: "Failed to create health metric" });
    }
  });

  app.post('/api/healthtrack/connect', async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertHealthConnectionSchema.parse({
        ...req.body,
        userId,
      });
      
      const [connection] = await db.insert(healthConnections).values(validatedData).returning();
      res.status(201).json(connection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating health connection:", error);
      res.status(500).json({ message: "Failed to create health connection" });
    }
  });

  // PayPal routes (commenting out for now until PayPal credentials are provided)
  /*
  app.get("/paypal/setup", async (req, res) => {
    await loadPaypalDefault(req, res);
  });

  app.post("/paypal/order", async (req, res) => {
    // Request body should contain: { intent, amount, currency }
    await createPaypalOrder(req, res);
  });

  app.post("/paypal/order/:orderID/capture", async (req, res) => {
    await capturePaypalOrder(req, res);
  });
  */

  // Generate License Agreement
  app.post('/api/generate-license-agreement', async (req, res) => {
    try {
      const { brandId, calculationData } = req.body;
      
      if (!brandId || !calculationData) {
        return res.status(400).json({ error: 'Brand ID and calculation data are required' });
      }

      const brand = await storage.getBrand(brandId);
      if (!brand) {
        return res.status(404).json({ error: 'Brand not found' });
      }

      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Generate license agreement document
      const agreementData = {
        agreementId: `LIC-${Date.now()}-${brandId.slice(0, 8)}`,
        generatedDate: new Date().toISOString(),
        brand: {
          name: brand.displayName,
          tier: brand.tier,
          category: brand.category,
          geographicDivision: brand.geographicDivision
        },
        licensee: {
          name: user?.displayName || user?.email || 'Licensed Entity',
          email: user?.email || 'N/A',
          organizationId: user?.organizationId
        },
        terms: {
          masterFeeECR: calculationData.masterFeeECR,
          monthlyFeeECR: calculationData.monthlyFeeECR,
          totalCostECR: calculationData.totalCostECR,
          totalCostUSD: calculationData.totalCostUSD,
          royaltyRate: calculationData.royaltyRate,
          scope: calculationData.scope,
          durationMonths: calculationData.durationMonths
        },
        faaSystemsIncluded: [
          'ClaimRoot™ IP Management',
          'VaultPay™ Payment Processing', 
          'GhostTrace™ Security Layer',
          'PulseTrade™ Transaction Engine'
        ],
        effectiveDate: new Date().toISOString(),
        expirationDate: new Date(Date.now() + (calculationData.durationMonths * 30 * 24 * 60 * 60 * 1000)).toISOString(),
        status: 'draft'
      };

      res.json({
        success: true,
        agreement: agreementData,
        downloadUrl: `/api/download-license-agreement/${agreementData.agreementId}`
      });
    } catch (error) {
      console.error('Error generating license agreement:', error);
      res.status(500).json({ error: 'Failed to generate license agreement' });
    }
  });

  // Download License Agreement
  app.get('/api/download-license-agreement/:agreementId', async (req, res) => {
    try {
      const { agreementId } = req.params;
      
      // Generate comprehensive license agreement document
      const agreementText = `
FAA™ BRAND LICENSING AGREEMENT
==============================

Agreement ID: ${agreementId}
Generated: ${new Date().toLocaleString()}

This License Agreement ("Agreement") is entered into between FAA™ Brand Licensing System ("Licensor") and the undersigned party ("Licensee") for the use of branded intellectual property within the FAA™ ecosystem.

ARTICLE I - GRANT OF LICENSE
The Licensor hereby grants to Licensee a non-exclusive license to use the specified brand assets in accordance with the terms and conditions set forth herein.

ARTICLE II - INCLUDED FAA™ SYSTEMS
This license includes access to the following integrated systems:
• ClaimRoot™ IP Management
• VaultPay™ Payment Processing
• GhostTrace™ Security Layer
• PulseTrade™ Transaction Engine

ARTICLE III - FINANCIAL TERMS
All fees are calculated using the Enterprise Credit Rating (ECR) system at current exchange rates.

ARTICLE IV - COMPLIANCE
Licensee agrees to maintain compliance with all FAA™ brand standards and guidelines throughout the license term.

ARTICLE V - TERMINATION
This Agreement may be terminated in accordance with the standard FAA™ licensing termination procedures.

---
This is a system-generated draft agreement. 
Final terms subject to legal review and formal execution.

Generated by FAA™ Brand Licensing System
Enterprise Management Platform
      `.trim();

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="FAA-License-Agreement-${agreementId}.txt"`);
      res.send(agreementText);
    } catch (error) {
      console.error('Error downloading license agreement:', error);
      res.status(500).json({ error: 'Failed to download license agreement' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
