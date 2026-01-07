/**
 * Test script to verify the license recommendation logic
 */

import { recommendLicense, LICENSE_TEMPLATES, type RepositoryInfo } from './license-framework';

console.log('═══════════════════════════════════════════════════════════');
console.log('  LICENSE FRAMEWORK LOGIC TEST');
console.log('═══════════════════════════════════════════════════════════\n');

// Test repositories with different characteristics
const testRepos: RepositoryInfo[] = [
  {
    name: 'faa.zone',
    full_name: 'heyns1000/faa.zone',
    description: 'FruitfulGlobalPlanet',
    language: 'HTML',
    topics: [],
    private: false,
    fork: false,
    archived: false,
    has_license: false,
  },
  {
    name: 'admin-panel.seedwave.faa.zone',
    full_name: 'heyns1000/admin-panel.seedwave.faa.zone',
    description: 'Admin panel for seedwave platform',
    language: 'TypeScript',
    topics: ['admin', 'dashboard'],
    private: false,
    fork: false,
    archived: false,
    has_license: false,
  },
  {
    name: 'fruitful-api-platform',
    full_name: 'heyns1000/fruitful-api-platform',
    description: 'Enterprise API developer console for Fruitful Global Planet - OAuth2, REST APIs, WebSockets',
    language: 'JavaScript',
    topics: ['api', 'oauth2', 'rest'],
    private: false,
    fork: false,
    archived: false,
    has_license: false,
  },
  {
    name: 'legal',
    full_name: 'heyns1000/legal',
    description: 'all legal minutes of meetings, documents and a global legal index for all repositories',
    language: 'HTML',
    topics: [],
    private: false,
    fork: false,
    archived: false,
    has_license: false,
  },
  {
    name: 'Fruitful-Phyton-backend',
    full_name: 'heyns1000/Fruitful-Phyton-backend',
    description: undefined,
    language: 'Python',
    topics: [],
    private: false,
    fork: false,
    archived: false,
    has_license: false,
  },
  {
    name: 'omnigrid',
    full_name: 'heyns1000/omnigrid',
    description: 'Omni Grid™: The Universal Interconnected Network of FAA.zone™',
    language: 'TypeScript',
    topics: [],
    private: false,
    fork: false,
    archived: false,
    has_license: false,
  },
];

console.log(`Testing license recommendations for ${testRepos.length} repositories:\n`);

for (const repo of testRepos) {
  const recommendation = recommendLicense(repo);
  
  console.log(`📦 ${repo.name}`);
  console.log(`   Language: ${repo.language || 'N/A'}`);
  console.log(`   Description: ${repo.description || 'N/A'}`);
  console.log(`   ─────────────────────────────────────────`);
  console.log(`   ✅ Recommended: ${recommendation.recommendedLicense}`);
  console.log(`   📊 Confidence: ${recommendation.confidence}%`);
  console.log(`   💡 Reason: ${recommendation.reason}`);
  console.log('');
}

// Show available licenses
console.log('═══════════════════════════════════════════════════════════');
console.log('  AVAILABLE LICENSES');
console.log('═══════════════════════════════════════════════════════════\n');

for (const [key, license] of Object.entries(LICENSE_TEMPLATES)) {
  console.log(`${key.padEnd(15)} - ${license.name}`);
  console.log(`${''.padEnd(15)}   ${license.description}`);
  console.log('');
}

console.log('✅ License framework logic test complete\n');
