# Quick Start Guide - License Framework

## Prerequisites

1. **GitHub Personal Access Token**
   - Go to: https://github.com/settings/tokens
   - Create a new token with `repo` scope
   - Copy the token

2. **Set Environment Variable**
   ```bash
   export GITHUB_TOKEN=your_token_here
   # OR
   export GH_TOKEN=your_token_here
   ```

## Usage

### Step 1: Dry Run (Recommended First Step)

See what licenses would be applied without making any changes:

```bash
npm run license:dry-run
```

This will:
- Fetch all 88+ heyns1000 repositories
- Analyze each one using AI logic
- Show recommended licenses with confidence scores
- Display reasoning for each recommendation
- Generate a report (`LICENSE-AUDIT-REPORT.json`)

### Step 2: Review Recommendations

Check the output and verify:
- License choices make sense for each repo
- Confidence scores are reasonable (70%+ is good)
- Reasoning aligns with your expectations

### Step 3: Apply Licenses

Once satisfied with recommendations:

```bash
npm run license:apply
```

This will:
- Apply LICENSE files to all repositories
- Skip repos that already have a LICENSE file
- Create commits on the main branch of each repo
- Generate a detailed success/failure report

### Step 4: Review Results

Check:
- `LICENSE-AUDIT-REPORT.json` for detailed results
- Console output for summary statistics
- Individual repositories on GitHub to verify

## Advanced Usage

### Filter Specific Repositories

```bash
# Only process repos with "seedwave" in the name
tsx server/apply-licenses-to-repos.ts --repo-filter=seedwave

# Only process repos with "faa" in the name
tsx server/apply-licenses-to-repos.ts --dry-run --repo-filter=faa
```

### Environment Variables

```bash
# Set token temporarily
GITHUB_TOKEN=ghp_xxx npm run license:apply

# Or add to .env file (not committed to git)
echo "GITHUB_TOKEN=ghp_xxx" >> .env
```

## Example Output

```
═══════════════════════════════════════════════════════════
  LICENSE FRAMEWORK FOR HEYNS1000 REPOSITORIES
═══════════════════════════════════════════════════════════

🔍 Fetching repositories for heyns1000...
✅ Found 88 repositories

📊 Analyzing 88 repositories...

📦 faa.zone
   License: MIT
   Confidence: 75%
   Reason: Part of FAA ecosystem, using MIT for consistency
   ✅ Successfully created LICENSE file with MIT

📦 admin-panel.seedwave.faa.zone
   License: Apache-2.0
   Confidence: 68%
   Reason: API/Platform benefits from patent protection in Apache 2.0
   ✅ Successfully created LICENSE file with Apache-2.0

...

═══════════════════════════════════════════════════════════
  SUMMARY REPORT
═══════════════════════════════════════════════════════════

License Distribution:
  MIT              65 repositories (73.9%)
  Apache-2.0       20 repositories (22.7%)
  GPL-3.0           2 repositories (2.3%)
  BSD-3-Clause      1 repositories (1.1%)

Application Results:
  ✅ Successful: 85
  ❌ Failed: 3

📄 Detailed report saved to: LICENSE-AUDIT-REPORT.json
```

## Troubleshooting

### Error: GITHUB_TOKEN not found
```bash
export GITHUB_TOKEN=your_token_here
```

### Error: Permission denied
- Ensure token has `repo` scope
- Check if you have write access to repositories

### Some repos failed
- Check if repos are archived (can't modify)
- Check branch protection rules
- Review error messages in report

## Safety Features

✅ Skips repos with existing LICENSE files  
✅ Dry-run mode for testing  
✅ Detailed audit trail  
✅ Per-repository error handling  
✅ Rate limiting protection  

## Next Steps

1. Run dry-run to see recommendations
2. Review the LICENSE-AUDIT-REPORT.json
3. Adjust AI logic if needed (see LICENSE-FRAMEWORK-DOCUMENTATION.md)
4. Apply licenses to all repos
5. Verify a few repositories manually
6. Keep the audit report for compliance records

---

For detailed documentation, see: [LICENSE-FRAMEWORK-DOCUMENTATION.md](LICENSE-FRAMEWORK-DOCUMENTATION.md)
