import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertBrandSchema, insertLicenseSchema } from "@shared/schema";
// import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/dashboard/metrics', isAuthenticated, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Get single brand by ID
  app.get('/api/brands/:id', isAuthenticated, async (req, res) => {
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
  app.get('/api/brands', isAuthenticated, async (req, res) => {
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

  app.get('/api/brands/:id', isAuthenticated, async (req, res) => {
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

  app.post('/api/brands', isAuthenticated, async (req: any, res) => {
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
  app.post('/api/licenses', isAuthenticated, async (req: any, res) => {
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

  app.get('/api/licenses/user/:userId', isAuthenticated, async (req: any, res) => {
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
  app.post('/api/calculate-license', isAuthenticated, async (req, res) => {
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
  app.get('/api/water-the-seed/status', isAuthenticated, async (req, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
