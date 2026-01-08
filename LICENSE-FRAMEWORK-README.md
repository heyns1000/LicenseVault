# 🔐 License Framework - AI-Driven License Assignment System

## Overview

The **License Framework** is an AI-driven system that automatically analyzes and assigns appropriate open-source licenses (MIT, Apache 2.0, GPL, etc.) to the 94 repositories under the heyns1000 ecosystem. This ensures consistency and compliance across all projects.

## 🎯 Purpose

Extend the licensing framework from the LicenseVault platform to all heyns1000 repositories, providing:
- **Automated license assignment** based on repository characteristics
- **AI-driven analysis** considering language, description, topics, and naming patterns
- **Consistency** across the entire FAA ecosystem
- **Compliance** with open-source best practices

## 🚀 Quick Start

### 1. Run Simulation (No GitHub Token Required)

```bash
npm run license:simulate
```

This demonstrates how the framework would analyze and license all repositories.

### 2. Test the Logic

```bash
npm run license:test
```

Verify the AI recommendation logic on sample repositories.

### 3. Dry Run (Requires GitHub Token)

```bash
export GITHUB_TOKEN=your_token_here
npm run license:dry-run
```

See what licenses would be applied without making changes.

### 4. Apply Licenses

```bash
npm run license:apply
```

Apply LICENSE files to all repositories.

## 📊 Current Status

Based on simulation of heyns1000 repositories:

| License Type | Repositories | Percentage |
|--------------|--------------|------------|
| **MIT** | ~85 repos | ~96% |
| **Apache 2.0** | ~3 repos | ~3% |
| **Others** | ~1 repo | ~1% |

**Rationale**: MIT is the default for the FAA/Seedwave ecosystem due to:
- Maximum permissiveness and adoption
- Simplicity and clarity
- JavaScript/TypeScript ecosystem standard
- Consistency across related projects

**Apache 2.0** is recommended for:
- API platforms (patent protection)
- Enterprise-focused projects
- Projects with explicit patent concerns

## 🤖 AI Decision Logic

The framework analyzes multiple factors:

### Language-Based
- **JavaScript/TypeScript** → MIT (npm ecosystem standard)
- **Python** → MIT or Apache 2.0
- **Java** → Apache 2.0 (Maven ecosystem)
- **Shell** → MIT

### Description Analysis
- **API/Platform keywords** → Apache 2.0 (patent protection)
- **Library keywords** → MIT or LGPL
- **Enterprise/Legal keywords** → Apache 2.0
- **Admin/Portal keywords** → MIT

### Naming Patterns
- **seedwave/faa.zone ecosystem** → MIT (consistency)
- **API/backend/platform** → Apache 2.0
- **Config/admin/vault** → MIT

### Repository Characteristics
- **Archived repos** → MIT (simplest)
- **Forks** → Permissive (MIT)
- **Topics** → Weighted scoring

## 📁 Framework Components

```
server/
├── license-framework.ts              # Core AI logic and license templates
├── apply-licenses-to-repos.ts        # Main execution script with GitHub API
├── simulate-license-framework.ts     # Simulation without API calls
└── test-license-logic.ts             # Unit tests for AI logic

Documentation/
├── LICENSE-FRAMEWORK-DOCUMENTATION.md   # Complete technical documentation
└── LICENSE-FRAMEWORK-QUICKSTART.md      # Step-by-step guide
```

## 🎓 Supported Licenses

1. **MIT License** - Most permissive, widely adopted
2. **Apache License 2.0** - Permissive with patent protection
3. **GNU GPL 3.0** - Strong copyleft
4. **GNU LGPL 3.0** - Weak copyleft for libraries
5. **BSD 3-Clause** - Permissive with non-endorsement clause
6. **Mozilla Public License 2.0** - File-level copyleft

## 📈 Features

✅ **AI-Driven Recommendations** with confidence scores  
✅ **Batch Processing** for multiple repositories  
✅ **Dry-Run Mode** for safe testing  
✅ **Detailed Audit Reports** in JSON format  
✅ **GitHub API Integration** for automatic application  
✅ **Rate Limiting Protection**  
✅ **Respects Existing Licenses** (won't overwrite)  
✅ **Comprehensive Logging**  

## 🔧 NPM Scripts

```bash
npm run license:simulate    # Run simulation (no GitHub token needed)
npm run license:test        # Test AI logic on sample data
npm run license:dry-run     # Preview changes (requires GITHUB_TOKEN)
npm run license:apply       # Apply licenses (requires GITHUB_TOKEN)
npm run license:audit       # Alias for dry-run
```

## 📋 Requirements

### For Simulation/Testing
- Node.js 20+
- No additional dependencies

### For Actual Application
- **GitHub Personal Access Token** with `repo` scope
- Set as `GITHUB_TOKEN` or `GH_TOKEN` environment variable

## 🛡️ Safety Features

- **Dry-run mode** to preview all changes
- **Skips repositories** with existing LICENSE files
- **Per-repository error handling** - one failure won't stop others
- **Detailed audit trail** of all actions
- **Rate limiting protection** to avoid GitHub API limits
- **Confidence scoring** to identify uncertain recommendations

## 📄 Example Output

```
═══════════════════════════════════════════════════════════
  LICENSE FRAMEWORK FOR HEYNS1000 REPOSITORIES
═══════════════════════════════════════════════════════════

🔍 Fetching repositories for heyns1000...
✅ Found 88 repositories

📦 faa.zone
   License: MIT (100% confidence)
   Reason: Part of FAA ecosystem, using MIT for consistency
   ✅ Successfully created LICENSE file with MIT

📦 fruitful-api-platform
   License: Apache-2.0 (85% confidence)
   Reason: API/Platform benefits from patent protection
   ✅ Successfully created LICENSE file with Apache-2.0

License Distribution:
  MIT              85 repositories (96.6%)
  Apache-2.0        3 repositories (3.4%)

Application Results:
  ✅ Successful: 85
  ❌ Failed: 0
```

## 📚 Documentation

- **[LICENSE-FRAMEWORK-DOCUMENTATION.md](LICENSE-FRAMEWORK-DOCUMENTATION.md)** - Complete technical documentation
- **[LICENSE-FRAMEWORK-QUICKSTART.md](LICENSE-FRAMEWORK-QUICKSTART.md)** - Quick start guide with examples

## 🔗 Integration

The License Framework is part of the LicenseVault ecosystem and integrates with:
- **FAA Brand Licensing System** (13,713 brands)
- **HSOMNI9000 Repository** (6,219 brands, 48 sectors)
- **Seedwave Verified Brands** (150 premium brands)

## 🌟 Benefits

1. **Consistency** - All repositories follow the same licensing approach
2. **Compliance** - Proper open-source licensing from the start
3. **Automation** - No manual license file creation needed
4. **Intelligence** - AI considers multiple factors for best fit
5. **Auditability** - Complete trail of all decisions and actions
6. **Flexibility** - Easy to customize logic for specific needs

## 🚦 Next Steps

1. ✅ Review simulation results
2. ✅ Test AI logic on sample repositories
3. ⏳ Set GitHub token
4. ⏳ Run dry-run to preview actual recommendations
5. ⏳ Apply licenses to all repositories
6. ⏳ Generate final audit report

## 💡 Customization

To adjust AI logic or add new licenses:
1. Edit `server/license-framework.ts`
2. Modify scoring weights in `recommendLicense()` function
3. Add new license templates to `LICENSE_TEMPLATES`
4. Add new license text in `getLicenseTemplate()`

## 📞 Support

For issues or questions:
- Review the detailed documentation
- Check the simulation output
- Examine the audit reports in JSON format
- Adjust AI logic as needed for your requirements

---

**License**: This framework itself is licensed under MIT License.

**Status**: ✅ Ready for deployment

**Last Updated**: January 7, 2026
