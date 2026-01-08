/**
 * Apply Licenses to heyns1000 Repositories
 * 
 * This script fetches all repositories under heyns1000, analyzes them using
 * AI-driven logic, and applies appropriate licenses (MIT, Apache 2.0, GPL, etc.)
 * to each repository's main branch.
 * 
 * Usage: tsx server/apply-licenses-to-repos.ts [--dry-run] [--repo-filter=<pattern>]
 */

import * as fs from 'fs';
import * as path from 'path';
import { recommendLicense, getLicenseTemplate, LICENSE_TEMPLATES, type RepositoryInfo, type LicenseRecommendation } from './license-framework';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const OWNER = 'heyns1000';

interface ApplyResult {
  repository: string;
  success: boolean;
  license: string;
  message: string;
  error?: string;
}

/**
 * Fetch all repositories for the owner
 */
async function fetchAllRepositories(owner: string): Promise<RepositoryInfo[]> {
  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN or GH_TOKEN environment variable is required');
  }

  const repos: RepositoryInfo[] = [];
  let page = 1;
  const perPage = 100;

  console.log(`🔍 Fetching repositories for ${owner}...`);

  while (true) {
    const response = await fetch(
      `https://api.github.com/users/${owner}/repos?per_page=${perPage}&page=${page}&type=all`,
      {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'LicenseVault-Framework',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch repositories: ${response.statusText}`);
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      break;
    }

    for (const repo of data) {
      repos.push({
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        language: repo.language,
        topics: repo.topics || [],
        private: repo.private,
        fork: repo.fork,
        archived: repo.archived,
        has_license: !!repo.license,
        existing_license: repo.license?.spdx_id,
      });
    }

    if (data.length < perPage) {
      break;
    }

    page++;
  }

  console.log(`✅ Found ${repos.length} repositories\n`);
  return repos;
}

/**
 * Check if a LICENSE file exists in the repository
 */
async function hasLicenseFile(owner: string, repo: string, branch: string = 'main'): Promise<boolean> {
  if (!GITHUB_TOKEN) return false;

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/LICENSE?ref=${branch}`,
      {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'LicenseVault-Framework',
        },
      }
    );
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get the default branch of a repository
 */
async function getDefaultBranch(owner: string, repo: string): Promise<string> {
  if (!GITHUB_TOKEN) return 'main';

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'LicenseVault-Framework',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data.default_branch || 'main';
    }
  } catch {
    // Fall through to default
  }

  return 'main';
}

/**
 * Create or update a LICENSE file in a repository
 */
async function applyLicenseToRepo(
  owner: string,
  repoName: string,
  licenseType: string,
  dryRun: boolean = false
): Promise<ApplyResult> {
  const result: ApplyResult = {
    repository: `${owner}/${repoName}`,
    success: false,
    license: licenseType,
    message: '',
  };

  try {
    // Get the default branch
    const defaultBranch = await getDefaultBranch(owner, repoName);

    // Check if LICENSE file already exists
    const hasLicense = await hasLicenseFile(owner, repoName, defaultBranch);

    if (hasLicense && !dryRun) {
      result.message = 'LICENSE file already exists, skipping';
      result.success = true;
      return result;
    }

    // Generate license content
    const licenseContent = getLicenseTemplate(licenseType, new Date().getFullYear(), 'Heyns Schoeman');

    if (dryRun) {
      result.message = `[DRY RUN] Would ${hasLicense ? 'update' : 'create'} LICENSE file with ${licenseType}`;
      result.success = true;
      return result;
    }

    // Create or update the LICENSE file via GitHub API
    const encodedContent = Buffer.from(licenseContent).toString('base64');

    let sha: string | undefined;
    if (hasLicense) {
      // Get existing file SHA to update
      const getResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}/contents/LICENSE?ref=${defaultBranch}`,
        {
          headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'LicenseVault-Framework',
          },
        }
      );

      if (getResponse.ok) {
        const data = await getResponse.json();
        sha = data.sha;
      }
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/contents/LICENSE`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'LicenseVault-Framework',
        },
        body: JSON.stringify({
          message: `Add ${licenseType} license`,
          content: encodedContent,
          branch: defaultBranch,
          ...(sha ? { sha } : {}),
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || response.statusText);
    }

    result.success = true;
    result.message = `Successfully ${hasLicense ? 'updated' : 'created'} LICENSE file with ${licenseType}`;
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
    result.message = `Failed to apply license: ${result.error}`;
  }

  return result;
}

/**
 * Main execution function
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const repoFilterArg = args.find(arg => arg.startsWith('--repo-filter='));
  const repoFilter = repoFilterArg ? repoFilterArg.split('=')[1] : null;

  console.log('═══════════════════════════════════════════════════════════');
  console.log('  LICENSE FRAMEWORK FOR HEYNS1000 REPOSITORIES');
  console.log('═══════════════════════════════════════════════════════════\n');

  if (dryRun) {
    console.log('⚠️  DRY RUN MODE - No changes will be made\n');
  }

  if (!GITHUB_TOKEN) {
    console.error('❌ Error: GITHUB_TOKEN or GH_TOKEN environment variable is required');
    console.error('   Please set one of these environment variables with a GitHub personal access token\n');
    process.exit(1);
  }

  // Fetch all repositories
  const allRepos = await fetchAllRepositories(OWNER);

  // Filter repositories if specified
  const repos = repoFilter
    ? allRepos.filter(repo => repo.name.includes(repoFilter))
    : allRepos;

  if (repos.length === 0) {
    console.log('No repositories found matching the filter\n');
    return;
  }

  console.log(`📊 Analyzing ${repos.length} repositories...\n`);

  // Generate recommendations for all repositories
  const recommendations: LicenseRecommendation[] = [];
  const results: ApplyResult[] = [];

  for (const repo of repos) {
    const recommendation = recommendLicense(repo);
    recommendations.push(recommendation);

    console.log(`\n📦 ${repo.name}`);
    console.log(`   License: ${recommendation.recommendedLicense}`);
    console.log(`   Confidence: ${recommendation.confidence}%`);
    console.log(`   Reason: ${recommendation.reason}`);

    if (repo.existing_license) {
      console.log(`   ⚠️  Existing license: ${repo.existing_license}`);
    }

    // Apply license to repository
    if (!dryRun || args.includes('--show-all')) {
      const result = await applyLicenseToRepo(
        OWNER,
        repo.name,
        recommendation.recommendedLicense,
        dryRun
      );
      results.push(result);
      console.log(`   ${result.success ? '✅' : '❌'} ${result.message}`);
    }

    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Generate summary report
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  SUMMARY REPORT');
  console.log('═══════════════════════════════════════════════════════════\n');

  const licenseCounts: Record<string, number> = {};
  for (const rec of recommendations) {
    licenseCounts[rec.recommendedLicense] = (licenseCounts[rec.recommendedLicense] || 0) + 1;
  }

  console.log('License Distribution:');
  for (const [license, count] of Object.entries(licenseCounts).sort((a, b) => b[1] - a[1])) {
    const percentage = ((count / recommendations.length) * 100).toFixed(1);
    console.log(`  ${license.padEnd(15)} ${count.toString().padStart(3)} repositories (${percentage}%)`);
  }

  if (!dryRun && results.length > 0) {
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`\nApplication Results:`);
    console.log(`  ✅ Successful: ${successful}`);
    console.log(`  ❌ Failed: ${failed}`);
  }

  // Save detailed report to file
  const reportPath = path.join(process.cwd(), 'LICENSE-AUDIT-REPORT.json');
  const report = {
    timestamp: new Date().toISOString(),
    totalRepositories: repos.length,
    dryRun,
    recommendations,
    results: dryRun ? [] : results,
    summary: {
      licenseCounts,
      successfulApplications: results.filter(r => r.success).length,
      failedApplications: results.filter(r => !r.success).length,
    },
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);

  console.log('\n✅ License framework execution complete\n');
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
}

export { main, fetchAllRepositories, applyLicenseToRepo };
