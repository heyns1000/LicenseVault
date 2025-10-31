/**
 * HSOMNI9000 Subnode Generator (Optimized Batch Version)
 * Batch inserts for faster processing
 */

import { db } from "./db";
import { hsomniSectors, hsomniBrands, hsomniAdminPanelBrands } from "@shared/schema";
import { sql } from "drizzle-orm";

export async function generateHSOMNISubnodesBatch() {
  console.log('🚀 Generating HSOMNI9000 subnodes (BATCH MODE)...');
  
  try {
    const allSectors = await db.select().from(hsomniSectors);
    const allAdminBrands = await db.select().from(hsomniAdminPanelBrands);
    
    // Check existing brands to avoid duplicates
    const existingBrands = await db.select().from(hsomniBrands);
    const existingNames = new Set(existingBrands.map(b => b.name));
    
    console.log(`📊 Sectors: ${allSectors.length}`);
    console.log(`📦 Total parent brands: ${allAdminBrands.length}`);
    console.log(`✅ Already imported: ${existingBrands.length}`);
    
    const subnodeTypes = ['Core', 'Engine', 'Gateway', 'Protocol'];
    const brandsToInsert = [];
    
    for (const adminBrand of allAdminBrands) {
      // Skip if already exists
      if (existingNames.has(adminBrand.brandName)) {
        continue;
      }
      
      const sector = allSectors.find(s => s.sectorKey === adminBrand.sectorKey);
      if (!sector) continue;
      
      // Add parent brand
      brandsToInsert.push({
        name: adminBrand.brandName,
        description: `${adminBrand.brandName} - Advanced ${adminBrand.sectorName} solution`,
        sectorId: sector.id,
        integration: brandsToInsert.length < 100 ? 'VaultMesh™' : 
                     brandsToInsert.length < 300 ? 'GridCore™' : 'Standard',
        status: 'active',
        isCore: adminBrand.isCore || false,
        parentId: null,
        metadata: {
          ...adminBrand.metadata,
          source: 'FruitfulPlanetChange',
          sectorEmoji: adminBrand.sectorEmoji,
          isParent: true
        }
      });
    }
    
    console.log(`📝 Preparing to insert ${brandsToInsert.length} new parent brands...`);
    
    if (brandsToInsert.length === 0) {
      console.log('✅ All parent brands already exist!');
      console.log('🔄 Now creating subnodes...');
    } else {
      // Batch insert parents (chunks of 50)
      const chunkSize = 50;
      for (let i = 0; i < brandsToInsert.length; i += chunkSize) {
        const chunk = brandsToInsert.slice(i, i + chunkSize);
        await db.insert(hsomniBrands).values(chunk);
        console.log(`  ✓ Inserted ${Math.min(i + chunkSize, brandsToInsert.length)}/${brandsToInsert.length} parents`);
      }
    }
    
    // Now create subnodes for ALL parents
    console.log('🔧 Generating subnodes for all parent brands...');
    const allParents = await db.select().from(hsomniBrands).where(sql`parent_id IS NULL`);
    
    const subnodesToInsert = [];
    for (const parent of allParents) {
      for (let i = 0; i < 4; i++) {
        const subnodeName = `${parent.name} ${subnodeTypes[i]}`;
        // Skip if already exists
        if (existingNames.has(subnodeName)) continue;
        
        subnodesToInsert.push({
          name: subnodeName,
          description: `${parent.name} specialized ${subnodeTypes[i].toLowerCase()} component`,
          sectorId: parent.sectorId,
          integration: 'SubNode™',
          status: 'active',
          isCore: false,
          parentId: parent.id,
          metadata: {
            tier: 'Subnode',
            category: 'Component',
            source: 'FruitfulPlanetChange',
            parentName: parent.name,
            component: subnodeTypes[i]
          }
        });
      }
    }
    
    console.log(`📝 Preparing to insert ${subnodesToInsert.length} subnodes...`);
    
    // Batch insert subnodes (chunks of 100)
    const subnodeChunkSize = 100;
    for (let i = 0; i < subnodesToInsert.length; i += subnodeChunkSize) {
      const chunk = subnodesToInsert.slice(i, i + subnodeChunkSize);
      await db.insert(hsomniBrands).values(chunk);
      console.log(`  ✓ Inserted ${Math.min(i + subnodeChunkSize, subnodesToInsert.length)}/${subnodesToInsert.length} subnodes`);
    }
    
    // Final count
    const finalCount = await db.execute(sql`
      SELECT 
        COUNT(*) as total_brands,
        COUNT(CASE WHEN parent_id IS NULL THEN 1 END) as parent_brands,
        COUNT(CASE WHEN parent_id IS NOT NULL THEN 1 END) as subnodes
      FROM hsomni_brands
    `);
    
    const stats = finalCount.rows[0];
    
    console.log('');
    console.log('🎉 HSOMNI9000 COMPLETE ECOSYSTEM IMPORTED!');
    console.log('═══════════════════════════════════════════');
    console.log(`✅ Parent Brands: ${stats.parent_brands}`);
    console.log(`✅ Subnodes: ${stats.subnodes}`);
    console.log(`✅ Total Brand Ecosystem: ${stats.total_brands}`);
    console.log('═══════════════════════════════════════════');
    
    return { success: true, ...stats };
    
  } catch (error) {
    console.error('💥 Batch generation failed:', error);
    throw error;
  }
}

// Auto-execute
if (import.meta.url === `file://${process.argv[1]}`) {
  generateHSOMNISubnodesBatch()
    .then((result) => {
      console.log('✅ Complete!', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed:', error);
      process.exit(1);
    });
}
