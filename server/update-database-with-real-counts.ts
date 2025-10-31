/**
 * UPDATE DATABASE WITH REAL HSOMNI9000 SECTOR DATA
 * Total: 6,219 brands (1,481 CORE + 4,738 SUBNODES)
 */

import { db } from './db';
import { hsomniSectors } from '../shared/schema';
import { eq } from 'drizzle-orm';

const REAL_SECTOR_DATA = [
  { key: 'ai-logic', name: 'AI, Logic & Grid', emoji: '🧠', core: 188, subnodes: 632, total: 820 },
  { key: 'logistics', name: 'Logistics & Packaging', emoji: '📦', core: 101, subnodes: 364, total: 465 },
  { key: 'health', name: 'Health & Hygiene', emoji: '🧠', core: 93, subnodes: 372, total: 465 },
  { key: 'housing', name: 'Housing & Infrastructure', emoji: '🏗️', core: 91, subnodes: 364, total: 455 },
  { key: 'fsf', name: 'Food, Soil & Farming', emoji: '🥦', core: 83, subnodes: 332, total: 415 },
  { key: 'education-ip', name: 'Education & IP', emoji: '📚', core: 66, subnodes: 330, total: 396 },
  { key: 'media', name: 'Motion, Media & Sonic', emoji: '🎬', core: 78, subnodes: 312, total: 390 },
  { key: 'webless', name: 'Webless Tech & Nodes', emoji: '📡', core: 103, subnodes: 248, total: 351 },
  { key: 'professional', name: 'Professional Services', emoji: '🧾', core: 50, subnodes: 300, total: 350 },
  { key: 'fashion', name: 'Fashion & Identity', emoji: '✂', core: 138, subnodes: 198, total: 336 },
  { key: 'agriculture', name: 'Agriculture & Biotech', emoji: '🌱', core: 84, subnodes: 190, total: 274 },
  { key: 'banking', name: 'Banking & Finance', emoji: '🏦', core: 136, subnodes: 136, total: 272 },
  { key: 'mining', name: 'Mining & Resources', emoji: '⛏️', core: 30, subnodes: 120, total: 150 },
  { key: 'saas', name: 'SaaS & Licensing', emoji: '🔑', core: 20, subnodes: 80, total: 100 },
  { key: 'nft', name: 'NFT & Ownership', emoji: '🔁', core: 20, subnodes: 80, total: 100 },
  { key: 'quantum', name: 'Quantum Protocols', emoji: '✴️', core: 20, subnodes: 80, total: 100 },
  { key: 'ritual', name: 'Ritual & Culture', emoji: '☯', core: 20, subnodes: 80, total: 100 },
  { key: 'nutrition', name: 'Nutrition & Food Chain', emoji: '✿', core: 20, subnodes: 80, total: 100 },
  { key: 'zerowaste', name: 'Zero Waste', emoji: '♻️', core: 20, subnodes: 80, total: 100 },
  { key: 'creative', name: 'Creative Tech', emoji: '🖋️', core: 10, subnodes: 30, total: 40 },
  { key: 'education-youth', name: 'Education & Youth', emoji: '🎓', core: 10, subnodes: 30, total: 40 },
  { key: 'gaming', name: 'Gaming & Simulation', emoji: '🎮', core: 10, subnodes: 30, total: 40 },
  { key: 'justice', name: 'Justice & Ethics', emoji: '⚖', core: 10, subnodes: 30, total: 40 },
  { key: 'knowledge', name: 'Knowledge & Archives', emoji: '📖', core: 10, subnodes: 30, total: 40 },
  { key: 'micromesh', name: 'Micro-Mesh Logistics', emoji: '☰', core: 10, subnodes: 30, total: 40 },
  { key: 'packaging', name: 'Packaging & Materials', emoji: '📦', core: 10, subnodes: 30, total: 40 },
  { key: 'trade', name: 'Trade Systems', emoji: '🧺', core: 10, subnodes: 30, total: 40 },
  { key: 'utilities', name: 'Utilities & Energy', emoji: '🔋', core: 10, subnodes: 30, total: 40 },
  { key: 'voice', name: 'Voice & Audio', emoji: '🎙️', core: 10, subnodes: 30, total: 40 },
  { key: 'payroll-mining', name: 'Payroll Mining & Accounting', emoji: '🪙', core: 10, subnodes: 30, total: 40 },
  { key: 'wildlife', name: 'Wildlife & Habitat', emoji: '🦁', core: 10, subnodes: 30, total: 40 }
];

async function updateDatabase() {
  console.log('🚀 UPDATING DATABASE WITH REAL HSOMNI9000 SECTOR DATA...\n');
  
  for (const sector of REAL_SECTOR_DATA) {
    const existing = await db.select().from(hsomniSectors).where(eq(hsomniSectors.sectorKey, sector.key));
    
    if (existing.length > 0) {
      await db.update(hsomniSectors)
        .set({
          name: sector.name,
          emoji: sector.emoji,
          brandCount: sector.core,
          subnodeCount: sector.subnodes
        })
        .where(eq(hsomniSectors.sectorKey, sector.key));
      
      console.log(`✅ Updated: ${sector.name} (${sector.core} core + ${sector.subnodes} subnodes = ${sector.total} total)`);
    } else {
      await db.insert(hsomniSectors).values({
        sectorKey: sector.key,
        name: sector.name,
        emoji: sector.emoji,
        description: `HSOMNI9000 ${sector.name} sector with ${sector.total} brands`,
        brandCount: sector.core,
        subnodeCount: sector.subnodes
      });
      
      console.log(`✅ Inserted: ${sector.name} (${sector.core} core + ${sector.subnodes} subnodes = ${sector.total} total)`);
    }
  }
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('DATABASE UPDATE COMPLETE!');
  console.log('═══════════════════════════════════════════════════════');
  console.log('Total Sectors Updated: 31');
  console.log('Total CORE Brands:     1,481');
  console.log('Total SUBNODES:        4,738');
  console.log('GRAND TOTAL:           6,219 brands');
  console.log('═══════════════════════════════════════════════════════');
  
  process.exit(0);
}

updateDatabase().catch(console.error);
