/**
 * FINAL 48-SECTOR CONSOLIDATION
 * Merges all data sources to create the complete 48-sector, 3,794+ brand system
 */

import { db } from './db';
import { hsomniSectors, hsomniBrands } from '@shared/schema';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { eq, and } from 'drizzle-orm';

// COMPLETE 48-SECTOR SYSTEM
export const FINAL_48_SECTORS = [
  // Original 31 core sectors
  { key: 'agriculture', emoji: '🌱', name: 'Agriculture & Biotech' },
  { key: 'fsf', emoji: '🥦', name: 'Food, Soil & Farming' },
  { key: 'banking', emoji: '🏦', name: 'Banking & Finance' },
  { key: 'creative', emoji: '🖋️', name: 'Creative Tech' },
  { key: 'logistics', emoji: '📦', name: 'Logistics & Packaging' },
  { key: 'education-ip', emoji: '📚', name: 'Education & IP' },
  { key: 'fashion', emoji: '✂', name: 'Fashion & Identity' },
  { key: 'gaming', emoji: '🎮', name: 'Gaming & Simulation' },
  { key: 'health', emoji: '🧠', name: 'Health & Hygiene' },
  { key: 'housing', emoji: '🏗️', name: 'Housing & Infrastructure' },
  { key: 'justice', emoji: '⚖', name: 'Justice & Ethics' },
  { key: 'knowledge', emoji: '📖', name: 'Knowledge & Archives' },
  { key: 'micromesh', emoji: '☰', name: 'Micro-Mesh Logistics' },
  { key: 'media', emoji: '🎬', name: 'Motion, Media & Sonic' },
  { key: 'nutrition', emoji: '✿', name: 'Nutrition & Food Chain' },
  { key: 'ai-logic', emoji: '🧠', name: 'AI, Logic & Grid' },
  { key: 'packaging', emoji: '📦', name: 'Packaging & Materials' },
  { key: 'quantum', emoji: '✴️', name: 'Quantum Protocols' },
  { key: 'ritual', emoji: '☯', name: 'Ritual & Culture' },
  { key: 'saas', emoji: '🔑', name: 'SaaS & Licensing' },
  { key: 'trade', emoji: '🧺', name: 'Trade Systems' },
  { key: 'utilities', emoji: '🔋', name: 'Utilities & Energy' },
  { key: 'voice', emoji: '🎙️', name: 'Voice & Audio' },
  { key: 'webless', emoji: '📡', name: 'Webless Tech & Nodes' },
  { key: 'nft', emoji: '🔁', name: 'NFT & Ownership' },
  { key: 'education-youth', emoji: '🎓', name: 'Education & Youth' },
  { key: 'zerowaste', emoji: '♻️', name: 'Zero Waste' },
  { key: 'professional', emoji: '🧾', name: 'Professional Services' },
  { key: 'payroll-mining', emoji: '🪙', name: 'Payroll Mining & Accounting' },
  { key: 'mining', emoji: '⛏️', name: 'Mining & Resources' },
  { key: 'wildlife', emoji: '🦁', name: 'Wildlife & Habitat' },

  // Additional 2 sectors from main data
  { key: 'admin-panel', emoji: '⚙️', name: 'Admin Panel' },
  { key: 'global-index', emoji: '🌐', name: 'Global Brand Index' },

  // Fruitful Crate Dance 12 sectors
  { key: 'sponsorship-management', emoji: '🤝', name: 'Sponsorship Management' },
  { key: 'event-management', emoji: '🎪', name: 'Event Management' },
  { key: 'content-creation', emoji: '🎬', name: 'Content Creation' },
  { key: 'talent-development', emoji: '🌟', name: 'Talent Development' },
  { key: 'community-engagement', emoji: '🏘️', name: 'Community Engagement' },
  { key: 'tech-infrastructure', emoji: '⚙️', name: 'Tech Infrastructure' },
  { key: 'logistics-operations', emoji: '📦', name: 'Logistics & Operations' },
  { key: 'financial-management', emoji: '💰', name: 'Financial Management' },
  { key: 'marketing-branding', emoji: '🎨', name: 'Marketing & Branding' },
  { key: 'partnership', emoji: '🤝', name: 'Partnership & Collaboration' },
  { key: 'analytics', emoji: '📊', name: 'Analytics & Insights' },
  { key: 'sustainability', emoji: '🌱', name: 'Sustainability & Impact' },

  // Final 3 infrastructure sectors
  { key: 'omnigrid', emoji: '🔗', name: 'OmniGrid System' },
  { key: 'baobab', emoji: '🌳', name: 'Baobab Security Network' },
  { key: 'planet-pulse', emoji: '🌍', name: 'Planet Pulse Global' },
];

export async function importFinal48Sectors() {
  console.log('🚀 IMPORTING FINAL 48-SECTOR SYSTEM...');
  console.log('');

  try {
    // Clear existing HSOMNI data
    await db.delete(hsomniBrands);
    await db.delete(hsomniSectors);
    
    console.log('✅ Cleared existing HSOMNI data');
    
    // Import all 48 sectors
    const sectorMap = new Map<string, any>();
    
    for (const sector of FINAL_48_SECTORS) {
      const [inserted] = await db.insert(hsomniSectors).values({
        sectorKey: sector.key,
        name: sector.name,
        emoji: sector.emoji,
        description: `${sector.name} comprehensive solutions and brand management`,
        brandCount: 0, // Will be updated after brand import
        subnodeCount: 0
      }).returning();
      
      sectorMap.set(sector.key, inserted);
    }
    
    console.log(`✅ Imported ${FINAL_48_SECTORS.length} sectors`);
    
    // Now import ALL brands from consolidated data
    const fs = await import('fs');
    const consolidatedData = JSON.parse(fs.readFileSync('consolidated-hsomni-data.json', 'utf8'));
    
    let brandCount = 0;
    for (const brandEntry of consolidatedData.brands) {
      // For each brand, insert it into all sectors it belongs to
      for (const sectorKey of brandEntry.sectors) {
        const sector = sectorMap.get(sectorKey);
        if (sector) {
          await db.insert(hsomniBrands).values({
            name: brandEntry.name,
            sectorId: sector.id,
            integration: 'VaultMesh™', // Default integration
            status: 'active',
            isCore: brandEntry.type === 'core',
            description: `${brandEntry.name} - ${sector.name} solution`,
            metadata: { origin: 'consolidated', type: brandEntry.type }
          });
          brandCount++;
        }
      }
    }
    
    console.log(`✅ Imported ${brandCount} brand-sector associations`);
    
    // Update sector counts
    for (const [sectorKey, sector] of sectorMap.entries()) {
      const allBrands = await db
        .select()
        .from(hsomniBrands)
        .where(eq(hsomniBrands.sectorId, sector.id));
      
      const subnodeBrands = allBrands.filter(b => !b.isCore);
      
      await db
        .update(hsomniSectors)
        .set({
          brandCount: allBrands.length,
          subnodeCount: subnodeBrands.length
        })
        .where(eq(hsomniSectors.id, sector.id));
    }
    
    console.log('✅ Updated sector brand counts');
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('📊 FINAL HSOMNI9000 SYSTEM');
    console.log('═══════════════════════════════════════════');
    console.log(`✅ Total Sectors: ${FINAL_48_SECTORS.length}`);
    console.log(`✅ Total Brand Associations: ${brandCount}`);
    console.log(`✅ Unique Brands: ${consolidatedData.totals.brands}`);
    console.log('═══════════════════════════════════════════');
    
  } catch (error) {
    console.error('❌ Error importing 48-sector system:', error);
    throw error;
  }
}

// Run if executed directly
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (import.meta.url === `file://${process.argv[1]}`) {
  importFinal48Sectors()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
