import { db } from "./db";
import { brands } from "@shared/schema";
import { sql } from "drizzle-orm";

// OFFICIAL AUDIT: 13,713 brands total
// FAA™: 7,344 | HSOMNI9000: 6,219 | Seedwave: 150

const faaSystemPrefixes = [
  "AUREUM", "SOLV", "LION", "AURA", "GLYPH", "VAULT", "DESIGN", "BARE",
  "CLAIM", "GHOST", "PULSE", "STREAM", "FRAME", "ROOT", "CART",
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

export async function fixBrandNamesBatch() {
  console.log("🔧 BATCH BRAND NAME AUDIT INJECTION STARTING...");
  console.log("━".repeat(60));
  
  try {
    // Get only brands with generic names - MUCH FASTER
    const genericBrands = await db.select().from(brands)
      .where(sql`${brands.displayName} LIKE 'Brand %' OR ${brands.name} LIKE 'ALPHA_%' OR ${brands.name} LIKE 'BETA_%' OR ${brands.name} LIKE 'GAMMA_%' OR ${brands.name} LIKE 'DELTA_%' OR ${brands.name} LIKE 'EPSILON_%'`)
      .orderBy(brands.createdAt);
      
    console.log(`📊 Found ${genericBrands.length} brands needing name updates`);
    
    // Official audit distribution
    const FAA_TARGET = 7344;
    const HSOMNI_TARGET = 6219;
    const SEEDWAVE_TARGET = 150;
    
    let faaCount = 0;
    let hsomniCount = 0;
    let seedwaveCount = 0;
    
    // Prepare batch updates
    const updates = [];
    
    for (let i = 0; i < genericBrands.length; i++) {
      const brand = genericBrands[i];
      
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
      
      updates.push({
        id: brand.id,
        name,
        displayName
      });
    }
    
    console.log(`🔄 Executing ${updates.length} batch updates...`);
    
    // Execute all updates as RAW SQL for maximum speed
    for (let i = 0; i < updates.length; i += 500) {
      const batch = updates.slice(i, i + 500);
      
      // Build CASE statement for batch update
      const caseWhenName = batch.map(u => `WHEN '${u.id}' THEN '${u.name}'`).join(' ');
      const caseWhenDisplay = batch.map(u => `WHEN '${u.id}' THEN '${u.displayName.replace(/'/g, "''")}'`).join(' ');
      const ids = batch.map(u => `'${u.id}'`).join(',');
      
      await db.execute(sql.raw(`
        UPDATE brands
        SET 
          name = CASE id ${caseWhenName} END,
          display_name = CASE id ${caseWhenDisplay} END,
          updated_at = NOW()
        WHERE id IN (${ids})
      `));
      
      console.log(`✅ Batch ${Math.floor(i/500) + 1}/${Math.ceil(updates.length/500)} complete`);
    }
    
    console.log("━".repeat(60));
    console.log("✅ BATCH BRAND NAME AUDIT INJECTION COMPLETE");
    console.log(`📊 Total brands updated: ${updates.length}`);
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
  fixBrandNamesBatch()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
