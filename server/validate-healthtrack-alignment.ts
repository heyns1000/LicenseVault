import { db } from './db';
import { hsomniBrands, hsomniSectors } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function validateHealthTrackAlignment(): Promise<boolean> {
  try {
    const [healthSector] = await db.select().from(hsomniSectors).where(eq(hsomniSectors.sectorKey, 'health'));
    
    if (!healthSector) {
      console.error('❌ Health sector not found');
      return false;
    }
    
    const brandCounts = await db.select({
      total: sql<number>`COUNT(*)`,
      cores: sql<number>`COUNT(CASE WHEN ${hsomniBrands.isCore} THEN 1 END)`,
      subnodes: sql<number>`COUNT(CASE WHEN NOT ${hsomniBrands.isCore} THEN 1 END)`,
      fruitfulCount: sql<number>`COUNT(CASE WHEN ${hsomniBrands.metadata}->>'source' = 'FruitfulPlanetChange' THEN 1 END)`
    }).from(hsomniBrands).where(eq(hsomniBrands.sectorId, healthSector.id));
    
    const counts = brandCounts[0];
    
    // Convert to numbers since SQL may return strings
    const total = Number(counts.total);
    const cores = Number(counts.cores);
    const subnodes = Number(counts.subnodes);
    const fruitfulCount = Number(counts.fruitfulCount);
    
    const isValid = 
      total === 465 &&
      cores === 93 &&
      subnodes === 372 &&
      fruitfulCount === 465;
    
    if (isValid) {
      console.log('✅ HealthTrack alignment validated:');
      console.log(`   - Total brands: ${total} (expected: 465)`);
      console.log(`   - CORE brands: ${cores} (expected: 93)`);
      console.log(`   - Subnodes: ${subnodes} (expected: 372)`);
      console.log(`   - FruitfulPlanetChange source: ${fruitfulCount} (expected: 465)`);
    } else {
      console.error('❌ HealthTrack alignment validation FAILED:');
      console.error(`   - Total: ${total} (expected: 465)`);
      console.error(`   - CORE: ${cores} (expected: 93)`);
      console.error(`   - Subnodes: ${subnodes} (expected: 372)`);
      console.error(`   - FruitfulPlanetChange: ${fruitfulCount} (expected: 465)`);
    }
    
    return isValid;
  } catch (error) {
    console.error('❌ Validation error:', error);
    return false;
  }
}

// Run validation when executed directly
validateHealthTrackAlignment().then(valid => {
  if (import.meta.url === `file://${process.argv[1]}`) {
    process.exit(valid ? 0 : 1);
  }
});
