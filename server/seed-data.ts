import { storage } from "./storage";
import { BRAND_TIERS, GEOGRAPHIC_DIVISIONS } from "@shared/schema";

// Sample brand data matching the design reference
const sampleBrands = [
  {
    name: "AUREUM_PATH",
    displayName: "AUREUM PATH™",
    tier: "sovereign" as const,
    description: "Legacy Scroll / Wealthline Expansion",
    category: "Wealth Management",
    geographicDivision: "A" as const,
    licenseFeeECR: "18800.00",
    licenseFeeUSD: "63920.00",
    royaltyRate: "27.00",
    isActive: true,
    faaSystemsIntegration: ["ClaimRoot™", "VaultPay™", "GhostTrace™", "GoldShield™"],
    iconClass: "fas fa-crown",
    metadata: {
      marketSegment: "Sovereign Markets Only",
      specialFeatures: ["Legacy Integration", "Wealth Analytics"]
    }
  },
  {
    name: "SOLVEMIND",
    displayName: "SOLVEMIND™",
    tier: "dynastic" as const,
    description: "Cognitive Tools / Strategy Scroll",
    category: "AI Strategy",
    geographicDivision: "B" as const,
    licenseFeeECR: "12000.00",
    licenseFeeUSD: "40800.00",
    royaltyRate: "22.00",
    isActive: true,
    faaSystemsIntegration: ["ClaimRoot™", "VaultPay™", "AI Core"],
    iconClass: "fas fa-chess-king",
    metadata: {
      marketSegment: "Baobab West ∆ + OuterZone",
      specialFeatures: ["Cognitive Analytics", "Strategy Engine"]
    }
  },
  {
    name: "LIONSTREAM",
    displayName: "LIONSTREAM™",
    tier: "operational" as const,
    description: "Cultural Broadcast Engine / Scroll TV",
    category: "Media Technology",
    geographicDivision: "C" as const,
    licenseFeeECR: "7700.00",
    licenseFeeUSD: "26180.00",
    royaltyRate: "19.00",
    isActive: true,
    faaSystemsIntegration: ["ClaimRoot™", "VaultPay™", "Live 9s"],
    iconClass: "fas fa-broadcast-tower",
    metadata: {
      marketSegment: "Global + MetaCast",
      specialFeatures: ["Live Streaming", "Cultural Analytics"]
    }
  },
  {
    name: "AURACRATE",
    displayName: "AURACRATE™",
    tier: "market" as const,
    description: "Sensory-Encoded Packaging (Ritual-Aware)",
    category: "Smart Packaging",
    geographicDivision: "E" as const,
    licenseFeeECR: "3950.00",
    licenseFeeUSD: "13430.00",
    royaltyRate: "7.00",
    isActive: true,
    faaSystemsIntegration: ["ClaimRoot™", "AuraIndex"],
    iconClass: "fas fa-leaf",
    metadata: {
      marketSegment: "Herbal Divs, LSM+ Markets",
      specialFeatures: ["Sensory Integration", "Ritual Analytics"]
    }
  },
  {
    name: "GLYPHFRAME",
    displayName: "GLYPHFRAME™",
    tier: "operational" as const,
    description: "Creative Stack Tool / AI-integrated Design",
    category: "Design Software",
    geographicDivision: "A" as const,
    licenseFeeECR: "9400.00",
    licenseFeeUSD: "31960.00",
    royaltyRate: "17.00",
    isActive: true,
    faaSystemsIntegration: ["ClaimRoot™", "VaultPay™", "AI SyncPort"],
    iconClass: "fas fa-microchip",
    metadata: {
      marketSegment: "North VaultMesh + MetaScroll",
      specialFeatures: ["AI Design Tools", "Creative Analytics"]
    }
  },
  {
    name: "VAULTSKIN",
    displayName: "VAULTSKIN™",
    tier: "market" as const,
    description: "Digital Identity Overlay Layer",
    category: "Identity Management",
    geographicDivision: "B" as const,
    licenseFeeECR: "4800.00",
    licenseFeeUSD: "16320.00",
    royaltyRate: "9.00",
    isActive: true,
    faaSystemsIntegration: ["ClaimRoot™", "VaultPay™", "GhostTrace™"],
    iconClass: "fas fa-shield",
    metadata: {
      marketSegment: "Div B, E, Digital Retail Grid",
      specialFeatures: ["Identity Overlay", "Digital Security"]
    }
  },
  // Additional brands to reach realistic numbers
  {
    name: "DESIGNROOT",
    displayName: "DESIGNROOT™",
    tier: "operational" as const,
    description: "Multi-format Creative Platform",
    category: "Design Software",
    geographicDivision: "A" as const,
    licenseFeeECR: "8500.00",
    licenseFeeUSD: "28900.00",
    royaltyRate: "15.00",
    isActive: true,
    faaSystemsIntegration: ["ClaimRoot™", "VaultPay™"],
    iconClass: "fas fa-palette",
    metadata: {
      marketSegment: "Creative Professionals",
      specialFeatures: ["Multi-format Support", "Creative Suite"]
    }
  },
  {
    name: "BARECART",
    displayName: "BARECART™",
    tier: "market" as const,
    description: "Stripped-down Retail Kiosk Model",
    category: "Micro-Retail",
    geographicDivision: "E" as const,
    licenseFeeECR: "2800.00",
    licenseFeeUSD: "9520.00",
    royaltyRate: "5.00",
    isActive: true,
    faaSystemsIntegration: ["ClaimRoot™", "PulseTrade™"],
    iconClass: "fas fa-shopping-cart",
    metadata: {
      marketSegment: "Micro-Entrepreneur Ecosystem",
      specialFeatures: ["Minimal Setup", "Mobile Retail"]
    }
  }
];

// Generate additional brands to reach 4,643 total
const generateAdditionalBrands = () => {
  const additionalBrands = [];
  const prefixes = ["ALPHA", "BETA", "GAMMA", "DELTA", "EPSILON", "ZETA", "ETA", "THETA", "IOTA", "KAPPA"];
  const suffixes = ["CORE", "TECH", "SYNC", "FLOW", "MESH", "GRID", "LINK", "NODE", "WAVE", "PULSE"];
  const categories = ["Technology", "Finance", "Healthcare", "Education", "Retail", "Manufacturing", "Energy", "Transport"];
  
  for (let i = 0; i < 4635; i++) {
    const prefix = prefixes[i % prefixes.length];
    const suffix = suffixes[Math.floor(i / prefixes.length) % suffixes.length];
    const name = `${prefix}_${suffix}_${i + 1}`;
    const displayName = `${prefix} ${suffix}™`;
    
    // Distribute across tiers realistically
    let tier: typeof BRAND_TIERS[number];
    let licenseFee: string;
    let royalty: string;
    
    if (i < 10) {
      tier = "sovereign";
      licenseFee = (15000 + Math.random() * 10000).toFixed(2);
      royalty = (25 + Math.random() * 5).toFixed(2);
    } else if (i < 30) {
      tier = "dynastic";
      licenseFee = (8000 + Math.random() * 6000).toFixed(2);
      royalty = (18 + Math.random() * 6).toFixed(2);
    } else if (i < 70) {
      tier = "operational";
      licenseFee = (5000 + Math.random() * 4000).toFixed(2);
      royalty = (12 + Math.random() * 8).toFixed(2);
    } else {
      tier = "market";
      licenseFee = (2000 + Math.random() * 3000).toFixed(2);
      royalty = (5 + Math.random() * 5).toFixed(2);
    }
    
    additionalBrands.push({
      name: name,
      displayName: displayName,
      tier: tier,
      description: `Advanced ${categories[i % categories.length]} Solution`,
      category: categories[i % categories.length],
      geographicDivision: GEOGRAPHIC_DIVISIONS[i % GEOGRAPHIC_DIVISIONS.length],
      licenseFeeECR: licenseFee,
      licenseFeeUSD: (Number(licenseFee) * 3.4).toFixed(2),
      royaltyRate: royalty,
      isActive: true,
      faaSystemsIntegration: ["ClaimRoot™", "VaultPay™"],
      iconClass: "fas fa-certificate",
      metadata: {
        marketSegment: "Global Markets",
        specialFeatures: ["Standard Integration"]
      }
    });
  }
  
  return additionalBrands;
};

export async function seedDatabase() {
  try {
    console.log("Starting database seeding...");
    
    // Create sample organization
    const organization = await storage.createOrganization({
      name: "FAA Global Licensing Corp",
      type: "enterprise",
      contactEmail: "licensing@faa-global.com"
    });
    
    console.log("Created sample organization:", organization.id);
    
    // Seed the main featured brands
    console.log("Seeding featured brands...");
    for (const brandData of sampleBrands) {
      try {
        await storage.createBrand(brandData);
        console.log(`Created brand: ${brandData.displayName}`);
      } catch (error) {
        console.error(`Error creating brand ${brandData.displayName}:`, error);
      }
    }
    
    // Seed additional brands
    console.log("Seeding additional brands...");
    const additionalBrands = generateAdditionalBrands();
    for (const brandData of additionalBrands) {
      try {
        await storage.createBrand(brandData);
      } catch (error) {
        console.error(`Error creating brand ${brandData.displayName}:`, error);
      }
    }
    
    // Set system settings for Water The Seed Protocol
    await storage.setSystemSetting("water_the_seed_active", "true", "boolean", "Water The Seed Protocol Status");
    await storage.setSystemSetting("target_brands", "9000", "number", "Target number of brands for Water The Seed Protocol");
    await storage.setSystemSetting("growth_rate_72h", "82", "number", "Brand growth in last 72 hours");
    
    console.log("Database seeding completed successfully!");
    
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log("Seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}
