/**
 * HSOMNI9000 Subnode Generator
 * Creates 4 subnodes for each parent brand to complete the 3,794+ brand ecosystem
 */

import { db } from "./db";
import { hsomniSectors, hsomniBrands, hsomniAdminPanelBrands } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function generateHSOMNISubnodes() {
  console.log('🚀 Generating HSOMNI9000 subnodes...');
  
  try {
    // Get all sectors
    const allSectors = await db.select().from(hsomniSectors);
    console.log(`📊 Found ${allSectors.length} sectors`);
    
    // Get all parent brands from admin panel
    const allAdminBrands = await db.select().from(hsomniAdminPanelBrands);
    console.log(`📦 Found ${allAdminBrands.length} parent brands`);
    
    let totalParentBrands = 0;
    let totalSubnodes = 0;
    
    // For each parent brand, create entry in hsomni_brands + 4 subnodes
    for (const adminBrand of allAdminBrands) {
      // Find the sector ID
      const sector = allSectors.find(s => s.sectorKey === adminBrand.sectorKey);
      if (!sector) {
        console.log(`⚠️  Sector not found for ${adminBrand.brandName}`);
        continue;
      }
      
      // Create parent brand
      const [parentBrand] = await db.insert(hsomniBrands).values({
        name: adminBrand.brandName,
        description: `${adminBrand.brandName} - Advanced ${adminBrand.sectorName} solution`,
        sectorId: sector.id,
        integration: totalParentBrands < 100 ? 'VaultMesh™' : 
                     totalParentBrands < 300 ? 'GridCore™' : 'Standard',
        status: 'active',
        isCore: adminBrand.isCore || false,
        parentId: null,
        metadata: {
          ...adminBrand.metadata,
          source: 'FruitfulPlanetChange',
          sectorEmoji: adminBrand.sectorEmoji
        }
      }).returning();
      
      totalParentBrands++;
      
      // Create 4 subnodes for each parent
      const subnodeTypes = ['Core', 'Engine', 'Gateway', 'Protocol'];
      for (let i = 0; i < 4; i++) {
        await db.insert(hsomniBrands).values({
          name: `${adminBrand.brandName} ${subnodeTypes[i]}`,
          description: `${adminBrand.brandName} specialized ${subnodeTypes[i].toLowerCase()} component`,
          sectorId: sector.id,
          integration: 'SubNode™',
          status: 'active',
          isCore: false,
          parentId: parentBrand.id,
          metadata: {
            tier: 'Subnode',
            category: 'Component',
            source: 'FruitfulPlanetChange',
            parentName: adminBrand.brandName,
            component: subnodeTypes[i],
            sectorEmoji: adminBrand.sectorEmoji
          }
        });
        totalSubnodes++;
      }
      
      if (totalParentBrands % 100 === 0) {
        console.log(`  ✓ Processed ${totalParentBrands} parent brands...`);
      }
    }
    
    const totalBrands = totalParentBrands + totalSubnodes;
    
    console.log('');
    console.log('🎉 HSOMNI9000 SUBNODE GENERATION COMPLETE!');
    console.log('═══════════════════════════════════════════');
    console.log(`✅ Parent Brands Created: ${totalParentBrands}`);
    console.log(`✅ Subnodes Generated: ${totalSubnodes} (4 per parent)`);
    console.log(`✅ Total Brand Ecosystem: ${totalBrands} brands`);
    console.log(`🗄️  Table: hsomni_brands`);
    console.log('═══════════════════════════════════════════');
    
    return { success: true, totalParentBrands, totalSubnodes, totalBrands };
    
  } catch (error) {
    console.error('💥 Subnode generation failed:', error);
    throw error;
  }
}

// Auto-execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateHSOMNISubnodes()
    .then((result) => {
      console.log('✅ Generation completed:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Generation failed:', error);
      process.exit(1);
    });
}
