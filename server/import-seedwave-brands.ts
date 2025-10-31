/**
 * IMPORT COMPLETE SEEDWAVE VERIFIED BRANDS TO DATABASE
 * Third ecosystem: 150 premium brands with advanced metadata
 */

import * as fs from 'fs';
import { db } from './db';
import { seedwaveBrands } from '../shared/schema';

interface SeedwaveBrand {
  id: string;
  name: string;
  sector: string;
  subBrands: string[];
  faaSystemLinks: string[];
  type: string;
  masterLicenseFee: string;
  monthlyFee: string;
  royalty: string;
  usePhrase?: string;
  omnidropKit?: string;
  claimRoot?: string;
  pulseTrade?: string;
  vaultPay?: string;
  activationTime?: string;
  ghostTrace?: string;
  deploymentRegion?: string;
  familyBundle?: string;
  description?: string;
  tier: string;
}

async function importSeedwave() {
  console.log('🌱 IMPORTING SEEDWAVE VERIFIED BRANDS...\n');
  
  // Read source file
  const sourceFile = 'attached_assets/Pasted--id-01-name-PRIMAL-WELL-sector-SEEDWAVE-VERIFIED-BRANDS--1761949201288_1761949201290.txt';
  const rawData = fs.readFileSync(sourceFile, 'utf8');
  const brands: SeedwaveBrand[] = JSON.parse(rawData);
  
  console.log(`✅ Parsed ${brands.length} brands from source file`);
  
  // Count by sector
  const sectors: Record<string, number> = {};
  const tiers: Record<string, number> = {};
  
  brands.forEach(brand => {
    sectors[brand.sector] = (sectors[brand.sector] || 0) + 1;
    tiers[brand.tier] = (tiers[brand.tier] || 0) + 1;
  });
  
  console.log('\n📊 BREAKDOWN BY SECTOR:');
  Object.entries(sectors).forEach(([sector, count]) => {
    console.log(`  - ${sector}: ${count} brands`);
  });
  
  console.log('\n📊 BREAKDOWN BY TIER:');
  Object.entries(tiers).forEach(([tier, count]) => {
    console.log(`  - ${tier}: ${count} brands`);
  });
  
  // Import brands to database
  console.log('\n💾 Importing to database...');
  
  let imported = 0;
  for (const brand of brands) {
    try {
      await db.insert(seedwaveBrands).values({
        brandId: brand.id,
        name: brand.name,
        sector: brand.sector,
        subBrands: brand.subBrands || [],
        faaSystemLinks: brand.faaSystemLinks || [],
        type: brand.type,
        masterLicenseFee: brand.masterLicenseFee,
        monthlyFee: brand.monthlyFee,
        royalty: brand.royalty,
        usePhrase: brand.usePhrase || null,
        omnidropKit: brand.omnidropKit || null,
        claimRoot: brand.claimRoot || null,
        pulseTrade: brand.pulseTrade || null,
        vaultPay: brand.vaultPay || null,
        activationTime: brand.activationTime || null,
        ghostTrace: brand.ghostTrace || null,
        deploymentRegion: brand.deploymentRegion || null,
        familyBundle: brand.familyBundle || null,
        description: brand.description || null,
        tier: brand.tier,
        status: 'active'
      });
      
      imported++;
      
      if (imported % 25 === 0) {
        console.log(`  ✅ Imported ${imported}/${brands.length} brands...`);
      }
    } catch (error) {
      console.error(`  ❌ Failed to import brand ${brand.id} (${brand.name}):`, error);
    }
  }
  
  console.log(`\n✅ IMPORT COMPLETE!`);
  console.log(`📦 ${imported}/${brands.length} SEEDWAVE brands imported successfully`);
  
  // Summary
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('SEEDWAVE VERIFIED BRANDS - IMPORT SUMMARY');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Total Brands:           ${imported}`);
  console.log(`Sectors:                ${Object.keys(sectors).length}`);
  console.log(`Premium Tiers:          ${tiers['Sovereign'] || 0} Sovereign, ${tiers['Dynastic'] || 0} Dynastic`);
  console.log(`Standard Tiers:         ${tiers['Operational'] || 0} Operational, ${tiers['Market'] || 0} Market`);
  console.log(`Status:                 ✅ COMPLETE`);
  console.log('═══════════════════════════════════════════════════════\n');
  
  process.exit(0);
}

importSeedwave().catch(console.error);
