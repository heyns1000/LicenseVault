/**
 * IMPORT ALL 4,263 HSOMNI BRANDS
 * Includes brands with AND without sector assignments
 */

import { db } from './db';
import { hsomniSectors, hsomniBrands } from '@shared/schema';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';

// Sector key alias mapping
const SECTOR_KEY_ALIASES: Record<string, string> = {
  'agri': 'agriculture',
  'ailogic': 'ai-logic',
  'banking': 'banking',
  'creative': 'creative',
  'fsf': 'fsf',
  'gaming': 'gaming',
  'health': 'health',
  'housing': 'housing',
  'justice': 'justice',
  'knowledge': 'knowledge',
  'logistics': 'logistics',
  'media': 'media',
  'micromesh': 'micromesh',
  'packaging': 'packaging',
  'trade': 'trade',
  'utilities': 'utilities',
  'voice': 'voice',
  'webless': 'webless',
  'wildlife': 'wildlife'
};

export async function importALL4263Brands() {
  try {
    console.log('🚀 IMPORTING ALL 4,263 HSOMNI BRANDS...\n');

    // Load consolidated data
    const dataPath = '/home/runner/workspace/consolidated-hsomni-data.json';
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const consolidatedData = JSON.parse(rawData);

    console.log(`📁 Total brands in file: ${consolidatedData.brands.length}`);
    
    const withSectors = consolidatedData.brands.filter((b: any) => b.sectors && b.sectors.length > 0);
    const withoutSectors = consolidatedData.brands.filter((b: any) => !b.sectors || b.sectors.length === 0);
    
    console.log(`📁 Brands WITH sectors: ${withSectors.length}`);
    console.log(`📁 Brands WITHOUT sectors: ${withoutSectors.length}\n`);

    // Clear existing brand data
    await db.delete(hsomniBrands);
    console.log('✅ Cleared existing brand data\n');

    // Get all sectors from database
    const dbSectors = await db.select().from(hsomniSectors);
    const sectorMap = new Map<string, typeof dbSectors[0]>();
    
    // Map canonical keys AND aliases
    dbSectors.forEach(sector => {
      sectorMap.set(sector.sectorKey, sector);
      Object.entries(SECTOR_KEY_ALIASES).forEach(([alias, canonical]) => {
        if (canonical === sector.sectorKey) {
          sectorMap.set(alias, sector);
        }
      });
    });

    // Create or find "Unassigned" sector for brands without sectors
    let unassignedSector = dbSectors.find(s => s.sectorKey === 'unassigned');
    if (!unassignedSector) {
      console.log('Creating "Unassigned" sector for brands without sector mappings...');
      const [created] = await db.insert(hsomniSectors).values({
        sectorKey: 'unassigned',
        name: 'Unassigned Brands',
        emoji: '📋',
        description: 'Brands pending sector assignment',
        brandCount: 0,
        subnodeCount: 0
      }).returning();
      unassignedSector = created;
      console.log('✅ Created Unassigned sector\n');
    }

    let imported = 0;
    let unassignedCount = 0;

    // Import ALL brands
    for (const brandEntry of consolidatedData.brands) {
      if (brandEntry.sectors && brandEntry.sectors.length > 0) {
        // Brand HAS sector assignments - create one record per sector
        for (const jsonSectorKey of brandEntry.sectors) {
          const sector = sectorMap.get(jsonSectorKey);
          
          if (sector) {
            await db.insert(hsomniBrands).values({
              name: brandEntry.name,
              sectorId: sector.id,
              integration: 'VaultMesh™',
              status: 'active',
              isCore: brandEntry.type === 'core',
              description: `${brandEntry.name} - ${sector.name} solution`,
              metadata: { 
                origin: 'consolidated', 
                type: brandEntry.type,
                originalSectorKey: jsonSectorKey 
              }
            });
            imported++;
          }
        }
      } else {
        // Brand has NO sector assignment - add to "Unassigned"
        await db.insert(hsomniBrands).values({
          name: brandEntry.name,
          sectorId: unassignedSector.id,
          integration: 'VaultMesh™',
          status: 'pending',
          isCore: brandEntry.type === 'core',
          description: `${brandEntry.name} - Pending sector assignment`,
          metadata: { 
            origin: 'consolidated', 
            type: brandEntry.type,
            needsSectorAssignment: true 
          }
        });
        unassignedCount++;
      }
    }

    console.log(`✅ Imported ${imported} brands WITH sector assignments`);
    console.log(`✅ Imported ${unassignedCount} brands to Unassigned sector`);
    console.log(`✅ TOTAL: ${imported + unassignedCount} brands imported\n`);

    // Update ALL sector counts
    const allDbSectors = await db.select().from(hsomniSectors);
    for (const sector of allDbSectors) {
      const allBrands = await db
        .select()
        .from(hsomniBrands)
        .where(eq(hsomniBrands.sectorId, sector.id));
      
      const subnodeBrands = allBrands.filter(b => !b.isCore);
      
      await db
        .update(hsomniSectors)
        .set({
          brandCount: allBrands.length,
          subnodeCount: subnodeBrands.length
        })
        .where(eq(hsomniSectors.id, sector.id));
    }

    console.log('✅ Updated all sector brand counts\n');

    // Final verification
    const totalBrands = await db.select().from(hsomniBrands);
    const uniqueBrands = new Set(totalBrands.map(b => b.name));

    console.log('═══════════════════════════════════════════');
    console.log('📊 COMPLETE 4,263 BRAND IMPORT');
    console.log('═══════════════════════════════════════════');
    console.log(`✅ Total Brand Records: ${totalBrands.length}`);
    console.log(`✅ Unique Brand Names: ${uniqueBrands.size}`);
    console.log(`✅ Expected: 4,263 brands`);
    console.log(`✅ Match: ${uniqueBrands.size === 4263 ? 'YES ✅' : 'NO - investigating...'}`);
    console.log('═══════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error importing ALL brands:', error);
    throw error;
  }
}

// Run if executed directly
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (import.meta.url === `file://${process.argv[1]}`) {
  importALL4263Brands()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
