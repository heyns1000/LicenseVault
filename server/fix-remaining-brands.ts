import { db } from "./db";
import { brands } from "@shared/schema";
import { sql } from "drizzle-orm";

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

async function fixRemainingBrands() {
  console.log("🔧 FIXING REMAINING 'Brand N™' NAMES...");
  
  // Get all brands with "Brand X™" pattern
  const genericBrands = await db.select().from(brands)
    .where(sql`${brands.displayName} LIKE 'Brand %'`)
    .orderBy(brands.createdAt);
    
  console.log(`📊 Found ${genericBrands.length} brands to fix`);
  
  const updates = [];
  
  for (let i = 0; i < genericBrands.length; i++) {
    const brand = genericBrands[i];
    const prefix = faaSystemPrefixes[i % faaSystemPrefixes.length];
    const suffix = faaSystemSuffixes[Math.floor(i / faaSystemPrefixes.length) % faaSystemSuffixes.length];
    const number = String(i + 6000).padStart(4, '0'); // Start from 6000 to avoid conflicts
    
    const name = `${prefix}_${suffix}_${number}`;
    const displayName = `${prefix} ${suffix}™`;
    
    updates.push({
      id: brand.id,
      name,
      displayName
    });
  }
  
  console.log(`🔄 Executing ${updates.length} updates...`);
  
  // Batch update
  for (let i = 0; i < updates.length; i += 500) {
    const batch = updates.slice(i, i + 500);
    
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
    
    console.log(`✅ Updated ${Math.min((i + 500), updates.length)}/${updates.length}`);
  }
  
  console.log("✅ ALL 'Brand N™' NAMES FIXED");
}

fixRemainingBrands()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
