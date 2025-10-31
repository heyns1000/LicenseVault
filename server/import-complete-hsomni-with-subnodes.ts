/**
 * COMPLETE HSOMNI9000 IMPORT WITH SUBNODES
 * Imports ALL 6,219 brands: 1,481 CORE + 4,738 SUBNODES
 * Each brand gets a unique VaultMesh ID (serial primary key)
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

async function importCompleteHSOMNI() {
  console.log('🚀 IMPORTING COMPLETE HSOMNI9000 WITH SUBNODES...\n');
  
  const content = fs.readFileSync(sourceFile, 'utf8');
  
  let totalCore = 0;
  let totalSubnodes = 0;
  
  // First, clear existing brands to avoid duplicates
  console.log('🗑️  Clearing existing brand data...');
  await db.delete(hsomniBrands);
  console.log('✅ Cleared existing brands\n');
  
  for (const mapping of SECTOR_MAPPINGS) {
    console.log(`\n📦 Processing ${mapping.name}...`);
    
    // Get sector ID
    const sector = await db.select().from(hsomniSectors).where(eq(hsomniSectors.sectorKey, mapping.key));
    if (sector.length === 0) {
      console.log(`⚠️  Sector ${mapping.key} not found, skipping...`);
      continue;
    }
    const sectorId = sector[0].id;
    
    // Extract CORE brands
    const brandMatch = content.match(new RegExp(`const ${mapping.brandVar} = \\[([\\s\\S]*?)\\];`, 'm'));
    const coreBrandNames: string[] = [];
    if (brandMatch) {
      const matches = brandMatch[1].match(/'([^']+)'/g) || [];
      coreBrandNames.push(...matches.map(m => m.replace(/'/g, '')));
    }
    
    // Extract SUBNODES
    const subnodeMatch = content.match(new RegExp(`const ${mapping.subnodeVar} = \\[([\\s\\S]*?)\\];`, 'm'));
    const subnodeArrays: string[][] = [];
    if (subnodeMatch) {
      const allSubnodes = subnodeMatch[1].match(/'([^']+)'/g) || [];
      const subnodeNames = allSubnodes.map(m => m.replace(/'/g, ''));
      
      // Group subnodes by CORE brand (nested arrays)
      // Parse the nested array structure [[...],[...],...]
      const nestedMatch = subnodeMatch[1].match(/\[([^\[\]]+)\]/g) || [];
      for (const nested of nestedMatch) {
        const items = nested.match(/'([^']+)'/g) || [];
        subnodeArrays.push(items.map(m => m.replace(/'/g, '')));
      }
    }
    
    console.log(`  📊 Found ${coreBrandNames.length} CORE brands, ${subnodeArrays.flat().length} SUBNODES`);
    
    // Import CORE brands
    const parentBrands: Record<number, number> = {}; // index -> db ID
    
    for (let i = 0; i < coreBrandNames.length; i++) {
      const brandName = coreBrandNames[i];
      
      const result = await db.insert(hsomniBrands).values({
        name: brandName,
        description: `${mapping.name} CORE brand`,
        sectorId: sectorId,
        integration: 'VaultMesh™',
        status: 'active',
        isCore: true,
        parentId: null
      }).returning({ id: hsomniBrands.id });
      
      parentBrands[i] = result[0].id;
      totalCore++;
    }
    
    console.log(`  ✅ Imported ${coreBrandNames.length} CORE brands with VaultMesh IDs`);
    
    // Import SUBNODES linked to parent CORE brands
    let subnodeCount = 0;
    for (let i = 0; i < subnodeArrays.length && i < coreBrandNames.length; i++) {
      const parentId = parentBrands[i];
      const subnodes = subnodeArrays[i];
      
      for (const subnodeName of subnodes) {
        await db.insert(hsomniBrands).values({
          name: subnodeName,
          description: `SUBNODE of ${coreBrandNames[i]}`,
          sectorId: sectorId,
          integration: 'VaultMesh™',
          status: 'active',
          isCore: false,
          parentId: parentId
        });
        
        subnodeCount++;
        totalSubnodes++;
      }
    }
    
    console.log(`  ✅ Imported ${subnodeCount} SUBNODES with parent links`);
  }
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('IMPORT COMPLETE!');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`✅ Total CORE brands:      ${totalCore}`);
  console.log(`✅ Total SUBNODES:         ${totalSubnodes}`);
  console.log(`✅ GRAND TOTAL:            ${totalCore + totalSubnodes}`);
  console.log('✅ All brands have unique VaultMesh IDs (serial primary keys)');
  console.log('✅ All SUBNODES linked to parent CORE brands');
  console.log('✅ All brands assigned to sectors');
  console.log('═══════════════════════════════════════════════════════');
  
  process.exit(0);
}

importCompleteHSOMNI().catch(console.error);
