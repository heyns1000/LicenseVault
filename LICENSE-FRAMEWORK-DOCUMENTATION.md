# License Framework Extension for heyns1000 Repositories

## Overview

This licensing framework provides AI-driven logic to automatically assign appropriate open-source licenses (MIT, Apache 2.0, GPL, BSD, etc.) to repositories based on their characteristics. The framework analyzes repository metadata including language, description, topics, and naming patterns to make intelligent recommendations.

## Features

- 🤖 **AI-Driven Analysis**: Intelligent license recommendation based on repository characteristics
- 📊 **Multiple License Support**: MIT, Apache 2.0, GPL-3.0, LGPL-3.0, BSD-3-Clause, MPL-2.0
- 🎯 **Confidence Scoring**: Each recommendation includes a confidence score (0-100%)
- 🔄 **Batch Processing**: Apply licenses to multiple repositories at once
- 📝 **Detailed Reporting**: Comprehensive audit reports in JSON format
- 🔒 **Safe Defaults**: Conservative, permissive licensing approach when uncertain
- 🧪 **Dry Run Mode**: Test recommendations without making changes

## Supported Licenses

| License | Best For | Key Feature |
|---------|----------|-------------|
| **MIT** | Most projects | Simple, permissive, widely used |
| **Apache 2.0** | APIs, platforms, enterprise | Patent protection included |
| **GPL 3.0** | Free software | Strong copyleft |
| **LGPL 3.0** | Libraries | Weak copyleft, allows linking |
| **BSD 3-Clause** | Alternative to MIT | Non-endorsement clause |
| **MPL 2.0** | Firefox-style projects | File-level copyleft |

## AI Decision Logic

The framework uses a scoring system that considers:

### 1. Language Analysis
- **JavaScript/TypeScript**: Favors MIT (common in npm ecosystem)
- **Python**: Favors MIT or Apache 2.0
- **Java**: Favors Apache 2.0 (common in Maven ecosystem)
- **C/C++**: Considers GPL/LGPL for libraries
- **Shell**: Favors permissive licenses (MIT/Apache)

### 2. Description Analysis
- **API/Platform keywords**: Apache 2.0 (patent protection)
- **Library keywords**: MIT or LGPL (depending on goals)
- **Enterprise/Legal keywords**: Apache 2.0 (clarity)
- **Free software/Copyleft keywords**: GPL 3.0
- **Admin/Portal keywords**: MIT (internal tools)

### 3. Repository Characteristics
- **Archived repos**: MIT (simplest)
- **Forks**: Inherit permissive approach (MIT)
- **Topics**: Config files → MIT, APIs → Apache, etc.

### 4. Naming Patterns
- **seedwave/faa.zone ecosystem**: MIT for consistency
- **API/backend/platform names**: Apache 2.0
- **Config/admin/vault names**: MIT

## Installation

No additional dependencies required beyond the existing project setup.

## Usage

### Command Line

```bash
# Dry run - see recommendations without making changes
tsx server/apply-licenses-to-repos.ts --dry-run

# Apply licenses to all repositories
GITHUB_TOKEN=your_token tsx server/apply-licenses-to-repos.ts

# Filter to specific repositories
tsx server/apply-licenses-to-repos.ts --repo-filter=seedwave

# Combination
tsx server/apply-licenses-to-repos.ts --dry-run --repo-filter=faa
```

### Environment Variables

- `GITHUB_TOKEN` or `GH_TOKEN`: GitHub personal access token with `repo` scope

### Programmatic Usage

```typescript
import { recommendLicense, getLicenseTemplate } from './server/license-framework';

// Get license recommendation
const repo = {
  name: 'my-api',
  full_name: 'owner/my-api',
  description: 'REST API platform',
  language: 'TypeScript',
  topics: ['api', 'rest'],
  private: false,
  fork: false,
  archived: false,
  has_license: false,
};

const recommendation = recommendLicense(repo);
console.log(recommendation);
// {
//   repository: 'owner/my-api',
//   recommendedLicense: 'Apache-2.0',
//   reason: 'API/Platform benefits from patent protection...',
//   confidence: 85
// }

// Get license text
const licenseText = getLicenseTemplate('Apache-2.0', 2025, 'Your Name');
```

## Output

### Console Output

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

### JSON Report

A detailed `LICENSE-AUDIT-REPORT.json` file is generated containing:

```json
{
  "timestamp": "2025-01-07T21:40:00.000Z",
  "totalRepositories": 88,
  "dryRun": false,
  "recommendations": [
    {
      "repository": "heyns1000/faa.zone",
      "recommendedLicense": "MIT",
      "reason": "Part of FAA ecosystem, using MIT for consistency",
      "confidence": 75
    }
  ],
  "results": [
    {
      "repository": "heyns1000/faa.zone",
      "success": true,
      "license": "MIT",
      "message": "Successfully created LICENSE file with MIT"
    }
  ],
  "summary": {
    "licenseCounts": {
      "MIT": 65,
      "Apache-2.0": 20,
      "GPL-3.0": 2,
      "BSD-3-Clause": 1
    },
    "successfulApplications": 85,
    "failedApplications": 3
  }
}
```

## GitHub API Requirements

### Personal Access Token

Create a GitHub personal access token with the following permissions:
- `repo` (Full control of private repositories)
- `public_repo` (if only targeting public repositories)

### Rate Limits

- The script includes automatic delays to avoid rate limiting
- GitHub API allows 5,000 requests per hour for authenticated requests
- The script processes ~3-4 API calls per repository

## Best Practices

1. **Always run dry-run first**: Test recommendations before applying
2. **Review recommendations**: Check the confidence scores and reasons
3. **Respect existing licenses**: Script skips repos with existing LICENSE files by default
4. **Backup important repos**: Consider backing up before bulk operations
5. **Test on a few repos first**: Use `--repo-filter` to test on a subset

## Customization

### Adding New Licenses

Edit `server/license-framework.ts`:

```typescript
export const LICENSE_TEMPLATES = {
  // Add new license
  'AGPL-3.0': {
    name: 'GNU Affero General Public License v3.0',
    identifier: 'AGPL-3.0',
    description: 'Strong copyleft for network services',
    url: 'https://www.gnu.org/licenses/agpl-3.0.html',
  },
};

// Add template in getLicenseTemplate()
```

### Adjusting AI Logic

Modify the `recommendLicense()` function in `server/license-framework.ts` to adjust scoring weights or add new criteria.

## Troubleshooting

### "GITHUB_TOKEN not found"
- Set `GITHUB_TOKEN` or `GH_TOKEN` environment variable
- Ensure token has correct permissions

### "Failed to fetch repositories"
- Check token validity
- Verify network connectivity
- Ensure owner name is correct

### "Failed to apply license"
- Check if repo allows modifications
- Verify branch protection rules
- Ensure token has write permissions

## Architecture

```
server/
├── license-framework.ts          # Core AI logic and license templates
└── apply-licenses-to-repos.ts    # Main execution script

Generated files:
└── LICENSE-AUDIT-REPORT.json     # Detailed audit report
```

## Integration with Existing Systems

This framework can be integrated with:
- **CI/CD pipelines**: Automatically check/apply licenses on new repos
- **Repository templates**: Pre-configure licenses for new projects
- **Audit systems**: Regular compliance checks
- **Brand management**: Consistency across the FAA ecosystem

## Contributing

To extend the framework:

1. Add new license templates to `LICENSE_TEMPLATES`
2. Enhance AI logic in `recommendLicense()`
3. Add new command-line options
4. Improve error handling and reporting

## License

This licensing framework itself is released under the MIT License.

---

**Note**: This framework is designed for the heyns1000 ecosystem but can be adapted for other GitHub users or organizations by modifying the `OWNER` constant.
