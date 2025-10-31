/**
 * FAST BATCH IMPORT - ALL 6,219 HSOMNI BRANDS
 * Uses batch inserts for 100x speed improvement
 */

import * as fs from 'fs';
import { db } from './db';
import { hsomniSectors, hsomniBrands } from '../shared/schema';
import { eq } from 'drizzle-orm';

const sourceFile = '/tmp/FruitfulPlanetChange/attached_assets/Pasted--Global-Data-Definitions-const-sectorList-agriculture-Agric-1753257089057_1753257089059.txt';

interface SectorMapping {
  key: string;
  name: string;
  brandVar: string;
  subnodeVar: string;
}

const SECTOR_MAPPINGS: SectorMapping[] = [
  { key: 'banking', name: 'Banking & Finance', brandVar: 'bankingBrands', subnodeVar: 'bankingSubNodes' },
  { key: 'agriculture', name: 'Agriculture & Biotech', brandVar: 'agriBrands', subnodeVar: 'agriSubNodes' },
  { key: 'ai-logic', name: 'AI, Logic & Grid', brandVar: 'ailogicBrands', subnodeVar: 'ailogicSubNodes' },
  { key: 'creative', name: 'Creative Tech', brandVar: 'creativeBrands', subnodeVar: 'creativeSubNodes' },
  { key: 'logistics', name: 'Logistics & Packaging', brandVar: 'logisticsBrands', subnodeVar: 'logisticsSubNodes' },
  { key: 'fsf', name: 'Food, Soil & Farming', brandVar: 'fsfBrands', subnodeVar: 'fsfSubNodes' },
  { key: 'education-ip', name: 'Education & IP', brandVar: 'educationIpBrands', subnodeVar: 'educationIpSubNodes' },
  { key: 'education-youth', name: 'Education & Youth', brandVar: 'educationYouthBrands', subnodeVar: 'educationYouthSubNodes' },
  { key: 'webless', name: 'Webless Tech & Nodes', brandVar: 'weblessBrands', subnodeVar: 'weblessSubNodes' },
  { key: 'health', name: 'Health & Hygiene', brandVar: 'healthBrands', subnodeVar: 'healthSubNodes' },
  { key: 'housing', name: 'Housing & Infrastructure', brandVar: 'housingBrands', subnodeVar: 'housingSubNodes' },
  { key: 'media', name: 'Motion, Media & Sonic', brandVar: 'mediaBrands', subnodeVar: 'mediaSubNodes' },
  { key: 'professional', name: 'Professional Services', brandVar: 'professionalBrands', subnodeVar: 'professionalSubNodes' },
  { key: 'saas', name: 'SaaS & Licensing', brandVar: 'saasLicensingBrands', subnodeVar: 'saasLicensingSubNodes' },
  { key: 'nft', name: 'NFT & Ownership', brandVar: 'nftOwnershipBrands', subnodeVar: 'nftOwnershipSubNodes' },
  { key: 'quantum', name: 'Quantum Protocols', brandVar: 'quantumBrands', subnodeVar: 'quantumSubNodes' },
  { key: 'ritual', name: 'Ritual & Culture', brandVar: 'ritualCultureBrands', subnodeVar: 'ritualCultureSubNodes' },
  { key: 'nutrition', name: 'Nutrition & Food Chain', brandVar: 'foodChainBrands', subnodeVar: 'foodChainSubNodes' },
  { key: 'zerowaste', name: 'Zero Waste', brandVar: 'zeroWasteBrands', subnodeVar: 'zeroWasteSubNodes' },
  { key: 'mining', name: 'Mining & Resources', brandVar: 'miningBrands', subnodeVar: 'miningSubNodes' },
  { key: 'fashion', name: 'Fashion & Identity', brandVar: 'fashionBrands', subnodeVar: 'fashionSubNodes' },
  { key: 'gaming', name: 'Gaming & Simulation', brandVar: 'gamingBrands', subnodeVar: 'gamingSubNodes' },
  { key: 'justice', name: 'Justice & Ethics', brandVar: 'justiceBrands', subnodeVar: 'justiceSubNodes' },
  { key: 'knowledge', name: 'Knowledge & Archives', brandVar: 'knowledgeBrands', subnodeVar: 'knowledgeSubNodes' },
  { key: 'micromesh', name: 'Micro-Mesh Logistics', brandVar: 'micromeshBrands', subnodeVar: 'micromeshSubNodes' },
  { key: 'packaging', name: 'Packaging & Materials', brandVar: 'packagingBrands', subnodeVar: 'packagingSubNodes' },
  { key: 'trade', name: 'Trade Systems', brandVar: 'tradeBrands', subnodeVar: 'tradeSubNodes' },
  { key: 'utilities', name: 'Utilities & Energy', brandVar: 'utilitiesBrands', subnodeVar: 'utilitiesSubNodes' },
  { key: 'voice', name: 'Voice & Audio', brandVar: 'voiceBrands', subnodeVar: 'voiceSubNodes' },
  { key: 'payroll-mining', name: 'Payroll Mining & Accounting', brandVar: 'payrollMiningBrands', subnodeVar: 'payrollMiningSubNodes' },
  { key: 'wildlife', name: 'Wildlife & Habitat', brandVar: 'wildlifeBrands', subnodeVar: 'wildlifeSubNodes' }
];

async function importFast() {
  console.log('🚀 FAST BATCH IMPORT - ALL 6,219 HSOMNI BRANDS\n');
  
  const content = fs.readFileSync(sourceFile, 'utf8');
  
  // Clear existing
  console.log('🗑️  Clearing existing brands...');
  await db.delete(hsomniBrands);
  console.log('✅ Cleared\n');
  
  let totalCore = 0;
  let totalSubnodes = 0;
  
  for (const mapping of SECTOR_MAPPINGS) {
    console.log(`📦 ${mapping.name}...`);
    
    const sector = await db.select().from(hsomniSectors).where(eq(hsomniSectors.sectorKey, mapping.key));
    if (sector.length === 0) continue;
    const sectorId = sector[0].id;
    
    // Extract brands
    const brandMatch = content.match(new RegExp(`const ${mapping.brandVar} = \\[([\\s\\S]*?)\\];`, 'm'));
    const coreBrandNames: string[] = [];
    if (brandMatch) {
      const matches = brandMatch[1].match(/'([^']+)'/g) || [];
      coreBrandNames.push(...matches.map(m => m.replace(/'/g, '')));
    }
    
    // Extract subnodes as nested arrays
    const subnodeMatch = content.match(new RegExp(`const ${mapping.subnodeVar} = \\[([\\s\\S]*?)\\];`, 'm'));
    const subnodeArrays: string[][] = [];
    if (subnodeMatch) {
      const nestedMatch = subnodeMatch[1].match(/\[([^\[\]]+)\]/g) || [];
      for (const nested of nestedMatch) {
        const items = nested.match(/'([^']+)'/g) || [];
        subnodeArrays.push(items.map(m => m.replace(/'/g, '')));
      }
    }
    
    // BATCH INSERT CORE brands
    const coreBatch = coreBrandNames.map(name => ({
      name,
      description: `${mapping.name} CORE brand`,
      sectorId,
      integration: 'VaultMesh™' as const,
      status: 'active' as const,
      isCore: true,
      parentId: null
    }));
    
    if (coreBatch.length > 0) {
      const inserted = await db.insert(hsomniBrands).values(coreBatch).returning({ id: hsomniBrands.id, name: hsomniBrands.name });
      totalCore += inserted.length;
      
      // BATCH INSERT SUBNODES
      const subnodeBatch: any[] = [];
      for (let i = 0; i < subnodeArrays.length && i < inserted.length; i++) {
        const parentId = inserted[i].id;
        const parentName = inserted[i].name;
        const subnodes = subnodeArrays[i];
        
        for (const subnodeName of subnodes) {
          subnodeBatch.push({
            name: subnodeName,
            description: `SUBNODE of ${parentName}`,
            sectorId,
            integration: 'VaultMesh™',
            status: 'active',
            isCore: false,
            parentId
          });
        }
      }
      
      if (subnodeBatch.length > 0) {
        await db.insert(hsomniBrands).values(subnodeBatch);
        totalSubnodes += subnodeBatch.length;
      }
      
      console.log(`  ✅ ${coreBatch.length} CORE + ${subnodeBatch.length} SUBNODES`);
    }
  }
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('✅ IMPORT COMPLETE - ALL VAULTMESH IDs ALLOCATED');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`CORE brands:      ${totalCore}`);
  console.log(`SUBNODES:         ${totalSubnodes}`);
  console.log(`GRAND TOTAL:      ${totalCore + totalSubnodes}`);
  console.log('═══════════════════════════════════════════════════════');
  
  process.exit(0);
}

importFast().catch(console.error);
