/**
 * EXPORT COMPLETE SEEDWAVE VERIFIED BRANDS TO JSON
 * All 150 premium brands with full metadata
 */

import * as fs from 'fs';
import { db } from './db';
import { seedwaveBrands } from '../shared/schema';

async function exportSeedwave() {
  console.log('📦 EXPORTING COMPLETE SEEDWAVE VERIFIED BRANDS...\n');
  
  const allBrands = await db.select().from(seedwaveBrands);
  
  console.log(`✅ Retrieved ${allBrands.length} brands from database`);
  
  // Organize by sector
  const sectors: Record<string, any[]> = {};
  const tiers: Record<string, any[]> = {};
  
  allBrands.forEach(brand => {
    if (!sectors[brand.sector]) sectors[brand.sector] = [];
    sectors[brand.sector].push(brand);
    
    if (!tiers[brand.tier]) tiers[brand.tier] = [];
    tiers[brand.tier].push(brand);
  });
  
  // Build complete export
  const exportData = {
    metadata: {
      systemName: 'SEEDWAVE VERIFIED BRANDS',
      exportDate: new Date().toISOString(),
      totalBrands: allBrands.length,
      auditStatus: 'Complete - Premium Brand System',
      breakdown: {
        byTier: {
          sovereign: tiers['Sovereign']?.length || 0,
          dynastic: tiers['Dynastic']?.length || 0,
          operational: tiers['Operational']?.length || 0,
          market: tiers['Market']?.length || 0
        },
        bySector: Object.fromEntries(
          Object.entries(sectors).map(([sector, brands]) => [sector, brands.length])
        )
      },
      sectors: Object.keys(sectors).length,
      features: [
        'Advanced licensing metadata',
        'FAA Systems integration',
        'Omnidrop Kit configurations',
        'PulseTrade activation',
        'VaultPay tiers',
        'GhostTrace security'
      ]
    },
    brands: allBrands.map(brand => ({
      id: brand.id,
      brandId: brand.brandId,
      name: brand.name,
      sector: brand.sector,
      tier: brand.tier,
      type: brand.type,
      masterLicenseFee: brand.masterLicenseFee,
      monthlyFee: brand.monthlyFee,
      royalty: brand.royalty,
      usePhrase: brand.usePhrase,
      omnidropKit: brand.omnidropKit,
      claimRoot: brand.claimRoot,
      pulseTrade: brand.pulseTrade,
      vaultPay: brand.vaultPay,
      activationTime: brand.activationTime,
      ghostTrace: brand.ghostTrace,
      deploymentRegion: brand.deploymentRegion,
      familyBundle: brand.familyBundle,
      description: brand.description,
      subBrands: brand.subBrands,
      faaSystemLinks: brand.faaSystemLinks,
      status: brand.status
    })),
    sectorBreakdown: Object.entries(sectors).map(([sectorName, brands]) => ({
      sectorName,
      brandCount: brands.length,
      brands: brands.map(b => ({ id: b.brandId, name: b.name, tier: b.tier }))
    })),
    tierBreakdown: Object.entries(tiers).map(([tierName, brands]) => ({
      tierName,
      brandCount: brands.length,
      brands: brands.map(b => ({ id: b.brandId, name: b.name, sector: b.sector }))
    }))
  };
  
  // Write to file
  const filename = '/home/runner/workspace/SEEDWAVE-VERIFIED-BRANDS-COMPLETE.json';
  fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
  
  console.log(`\n✅ EXPORT COMPLETE!`);
  console.log(`📁 File: ${filename}`);
  console.log(`📊 Size: ${(fs.statSync(filename).size / 1024).toFixed(2)} KB`);
  console.log(`\n✅ ${allBrands.length} SEEDWAVE VERIFIED brands exported with complete metadata`);
  
  process.exit(0);
}

exportSeedwave().catch(console.error);
