/**
 * EXPORT COMPLETE HSOMNI9000 REPOSITORY AUDIT TO JSON
 * All 6,219 brands with sectors, CORE/SUBNODE classification, parent relationships
 */

import * as fs from 'fs';
import { db } from './db';
import { hsomniBrands, hsomniSectors } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function exportHSOMNI() {
  console.log('📦 EXPORTING COMPLETE HSOMNI9000 REPOSITORY AUDIT...\n');
  
  // Get all sectors
  const allSectors = await db.select().from(hsomniSectors);
  console.log(`✅ Retrieved ${allSectors.length} sectors`);
  
  // Get all brands
  const allBrands = await db.select().from(hsomniBrands);
  console.log(`✅ Retrieved ${allBrands.length} brands`);
  
  // Build sector map with brands
  const sectorsWithBrands = [];
  
  for (const sector of allSectors) {
    const sectorBrands = allBrands.filter(b => b.sectorId === sector.id);
    const coreBrands = sectorBrands.filter(b => b.isCore);
    const subnodes = sectorBrands.filter(b => !b.isCore);
    
    // Build parent-child relationships
    const brandTree = coreBrands.map(core => {
      const children = subnodes.filter(sub => sub.parentId === core.id);
      return {
        vaultMeshId: core.id,
        brandName: core.name,
        description: core.description,
        integration: core.integration,
        status: core.status,
        isCore: true,
        subnodes: children.map(child => ({
          vaultMeshId: child.id,
          brandName: child.name,
          description: child.description,
          integration: child.integration,
          status: child.status,
          parentVaultId: child.parentId
        }))
      };
    });
    
    sectorsWithBrands.push({
      sectorKey: sector.sectorKey,
      sectorName: sector.name,
      emoji: sector.emoji,
      description: sector.description,
      coreCount: sector.brandCount || 0,
      subnodeCount: sector.subnodeCount || 0,
      totalCount: (sector.brandCount || 0) + (sector.subnodeCount || 0),
      brands: brandTree
    });
  }
  
  // Build complete export
  const exportData = {
    metadata: {
      systemName: 'HSOMNI9000 Sector Management System',
      sourceRepository: 'FruitfulPlanetChange (GitHub)',
      exportDate: new Date().toISOString(),
      auditDate: '2025-10-31',
      auditStatus: 'Complete - Repository Verified',
      totalSectors: allSectors.length,
      populatedSectors: sectorsWithBrands.filter(s => s.totalCount > 0).length,
      totalBrands: allBrands.length,
      breakdown: {
        coreBrands: allBrands.filter(b => b.isCore).length,
        subnodes: allBrands.filter(b => !b.isCore).length
      },
      vaultMeshIdRange: {
        min: Math.min(...allBrands.map(b => b.id)),
        max: Math.max(...allBrands.map(b => b.id))
      }
    },
    sectors: sectorsWithBrands,
    statistics: {
      top10Sectors: sectorsWithBrands
        .filter(s => s.totalCount > 0)
        .sort((a, b) => b.totalCount - a.totalCount)
        .slice(0, 10)
        .map(s => ({
          sectorName: s.sectorName,
          emoji: s.emoji,
          core: s.coreCount,
          subnodes: s.subnodeCount,
          total: s.totalCount
        })),
      emptySectors: sectorsWithBrands
        .filter(s => s.totalCount === 0)
        .map(s => ({
          sectorKey: s.sectorKey,
          sectorName: s.sectorName,
          emoji: s.emoji
        }))
    }
  };
  
  // Write to file
  const filename = '/home/runner/workspace/HSOMNI9000-REPOSITORY-AUDIT-COMPLETE.json';
  fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
  
  console.log(`\n✅ EXPORT COMPLETE!`);
  console.log(`📁 File: ${filename}`);
  console.log(`📊 Size: ${(fs.statSync(filename).size / 1024).toFixed(2)} KB`);
  console.log(`\n✅ ${allBrands.length} HSOMNI9000 brands exported with complete sector mapping`);
  console.log(`✅ ${sectorsWithBrands.filter(s => s.totalCount > 0).length} sectors populated`);
  console.log(`✅ ${sectorsWithBrands.filter(s => s.totalCount === 0).length} sectors ready for development`);
  
  process.exit(0);
}

exportHSOMNI().catch(console.error);
