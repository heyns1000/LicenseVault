/**
 * Parse the REAL sector data file to count CORE and SUBNODES properly
 */

import * as fs from 'fs';

const dataFile = '/tmp/FruitfulPlanetChange/attached_assets/Pasted--Global-Data-Definitions-const-sectorList-agriculture-Agric-1753257089057_1753257089059.txt';

const content = fs.readFileSync(dataFile, 'utf8');

// Extract all brand arrays with regex
const brandArrays = content.match(/const\s+(\w+Brands)\s*=\s*\[([\s\S]*?)\];/g) || [];
const subnodeArrays = content.match(/const\s+(\w+SubNodes)\s*=\s*\[([\s\S]*?)\];/g) || [];

console.log('📊 PARSING REAL SECTOR DATA...\n');

const sectorCounts: Record<string, { core: number; subnodes: number }> = {};

// Parse core brands
for (const brandArray of brandArrays) {
  const match = brandArray.match(/const\s+(\w+)Brands\s*=\s*\[([\s\S]*?)\]/);
  if (match) {
    const sectorName = match[1]; // e.g., "agri", "banking", "creative"
    const brandsString = match[2];
    
    // Count brands by counting single-quoted strings
    const brands = brandsString.match(/'[^']+'/g) || [];
    sectorCounts[sectorName] = { core: brands.length, subnodes: 0 };
    
    console.log(`Found ${sectorName}: ${brands.length} CORE brands`);
  }
}

console.log('');

// Parse subnodes
for (const subnodeArray of subnodeArrays) {
  const match = subnodeArray.match(/const\s+(\w+)SubNodes\s*=\s*\[([\s\S]*?)\]/);
  if (match) {
    const sectorName = match[1]; // e.g., "agri", "banking", "creative"
    const subnodesString = match[2];
    
    // Count total subnodes by counting ALL single-quoted strings in nested arrays
    const allSubnodes = subnodesString.match(/'[^']+'/g) || [];
    
    if (sectorCounts[sectorName]) {
      sectorCounts[sectorName].subnodes = allSubnodes.length;
    } else {
      sectorCounts[sectorName] = { core: 0, subnodes: allSubnodes.length };
    }
    
    console.log(`Found ${sectorName}: ${allSubnodes.length} SUBNODES`);
  }
}

console.log('\n═══════════════════════════════════════════');
console.log('COMPLETE SECTOR COUNTS (CORE + SUBNODES)');
console.log('═══════════════════════════════════════════\n');

let totalCore = 0;
let totalSubnodes = 0;

Object.entries(sectorCounts).sort((a, b) => {
  const totalA = a[1].core + a[1].subnodes;
  const totalB = b[1].core + b[1].subnodes;
  return totalB - totalA;
}).forEach(([sector, counts]) => {
  const total = counts.core + counts.subnodes;
  console.log(`${sector.padEnd(20)} | Core: ${String(counts.core).padStart(4)} | Subnodes: ${String(counts.subnodes).padStart(4)} | Total: ${String(total).padStart(4)}`);
  totalCore += counts.core;
  totalSubnodes += counts.subnodes;
});

console.log('\n═══════════════════════════════════════════');
console.log(`GRAND TOTALS:`);
console.log(`  Total CORE brands:   ${totalCore}`);
console.log(`  Total SUBNODES:      ${totalSubnodes}`);
console.log(`  GRAND TOTAL:         ${totalCore + totalSubnodes}`);
console.log('═══════════════════════════════════════════');

// Output JSON for database import
const output = {
  sectors: Object.entries(sectorCounts).map(([key, counts]) => ({
    sectorKey: key,
    coreCount: counts.core,
    subnodeCount: counts.subnodes,
    totalCount: counts.core + counts.subnodes
  })),
  totals: {
    core: totalCore,
    subnodes: totalSubnodes,
    total: totalCore + totalSubnodes
  }
};

fs.writeFileSync('/home/runner/workspace/REAL-sector-counts.json', JSON.stringify(output, null, 2));
console.log('\n✅ Saved to: /home/runner/workspace/REAL-sector-counts.json');
