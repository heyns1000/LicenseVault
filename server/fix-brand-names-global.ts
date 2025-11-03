import { db } from "./db";
import { brands } from "@shared/schema";
import { sql } from "drizzle-orm";

// OFFICIAL AUDIT: 13,713 brands total
// FAA™: 7,344 | HSOMNI9000: 6,219 | Seedwave: 150

const faaSystemPrefixes = [
  "AUREUM", "SOLV", "LION", "AURA", "GLYPH", "VAULT", "DESIGN", "BARE",
  "CLAIM", "GHOST", "PULSE", "VAULT", "STREAM", "FRAME", "ROOT", "CART",
  "TRACE", "MIND", "SKIN", "CRATE", "PATH", "WAVE", "SEED", "BLOOM",
  "CROWN", "REIGN", "THRONE", "EMPIRE", "DOMAIN", "LEGACY", "DYNASTY",
  "SOVEREIGN", "KING", "QUEEN", "PRINCE", "DUKE", "LORD", "BARON",
  "NEXUS", "PRIME", "APEX", "VERTEX", "ZENITH", "SUMMIT", "PEAK"
];

const faaSystemSuffixes = [
  "PATH", "MIND", "STREAM", "CRATE", "FRAME", "SKIN", "ROOT", "CART",
  "VAULT", "TRACE", "PULSE", "WAVE", "CORE", "TECH", "SYNC", "FLOW",
  "MESH", "GRID", "LINK", "NODE", "NEXUS", "PRIME", "APEX", "EDGE",
  "HUB", "GATE", "PORT", "BASE", "FORT", "KEEP", "HOLD", "SHIELD"
];

const hsomniPrefixes = [
  "QUANTUM", "NEURAL", "CYBER", "TECHNO", "DIGI", "NANO", "BIO", "GEO",
  "AGRO", "HYDRO", "AERO", "ASTRO", "ECO", "SOLAR", "WIND", "FUSION",
  "PLASMA", "CRYSTAL", "MATRIX", "VECTOR", "DELTA", "OMEGA", "ALPHA",
  "BETA", "GAMMA", "THETA", "SIGMA", "EPSILON", "ZETA", "KAPPA"
];

const hsomniSuffixes = [
  "LOGIC", "GRID", "FLOW", "PACK", "HEALTH", "HYGIE", "HOUSE", "BUILD",
  "FOOD", "FARM", "SOIL", "WATER", "ENERGY", "POWER", "TRANS", "MOVE",
  "COMM", "LINK", "TRADE", "BANK", "FINANCE", "INVEST", "INSURE", "LEGAL"
];

const seedwavePrefixes = [
  "SEED", "BLOOM", "HARVEST", "GARDEN", "FOREST", "MEADOW", "GROVE",
  "ORCHARD", "FIELD", "CROP", "PLANT", "TREE", "FLOWER", "LEAF"
];

function generateBrandName(index: number, ecosystem: 'faa' | 'hsomni' | 'seedwave'): { name: string; displayName: string } {
  if (ecosystem === 'faa') {
    const prefix = faaSystemPrefixes[index % faaSystemPrefixes.length];
    const suffix = faaSystemSuffixes[Math.floor(index / faaSystemPrefixes.length) % faaSystemSuffixes.length];
    const number = String(index + 1).padStart(4, '0');
    
    return {
      name: `${prefix}_${suffix}_${number}`,
      displayName: `${prefix} ${suffix}™`
    };
  } else if (ecosystem === 'hsomni') {
    const prefix = hsomniPrefixes[index % hsomniPrefixes.length];
    const suffix = hsomniSuffixes[Math.floor(index / hsomniPrefixes.length) % hsomniSuffixes.length];
    const number = String(index + 1).padStart(4, '0');
    
    return {
      name: `HSOMNI_${prefix}_${suffix}_${number}`,
      displayName: `${prefix} ${suffix}™`
    };
  } else {
    const prefix = seedwavePrefixes[index % seedwavePrefixes.length];
    const number = String(index + 1).padStart(3, '0');
    
    return {
      name: `SEEDWAVE_${prefix}_${number}`,
      displayName: `${prefix}WAVE™`
    };
  }
}

export async function fixBrandNamesGlobal() {
  console.log("🔧 GLOBAL BRAND NAME AUDIT INJECTION STARTING...");
  console.log("━".repeat(60));
  
  try {
    // Get all brands ordered by creation
    const allBrands = await db.select().from(brands).orderBy(brands.createdAt);
    console.log(`📊 Found ${allBrands.length} total brands in database`);
    
    // Count brands with generic names
    const genericCount = allBrands.filter(b => 
      b.displayName && (b.displayName.startsWith('Brand ') || b.displayName === 'ALPHA CORE™' || b.displayName === 'BETA TECH™')
    ).length;
    console.log(`⚠️  ${genericCount} brands have generic/placeholder names`);
    
    let updated = 0;
    let faaCount = 0;
    let hsomniCount = 0;
    let seedwaveCount = 0;
    
    // Official audit distribution
    const FAA_TARGET = 7344;
    const HSOMNI_TARGET = 6219;
    const SEEDWAVE_TARGET = 150;
    
    for (let i = 0; i < allBrands.length; i++) {
      const brand = allBrands[i];
      
      // Skip if already has proper non-generic name
      if (brand.displayName && 
          !brand.displayName.startsWith('Brand ') && 
          brand.displayName !== 'ALPHA CORE™' &&
          brand.displayName !== 'BETA TECH™' &&
          brand.displayName !== 'GAMMA SYNC™' &&
          brand.displayName !== 'ALPHA TECH™' &&
          brand.displayName !== 'BETA SYNC™' &&
          !brand.name.startsWith('ALPHA_') &&
          !brand.name.startsWith('BETA_') &&
          !brand.name.startsWith('GAMMA_') &&
          !brand.name.startsWith('DELTA_') &&
          !brand.name.startsWith('EPSILON_')) {
        continue;
      }
      
      // Determine ecosystem based on target distribution
      let ecosystem: 'faa' | 'hsomni' | 'seedwave';
      let ecosystemIndex: number;
      
      if (faaCount < FAA_TARGET) {
        ecosystem = 'faa';
        ecosystemIndex = faaCount;
        faaCount++;
      } else if (hsomniCount < HSOMNI_TARGET) {
        ecosystem = 'hsomni';
        ecosystemIndex = hsomniCount;
        hsomniCount++;
      } else if (seedwaveCount < SEEDWAVE_TARGET) {
        ecosystem = 'seedwave';
        ecosystemIndex = seedwaveCount;
        seedwaveCount++;
      } else {
        // If we exceed targets, continue with FAA
        ecosystem = 'faa';
        ecosystemIndex = faaCount;
        faaCount++;
      }
      
      const { name, displayName } = generateBrandName(ecosystemIndex, ecosystem);
      
      // Update brand with new name
      await db.update(brands)
        .set({ 
          name, 
          displayName,
          updatedAt: new Date()
        })
        .where(sql`${brands.id} = ${brand.id}`);
      
      updated++;
      
      if (updated % 100 === 0) {
        console.log(`✅ Updated ${updated}/${allBrands.length} brands...`);
      }
    }
    
    console.log("━".repeat(60));
    console.log("✅ GLOBAL BRAND NAME AUDIT INJECTION COMPLETE");
    console.log(`📊 Total brands updated: ${updated}`);
    console.log(`🏢 FAA™ Brands: ${faaCount}`);
    console.log(`🤖 HSOMNI9000 Brands: ${hsomniCount}`);
    console.log(`🌱 Seedwave Brands: ${seedwaveCount}`);
    console.log(`📈 Total ecosystem: ${faaCount + hsomniCount + seedwaveCount}`);
    console.log("━".repeat(60));
    
  } catch (error) {
    console.error("❌ Error fixing brand names:", error);
    throw error;
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fixBrandNamesGlobal()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
