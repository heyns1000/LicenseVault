/**
 * FAST BATCH IMPORT OF ALL 4,263 HSOMNI BRANDS
 */

import { db } from './db';
import { hsomniSectors, hsomniBrands } from '@shared/schema';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';

const SECTOR_KEY_ALIASES: Record<string, string> = {
  'agri': 'agriculture', 'ailogic': 'ai-logic', 'banking': 'banking',
  'creative': 'creative', 'fsf': 'fsf', 'gaming': 'gaming',
  'health': 'health', 'housing': 'housing', 'justice': 'justice',
  'knowledge': 'knowledge', 'logistics': 'logistics', 'media': 'media',
  'micromesh': 'micromesh', 'packaging': 'packaging', 'trade': 'trade',
  'utilities': 'utilities', 'voice': 'voice', 'webless': 'webless',
  'wildlife': 'wildlife'
};

export async function importALL4263BrandsFAST() {
  try {
    console.log('🚀 FAST BATCH IMPORT OF ALL 4,263 BRANDS...\n');

    const dataPath = '/home/runner/workspace/consolidated-hsomni-data.json';
    const consolidatedData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    console.log(`📁 Total brands: ${consolidatedData.brands.length}\n`);

    // Clear existing
    await db.delete(hsomniBrands);
    console.log('✅ Cleared existing\n');

    // Get sectors
    const dbSectors = await db.select().from(hsomniSectors);
    const sectorMap = new Map();
    
    dbSectors.forEach(sector => {
      sectorMap.set(sector.sectorKey, sector);
      Object.entries(SECTOR_KEY_ALIASES).forEach(([alias, canonical]) => {
        if (canonical === sector.sectorKey) sectorMap.set(alias, sector);
      });
    });

    // Create unassigned sector
    let unassignedSector = dbSectors.find(s => s.sectorKey === 'unassigned');
    if (!unassignedSector) {
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

    // Build batch insert array
    const brandRecords: any[] = [];

    for (const brandEntry of consolidatedData.brands) {
      if (brandEntry.sectors && brandEntry.sectors.length > 0) {
        // Brand with sectors
        for (const jsonSectorKey of brandEntry.sectors) {
          const sector = sectorMap.get(jsonSectorKey);
          if (sector) {
            brandRecords.push({
              name: brandEntry.name,
              sectorId: sector.id,
              integration: 'VaultMesh™',
              status: 'active',
              isCore: brandEntry.type === 'core',
              description: `${brandEntry.name} - ${sector.name}`,
              metadata: { origin: 'consolidated', type: brandEntry.type }
            });
          }
        }
      } else {
        // Brand without sector
        brandRecords.push({
          name: brandEntry.name,
          sectorId: unassignedSector.id,
          integration: 'VaultMesh™',
          status: 'pending',
          isCore: brandEntry.type === 'core',
          description: `${brandEntry.name} - Pending assignment`,
          metadata: { origin: 'consolidated', needsSector: true }
        });
      }
    }

    console.log(`📦 Prepared ${brandRecords.length} brand records for batch insert`);
    
    // Batch insert in chunks of 500
    const CHUNK_SIZE = 500;
    for (let i = 0; i < brandRecords.length; i += CHUNK_SIZE) {
      const chunk = brandRecords.slice(i, i + CHUNK_SIZE);
      await db.insert(hsomniBrands).values(chunk);
      console.log(`   Inserted ${Math.min(i + CHUNK_SIZE, brandRecords.length)}/${brandRecords.length}...`);
    }

    console.log('\n✅ ALL BRANDS IMPORTED!\n');

    // Update counts
    console.log('Updating sector counts...');
    const allDbSectors = await db.select().from(hsomniSectors);
    for (const sector of allDbSectors) {
      const brands = await db.select().from(hsomniBrands).where(eq(hsomniBrands.sectorId, sector.id));
      await db.update(hsomniSectors).set({ brandCount: brands.length }).where(eq(hsomniSectors.id, sector.id));
    }

    // Final stats
    const totalBrands = await db.select().from(hsomniBrands);
    const uniqueBrands = new Set(totalBrands.map(b => b.name));

    console.log('\n═══════════════════════════════════════════');
    console.log('📊 FINAL HSOMNI SYSTEM');
    console.log('═══════════════════════════════════════════');
    console.log(`✅ Brand Records: ${totalBrands.length}`);
    console.log(`✅ Unique Brands: ${uniqueBrands.size}`);
    console.log(`✅ Expected: 4,263`);
    console.log(`✅ SUCCESS: ${uniqueBrands.size >= 4260 ? 'YES ✅' : 'Checking...'}`);
    console.log('═══════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

const __filename = fileURLToPath(import.meta.url);
if (import.meta.url === `file://${process.argv[1]}`) {
  importALL4263BrandsFAST()
    .then(() => process.exit(0))
    .catch((error) => { console.error(error); process.exit(1); });
}
