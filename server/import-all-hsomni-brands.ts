/**
 * COMPLETE HSOMNI BRAND IMPORT WITH SECTOR KEY ALIAS MAPPING
 * Fixes the 776 vs 4,263 brand count discrepancy
 */

import { db } from './db';
import { hsomniSectors, hsomniBrands } from '@shared/schema';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

// Sector key alias mapping: JSON keys → Database keys
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

export async function importAllHsomniBrands() {
  try {
    console.log('🚀 IMPORTING ALL HSOMNI BRANDS WITH ALIAS MAPPING...\n');

    // Load consolidated data
    const dataPath = '/home/runner/workspace/consolidated-hsomni-data.json';
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const consolidatedData = JSON.parse(rawData);

    console.log(`📁 Loaded: ${consolidatedData.brands.length} brands from consolidated file`);
    console.log(`📁 Sectors in file: ${consolidatedData.sectors.length}\n`);

    // Clear existing brand data (keep sectors)
    await db.delete(hsomniBrands);
    console.log('✅ Cleared existing brand data\n');

    // Get all sectors from database and create mapping
    const dbSectors = await db.select().from(hsomniSectors);
    const sectorMap = new Map<string, typeof dbSectors[0]>();
    
    // Map both canonical keys AND aliases
    dbSectors.forEach(sector => {
      sectorMap.set(sector.sectorKey, sector);
      
      // Add reverse alias mapping
      Object.entries(SECTOR_KEY_ALIASES).forEach(([alias, canonical]) => {
        if (canonical === sector.sectorKey) {
          sectorMap.set(alias, sector);
        }
      });
    });

    console.log(`📊 Mapped ${sectorMap.size} sector keys (including aliases)\n`);

    // Import all brands
    let imported = 0;
    let skipped = 0;
    const skippedSectors = new Set<string>();

    for (const brandEntry of consolidatedData.brands) {
      // For each sector this brand belongs to
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
        } else {
          skipped++;
          skippedSectors.add(jsonSectorKey);
        }
      }
    }

    console.log(`✅ Imported ${imported} brand-sector associations`);
    if (skipped > 0) {
      console.log(`⚠️  Skipped ${skipped} associations (unknown sectors: ${[...skippedSectors].join(', ')})`);
    }
    console.log('');

    // Update sector brand counts
    for (const sector of dbSectors) {
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

    console.log('✅ Updated sector brand counts\n');

    // Final verification
    const totalBrands = await db.select().from(hsomniBrands);
    const uniqueBrands = new Set(totalBrands.map(b => b.name));
    const populatedSectors = dbSectors.filter(s => s.brandCount > 0);

    console.log('═══════════════════════════════════════════');
    console.log('📊 COMPLETE HSOMNI IMPORT RESULTS');
    console.log('═══════════════════════════════════════════');
    console.log(`✅ Total Brand Associations: ${totalBrands.length}`);
    console.log(`✅ Unique Brand Names: ${uniqueBrands.size}`);
    console.log(`✅ Populated Sectors: ${populatedSectors.length}/${dbSectors.length}`);
    console.log('═══════════════════════════════════════════\n');

    // Show top sectors
    const sortedSectors = dbSectors
      .filter(s => s.brandCount > 0)
      .sort((a, b) => b.brandCount - a.brandCount)
      .slice(0, 10);

    console.log('🏆 TOP 10 SECTORS BY BRAND COUNT:');
    sortedSectors.forEach((s, i) => {
      console.log(`${i + 1}. ${s.emoji} ${s.name}: ${s.brandCount} brands`);
    });
    console.log('');

  } catch (error) {
    console.error('❌ Error importing brands:', error);
    throw error;
  }
}

// Run if executed directly
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (import.meta.url === `file://${process.argv[1]}`) {
  importAllHsomniBrands()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
