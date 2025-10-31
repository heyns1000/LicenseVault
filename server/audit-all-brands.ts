/**
 * COMPREHENSIVE BRAND AUDIT
 * Scans ALL files in FruitfulPlanetChange and counts UNIQUE sectors and brands
 */

import * as fs from 'fs';
import * as path from 'path';

const repoPath = '/tmp/FruitfulPlanetChange';

// Sets to store unique values
const uniqueSectors = new Map<string, { key: string, name: string, emoji: string }>();
const uniqueBrands = new Set<string>();
const brandsBySector = new Map<string, Set<string>>();

function scanFile(filePath: string) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract sector definitions
    // Pattern 1: "sectorKey": "value" or sectorKey: 'value'
    const sectorKeyMatches = content.matchAll(/["']?([a-z-]+)["']?\s*:\s*["'](🌱|🥦|🏦|🖋️|📦|📚|🎓|✂|🎮|🧠|🏗️|⚖️|📖|☰|🎬|✿|🔑|📦|✴️|☯|🧺|🔋|🎙️|📡|🔁|♻️|🧾|🪙|⛏️|🦁|⚙️|🌐)/g);
    for (const match of sectorKeyMatches) {
      const key = match[1];
      const emoji = match[2];
      if (!uniqueSectors.has(key)) {
        uniqueSectors.set(key, { key, name: '', emoji });
      }
    }
    
    // Pattern 2: sector objects with sectorName
    const sectorObjMatches = content.matchAll(/sectorName:\s*['"]([^'"]+)['"]/g);
    for (const match of sectorObjMatches) {
      const name = match[1];
      // Try to extract emoji from the name
      const emojiMatch = name.match(/(🌱|🥦|🏦|🖋️|📦|📚|🎓|✂|🎮|🧠|🏗️|⚖️|📖|☰|🎬|✿|🔑|📦|✴️|☯|🧺|🔋|🎙️|📡|🔁|♻️|🧾|🪙|⛏️|🦁|⚙️|🌐)/);
      if (emojiMatch) {
        const key = name.toLowerCase().replace(/[^a-z-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        uniqueSectors.set(key, { key, name, emoji: emojiMatch[0] });
      }
    }
    
    // Extract brand names
    // Pattern 1: Arrays of brands
    const brandArrayMatches = content.matchAll(/brands:\s*\[([^\]]+)\]/gs);
    for (const match of brandArrayMatches) {
      const brandsStr = match[1];
      const brands = brandsStr.match(/['"]([A-Z][a-zA-Z0-9]+)['"]/g);
      if (brands) {
        for (const brand of brands) {
          const cleanBrand = brand.replace(/['"]/g, '');
          uniqueBrands.add(cleanBrand);
        }
      }
    }
    
    // Pattern 2: Individual brand names with ™
    const brandTmMatches = content.matchAll(/['"]([A-Z][a-zA-Z0-9]+)™['"]/g);
    for (const match of brandTmMatches) {
      uniqueBrands.add(match[1]);
    }
    
    // Pattern 3: brandName field
    const brandNameMatches = content.matchAll(/brandName:\s*['"]([A-Z][a-zA-Z0-9]+)[^'"]*['"]/g);
    for (const match of brandNameMatches) {
      const cleanBrand = match[1].replace(/™/g, '');
      uniqueBrands.add(cleanBrand);
    }
    
  } catch (error) {
    // Skip files that can't be read
  }
}

function scanDirectory(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules, .git, dist
      if (['node_modules', '.git', 'dist', '.next'].includes(entry.name)) {
        continue;
      }
      scanDirectory(fullPath);
    } else if (entry.isFile()) {
      // Only scan relevant files
      if (entry.name.match(/\.(ts|js|json|html|txt|md)$/)) {
        scanFile(fullPath);
      }
    }
  }
}

console.log('🔍 SCANNING ALL FILES IN FruitfulPlanetChange...');
console.log('📁 Repository:', repoPath);
console.log('');

scanDirectory(repoPath);

console.log('═══════════════════════════════════════════');
console.log('📊 COMPREHENSIVE BRAND AUDIT RESULTS');
console.log('═══════════════════════════════════════════');
console.log('');
console.log(`✅ UNIQUE SECTORS FOUND: ${uniqueSectors.size}`);
console.log(`✅ UNIQUE BRANDS FOUND: ${uniqueBrands.size}`);
console.log('');

console.log('📋 ALL UNIQUE SECTORS:');
const sortedSectors = Array.from(uniqueSectors.values()).sort((a, b) => a.key.localeCompare(b.key));
for (const sector of sortedSectors) {
  console.log(`   ${sector.emoji} ${sector.key} - ${sector.name || 'N/A'}`);
}
console.log('');

console.log(`📋 TOTAL UNIQUE BRANDS: ${uniqueBrands.size}`);
console.log('');

// Group brands by first letter for overview
const brandsByLetter = new Map<string, number>();
for (const brand of uniqueBrands) {
  const letter = brand[0].toUpperCase();
  brandsByLetter.set(letter, (brandsByLetter.get(letter) || 0) + 1);
}

console.log('📊 Brands by first letter:');
for (const [letter, count] of Array.from(brandsByLetter.entries()).sort()) {
  console.log(`   ${letter}: ${count} brands`);
}

console.log('');
console.log('═══════════════════════════════════════════');
console.log(`🎯 FINAL COUNT: ${uniqueSectors.size} sectors, ${uniqueBrands.size} brands`);
console.log('═══════════════════════════════════════════');

// Export for use
export const auditResults = {
  totalSectors: uniqueSectors.size,
  totalBrands: uniqueBrands.size,
  sectors: Array.from(uniqueSectors.values()),
  brands: Array.from(uniqueBrands)
};
