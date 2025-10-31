/**
 * COMPREHENSIVE BRAND CONSOLIDATION
 * Merges ALL brand data sources from FruitfulPlanetChange repository
 * Target: 48 sectors with 3,794+ unique brands
 */

import * as fs from 'fs';
import * as path from 'path';

const repoPath = '/tmp/FruitfulPlanetChange';

// Track ALL unique sectors and brands
const allSectors = new Map<string, { key: string, name: string, emoji: string }>();
const allBrands = new Map<string, { name: string, sectors: Set<string>, type: 'core' | 'subnode' }>();

// Define known sector mappings from the 48-sector system
const SECTOR_MAPPINGS = {
  'agriculture': { emoji: '🌱', name: 'Agriculture & Biotech' },
  'fsf': { emoji: '🥦', name: 'Food, Soil & Farming' },
  'banking': { emoji: '🏦', name: 'Banking & Finance' },
  'creative': { emoji: '🖋️', name: 'Creative Tech' },
  'logistics': { emoji: '📦', name: 'Logistics & Packaging' },
  'education-ip': { emoji: '📚', name: 'Education & IP' },
  'fashion': { emoji: '✂', name: 'Fashion & Identity' },
  'gaming': { emoji: '🎮', name: 'Gaming & Simulation' },
  'health': { emoji: '🧠', name: 'Health & Hygiene' },
  'housing': { emoji: '🏗️', name: 'Housing & Infrastructure' },
  'justice': { emoji: '⚖', name: 'Justice & Ethics' },
  'knowledge': { emoji: '📖', name: 'Knowledge & Archives' },
  'micromesh': { emoji: '☰', name: 'Micro-Mesh Logistics' },
  'media': { emoji: '🎬', name: 'Motion, Media & Sonic' },
  'nutrition': { emoji: '✿', name: 'Nutrition & Food Chain' },
  'ai-logic': { emoji: '🧠', name: 'AI, Logic & Grid' },
  'packaging': { emoji: '📦', name: 'Packaging & Materials' },
  'quantum': { emoji: '✴️', name: 'Quantum Protocols' },
  'ritual': { emoji: '☯', name: 'Ritual & Culture' },
  'saas': { emoji: '🔑', name: 'SaaS & Licensing' },
  'trade': { emoji: '🧺', name: 'Trade Systems' },
  'utilities': { emoji: '🔋', name: 'Utilities & Energy' },
  'voice': { emoji: '🎙️', name: 'Voice & Audio' },
  'webless': { emoji: '📡', name: 'Webless Tech & Nodes' },
  'nft': { emoji: '🔁', name: 'NFT & Ownership' },
  'education-youth': { emoji: '🎓', name: 'Education & Youth' },
  'zerowaste': { emoji: '♻️', name: 'Zero Waste' },
  'professional': { emoji: '🧾', name: 'Professional Services' },
  'payroll-mining': { emoji: '🪙', name: 'Payroll Mining & Accounting' },
  'mining': { emoji: '⛏️', name: 'Mining & Resources' },
  'wildlife': { emoji: '🦁', name: 'Wildlife & Habitat' },
};

console.log('🔍 CONSOLIDATING ALL BRAND DATA...');
console.log('');

// STEP 1: Parse the main 31-sector file with 4,246 brands
const mainFile = path.join(repoPath, 'attached_assets', 'Pasted--Global-Data-Definitions-const-sectorList-agriculture-Agric-1753257089057_1753257089059.txt');
console.log('📄 Parsing main file:', mainFile);

try {
  const content = fs.readFileSync(mainFile, 'utf8');
  
  // Extract all brand names (core brands)
  const coreBrandMatches = content.matchAll(/const ([a-z]+)Brands = \[([^\]]+)\]/gs);
  for (const match of coreBrandMatches) {
    const sectorKey = match[1];
    const brandsStr = match[2];
    const brands = brandsStr.match(/'([A-Z][a-zA-Z0-9]+)'/g);
    
    if (brands) {
      for (const brand of brands) {
        const cleanBrand = brand.replace(/'/g, '');
        if (!allBrands.has(cleanBrand)) {
          allBrands.set(cleanBrand, { name: cleanBrand, sectors: new Set(), type: 'core' });
        }
        allBrands.get(cleanBrand)!.sectors.add(sectorKey);
      }
    }
  }
  
  // Extract all subnodes
  const subnodeMatches = content.matchAll(/const ([a-z]+)SubNodes = \[\[([^\]]+)\]\]/gs);
  for (const match of subnodeMatches) {
    const sectorKey = match[1];
    const allSubnodesStr = match[0];
    
    // Extract brand names from subnodes
    const subnodeBrands = allSubnodesStr.match(/'([A-Z][a-zA-Z0-9]+)[^']*'/g);
    if (subnodeBrands) {
      for (const brand of subnodeBrands) {
        const cleanBrand = brand.replace(/'([A-Z][a-zA-Z0-9]+)[^']*'/, '$1');
        if (!allBrands.has(cleanBrand)) {
          allBrands.set(cleanBrand, { name: cleanBrand, sectors: new Set(), type: 'subnode' });
        }
        allBrands.get(cleanBrand)!.sectors.add(sectorKey);
      }
    }
  }
  
  console.log(`✅ Parsed main file: ${allBrands.size} unique brands so far`);
} catch (error) {
  console.error('❌ Error parsing main file:', error);
}

// STEP 2: Scan ALL other files for additional brands
const allFiles = fs.readdirSync(path.join(repoPath, 'attached_assets'))
  .filter(f => f.endsWith('.txt') && f.includes('Global-Data'))
  .filter(f => !f.includes('1753257089057')); // Skip the main file we already parsed

console.log(`📁 Scanning ${allFiles.length} additional files for more brands...`);

for (const file of allFiles) {
  try {
    const content = fs.readFileSync(path.join(repoPath, 'attached_assets', file), 'utf8');
    
    // Extract any brand names we might have missed
    const brandMatches = content.matchAll(/'([A-Z][a-zA-Z0-9]{2,})[^']*'/g);
    for (const match of brandMatches) {
      const brandName = match[1];
      if (!allBrands.has(brandName)) {
        allBrands.set(brandName, { name: brandName, sectors: new Set(), type: 'core' });
      }
    }
  } catch (error) {
    // Skip files that can't be read
  }
}

console.log(`✅ After scanning all files: ${allBrands.size} unique brands`);
console.log('');

// STEP 3: Register all known sectors
for (const [key, data] of Object.entries(SECTOR_MAPPINGS)) {
  allSectors.set(key, { key, name: data.name, emoji: data.emoji });
}

// Count brands by sector
const brandsBySector = new Map<string, number>();
for (const brand of allBrands.values()) {
  for (const sectorKey of brand.sectors) {
    brandsBySector.set(sectorKey, (brandsBySector.get(sectorKey) || 0) + 1);
  }
}

console.log('═══════════════════════════════════════════');
console.log('📊 FINAL CONSOLIDATED RESULTS');
console.log('═══════════════════════════════════════════');
console.log('');
console.log(`✅ TOTAL SECTORS: ${allSectors.size}`);
console.log(`✅ TOTAL UNIQUE BRANDS: ${allBrands.size}`);
console.log('');

const coreBrands = Array.from(allBrands.values()).filter(b => b.type === 'core');
const subnodeBrands = Array.from(allBrands.values()).filter(b => b.type === 'subnode');

console.log(`📊 Core brands: ${coreBrands.length}`);
console.log(`📊 Subnode brands: ${subnodeBrands.length}`);
console.log('');

console.log('📋 SECTORS WITH BRAND COUNTS:');
const sortedSectors = Array.from(allSectors.values()).sort((a, b) => a.key.localeCompare(b.key));
for (const sector of sortedSectors) {
  const count = brandsBySector.get(sector.key) || 0;
  console.log(`   ${sector.emoji} ${sector.name}: ${count} brands`);
}

console.log('');
console.log('═══════════════════════════════════════════');
console.log(`🎯 TARGET: 48 sectors, 3,794+ brands`);
console.log(`🎯 ACTUAL: ${allSectors.size} sectors, ${allBrands.size} brands`);
console.log('═══════════════════════════════════════════');

// Export consolidated data
const consolidated = {
  sectors: Array.from(allSectors.values()),
  brands: Array.from(allBrands.entries()).map(([name, data]) => ({
    name,
    sectors: Array.from(data.sectors),
    type: data.type
  })),
  totals: {
    sectors: allSectors.size,
    brands: allBrands.size,
    core: coreBrands.length,
    subnodes: subnodeBrands.length
  }
};

// Save to file
const outputPath = path.join(process.cwd(), 'consolidated-hsomni-data.json');
fs.writeFileSync(outputPath, JSON.stringify(consolidated, null, 2));
console.log('');
console.log(`💾 Consolidated data saved to: ${outputPath}`);

export { consolidated };
