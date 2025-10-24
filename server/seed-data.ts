import { storage } from "./storage";
import { BRAND_TIERS, GEOGRAPHIC_DIVISIONS } from "@shared/schema";

// Real brand data based on user's assets
const sampleBrands = [
  {
    name: "FRUITFUL",
    displayName: "Fruitful™",
    tier: "market" as const,
    description: "If you don't like the fruits you are growing, change the seeds...",
    category: "Lifestyle & Wellness",
    geographicDivision: "A" as const,
    licenseFeeECR: "3950.00",
    licenseFeeUSD: "13430.00",
    royaltyRate: "7.00",
    isActive: true,
    faaSystemsIntegration: ["ClaimRoot™", "VaultPay™"],
    iconClass: "fas fa-seedling",
    metadata: {
      marketSegment: "Global Wellness Markets",
      specialFeatures: ["Brand Philosophy", "Lifestyle Integration"],
      brandColors: ["#FF6B6B", "#4ECDC4", "#FFE66D"]
    }
  },
  {
    name: "LIONS_SEEDWAVE",
    displayName: "The Lion's Seedwave™",
    tier: "sovereign" as const,
    description: "Advanced Brand Bloodline Sovereignty Analysis",
    category: "Strategic Consulting",
    geographicDivision: "A" as const,
    licenseFeeECR: "18800.00",
    licenseFeeUSD: "63920.00",
    royaltyRate: "27.00",
    isActive: true,
    faaSystemsIntegration: ["ClaimRoot™", "VaultPay™", "GhostTrace™", "PulseTrade™"],
    iconClass: "fas fa-crown",
    metadata: {
      marketSegment: "Sovereign Markets Only",
      specialFeatures: ["Bloodline Analysis", "Sovereignty Metrics"],
      brandPhilosophy: "Strategic brand sovereignty through analytical precision"
    }
  },
  {
    name: "WATER_THE_SEED",
    displayName: "Water The Seed™",
    tier: "operational" as const,
    description: "Active Growth Protocol & Brand Development System",
    category: "Growth Technology",
    geographicDivision: "A" as const,
    licenseFeeECR: "7700.00",
    licenseFeeUSD: "26180.00",
    royaltyRate: "19.00",
    isActive: true,
    faaSystemsIntegration: ["ClaimRoot™", "VaultPay™", "GhostTrace™"],
    iconClass: "fas fa-tint",
    metadata: {
      marketSegment: "Global Growth Markets",
      specialFeatures: ["Growth Analytics", "Brand Development", "Active Protocol"]
    }
  },
  {
    name: "CLAIMROOT",
    displayName: "ClaimRoot™",
    tier: "dynastic" as const,
    description: "Core Authentication & Verification System",
    category: "Security Technology",
    geographicDivision: "A" as const,
    licenseFeeECR: "12000.00",
    licenseFeeUSD: "40800.00",
    royaltyRate: "22.00",
    isActive: true,
    faaSystemsIntegration: ["ClaimRoot™", "VaultPay™", "GhostTrace™"],
    iconClass: "fas fa-shield-alt",
    metadata: {
      marketSegment: "Security & Authentication",
      specialFeatures: ["Identity Verification", "Core Security"]
    }
  },
  {
    name: "VAULTPAY",
    displayName: "VaultPay™",
    tier: "operational" as const,
    description: "Secure Payment Processing & Vault Management",
    category: "Financial Technology",
    geographicDivision: "B" as const,
    licenseFeeECR: "8500.00",
    licenseFeeUSD: "28900.00",
    royaltyRate: "18.50",
    isActive: true,
    faaSystemsIntegration: ["ClaimRoot™", "VaultPay™"],
    iconClass: "fas fa-vault",
    metadata: {
      marketSegment: "Global Payment Solutions",
      specialFeatures: ["Secure Transactions", "Vault Management"]
    }
  },
  {
    name: "GHOSTTRACE",
    displayName: "GhostTrace™",
    tier: "operational" as const,
    description: "Advanced Analytics & Tracking Protocol",
    category: "Analytics Technology",
    geographicDivision: "C" as const,
    licenseFeeECR: "6800.00",
    licenseFeeUSD: "23120.00",
    royaltyRate: "16.00",
    isActive: true,
    faaSystemsIntegration: ["ClaimRoot™", "GhostTrace™"],
    iconClass: "fas fa-ghost",
    metadata: {
      marketSegment: "Analytics & Tracking",
      specialFeatures: ["Advanced Analytics", "Stealth Tracking"]
    }
  },
  {
    name: "PULSETRADE",
    displayName: "PulseTrade™",
    tier: "market" as const,
    description: "Real-time Trading & Market Pulse System",
    category: "Trading Technology",
    geographicDivision: "D" as const,
    licenseFeeECR: "4200.00",
    licenseFeeUSD: "14280.00",
    royaltyRate: "9.50",
    isActive: true,
    faaSystemsIntegration: ["ClaimRoot™", "VaultPay™", "PulseTrade™"],
    iconClass: "fas fa-heartbeat",
    metadata: {
      marketSegment: "Trading & Markets",
      specialFeatures: ["Real-time Trading", "Market Analytics"]
    }
  }
];

// Generate additional brands to reach 4,643 total
const generateAdditionalBrands = () => {
  const additionalBrands = [];
  const prefixes = ["ALPHA", "BETA", "GAMMA", "DELTA", "EPSILON", "ZETA", "ETA", "THETA", "IOTA", "KAPPA"];
  const suffixes = ["CORE", "TECH", "SYNC", "FLOW", "MESH", "GRID", "LINK", "NODE", "WAVE", "PULSE"];
  const categories = ["Technology", "Finance", "Healthcare", "Education", "Retail", "Manufacturing", "Energy", "Transport"];
  
  for (let i = 0; i < 4636; i++) { // 4636 + 7 real brands = 4643 total
    const prefix = prefixes[i % prefixes.length];
    const suffix = suffixes[Math.floor(i / prefixes.length) % suffixes.length];
    const name = `${prefix}_${suffix}_${String(i + 1).padStart(4, '0')}`;
    const displayName = `${prefix} ${suffix}™`;
    
    // Distribute across tiers realistically
    let tier: typeof BRAND_TIERS[number];
    let licenseFee: string;
    let royalty: string;
    
    if (i < 127) { // Sovereign: 127 brands
      tier = "sovereign";
      licenseFee = (15000 + Math.random() * 10000).toFixed(2);
      royalty = (25 + Math.random() * 5).toFixed(2);
    } else if (i < 1019) { // Dynastic: 892 brands (127 + 892 = 1019)
      tier = "dynastic";
      licenseFee = (8000 + Math.random() * 6000).toFixed(2);
      royalty = (18 + Math.random() * 6).toFixed(2);
    } else if (i < 3486) { // Operational: 2467 brands (1019 + 2467 = 3486)
      tier = "operational";
      licenseFee = (5000 + Math.random() * 4000).toFixed(2);
      royalty = (12 + Math.random() * 8).toFixed(2);
    } else { // Market: 1150 brands (3486 + 1150 = 4636)
      tier = "market";
      licenseFee = (2000 + Math.random() * 3000).toFixed(2);
      royalty = (5 + Math.random() * 5).toFixed(2);
    }
    
    const division = GEOGRAPHIC_DIVISIONS[i % GEOGRAPHIC_DIVISIONS.length];
    const category = categories[i % categories.length];
    
    additionalBrands.push({
      name,
      displayName,
      tier,
      description: `Advanced ${category.toLowerCase()} solution for modern enterprises`,
      category,
      geographicDivision: division,
      licenseFeeECR: licenseFee,
      licenseFeeUSD: (parseFloat(licenseFee) * 3.4).toFixed(2),
      royaltyRate: royalty,
      isActive: true,
      faaSystemsIntegration: ["ClaimRoot™", "VaultPay™"],
      iconClass: "fas fa-cube",
      metadata: {
        marketSegment: `Division ${division} Markets`,
        specialFeatures: ["Standard Integration", "Core Features"]
      }
    });
  }
  
  return additionalBrands;
};

// Seed the database
export async function seedDatabase() {
  try {
    console.log("🌱 Starting database seed...");
    
    // Combine real brands with generated ones
    const allBrands = [...sampleBrands, ...generateAdditionalBrands()];
    console.log(`📊 Generated ${allBrands.length} brands total`);
    
    // Create brands in batches to avoid overwhelming the database
    const batchSize = 100;
    for (let i = 0; i < allBrands.length; i += batchSize) {
      const batch = allBrands.slice(i, i + batchSize);
      console.log(`📦 Processing batch ${Math.ceil((i + 1) / batchSize)} of ${Math.ceil(allBrands.length / batchSize)}`);
      
      for (const brandData of batch) {
        try {
          await storage.createBrand(brandData as any);
        } catch (error) {
          // Skip if brand already exists
          if (!error.message?.includes('duplicate') && !error.message?.includes('unique')) {
            console.error(`Error creating brand ${brandData.displayName}:`, error);
          }
        }
      }
    }
    
    console.log("✅ Database seed completed successfully!");
    console.log(`🎯 Total brands seeded: ${allBrands.length}`);
    console.log("🌟 Featured brands include: Fruitful™, The Lion's Seedwave™, Water The Seed™");
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seed if called directly (ES module compatible)
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log("🎉 Seed complete! Exiting...");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seed failed:", error);
      process.exit(1);
    });
}