/**
 * EXPORT COMPLETE FAA™ BRAND SYSTEM TO JSON
 * All 7,044 brands with full metadata
 */

import * as fs from 'fs';
import { db } from './db';
import { brands } from '../shared/schema';

async function exportFAA() {
  console.log('📦 EXPORTING COMPLETE FAA™ BRAND SYSTEM...\n');
  
  const allBrands = await db.select().from(brands);
  
  console.log(`✅ Retrieved ${allBrands.length} brands from database`);
  
  // Organize by tier
  const byTier = {
    sovereign: allBrands.filter(b => b.tier === 'sovereign'),
    dynastic: allBrands.filter(b => b.tier === 'dynastic'),
    operational: allBrands.filter(b => b.tier === 'operational'),
    market: allBrands.filter(b => b.tier === 'market')
  };
  
  // Build complete export
  const exportData = {
    metadata: {
      systemName: 'FAA™ Brand Licensing System',
      exportDate: new Date().toISOString(),
      totalBrands: allBrands.length,
      auditStatus: 'Complete - Pre-Repository Data',
      breakdown: {
        sovereign: byTier.sovereign.length,
        dynastic: byTier.dynastic.length,
        operational: byTier.operational.length,
        market: byTier.market.length
      },
      geographicDivisions: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
      currencies: ['ECR', 'USD']
    },
    brands: allBrands.map(brand => ({
      id: brand.id,
      name: brand.name,
      displayName: brand.displayName,
      tier: brand.tier,
      category: brand.category,
      geographicDivision: brand.geographicDivision,
      licenseFeeECR: brand.licenseFeeECR,
      licenseFeeUSD: brand.licenseFeeUSD,
      royaltyRate: brand.royaltyRate,
      isActive: brand.isActive,
      faaSystemsIntegration: brand.faaSystemsIntegration,
      description: brand.description,
      iconClass: brand.iconClass,
      metadata: brand.metadata
    })),
    tierBreakdown: {
      sovereign: byTier.sovereign.map(b => ({ id: b.id, name: b.name, displayName: b.displayName, licenseFeeECR: b.licenseFeeECR })),
      dynastic: byTier.dynastic.map(b => ({ id: b.id, name: b.name, displayName: b.displayName, licenseFeeECR: b.licenseFeeECR })),
      operational: byTier.operational.map(b => ({ id: b.id, name: b.name, displayName: b.displayName, licenseFeeECR: b.licenseFeeECR })),
      market: byTier.market.map(b => ({ id: b.id, name: b.name, displayName: b.displayName, licenseFeeECR: b.licenseFeeECR }))
    }
  };
  
  // Write to file
  const filename = '/home/runner/workspace/FAA-BRAND-SYSTEM-COMPLETE.json';
  fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
  
  console.log(`\n✅ EXPORT COMPLETE!`);
  console.log(`📁 File: ${filename}`);
  console.log(`📊 Size: ${(fs.statSync(filename).size / 1024).toFixed(2)} KB`);
  console.log(`\n✅ ${allBrands.length} FAA™ brands exported with complete metadata`);
  
  process.exit(0);
}

exportFAA().catch(console.error);
