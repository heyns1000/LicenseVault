/**
 * License Framework for heyns1000 Repositories
 * 
 * This module provides AI-driven logic to assign appropriate licenses
 * (MIT, Apache 2.0, GPL, etc.) to repositories based on their characteristics.
 */

export interface RepositoryInfo {
  name: string;
  full_name: string;
  description?: string;
  language?: string;
  topics?: string[];
  private: boolean;
  fork: boolean;
  archived: boolean;
  has_license: boolean;
  existing_license?: string;
}

export interface LicenseRecommendation {
  repository: string;
  recommendedLicense: string;
  reason: string;
  confidence: number;
}

export const LICENSE_TEMPLATES = {
  MIT: {
    name: 'MIT License',
    identifier: 'MIT',
    description: 'A permissive license that is short and to the point. It lets people do anything with your code with proper attribution.',
    url: 'https://opensource.org/licenses/MIT',
  },
  'Apache-2.0': {
    name: 'Apache License 2.0',
    identifier: 'Apache-2.0',
    description: 'A permissive license that also provides an express grant of patent rights from contributors.',
    url: 'https://opensource.org/licenses/Apache-2.0',
  },
  'GPL-3.0': {
    name: 'GNU General Public License v3.0',
    identifier: 'GPL-3.0',
    description: 'Strong copyleft license that requires derivative works to be released under the same license.',
    url: 'https://www.gnu.org/licenses/gpl-3.0.html',
  },
  'LGPL-3.0': {
    name: 'GNU Lesser General Public License v3.0',
    identifier: 'LGPL-3.0',
    description: 'Weaker copyleft license that allows linking to proprietary software.',
    url: 'https://www.gnu.org/licenses/lgpl-3.0.html',
  },
  'BSD-3-Clause': {
    name: 'BSD 3-Clause License',
    identifier: 'BSD-3-Clause',
    description: 'A permissive license similar to MIT but with an additional non-endorsement clause.',
    url: 'https://opensource.org/licenses/BSD-3-Clause',
  },
  'MPL-2.0': {
    name: 'Mozilla Public License 2.0',
    identifier: 'MPL-2.0',
    description: 'Weak copyleft license that requires only modified files to be shared under the same license.',
    url: 'https://opensource.org/licenses/MPL-2.0',
  },
};

/**
 * AI-driven logic to determine the best license for a repository
 * based on its characteristics, language, description, and topics.
 */
export function recommendLicense(repo: RepositoryInfo): LicenseRecommendation {
  let score: Record<string, number> = {
    'MIT': 0,
    'Apache-2.0': 0,
    'GPL-3.0': 0,
    'LGPL-3.0': 0,
    'BSD-3-Clause': 0,
    'MPL-2.0': 0,
  };

  let reasons: string[] = [];

  // Default: MIT is the most popular open source license
  score['MIT'] += 50;

  // If archived, suggest MIT (simplest, most permissive)
  if (repo.archived) {
    score['MIT'] += 30;
    reasons.push('Archived repository benefits from simple, permissive license');
  }

  // If it's a fork, inherit parent's license philosophy (default MIT)
  if (repo.fork) {
    score['MIT'] += 20;
    reasons.push('Fork typically inherits permissive licensing approach');
  }

  // Language-based recommendations
  if (repo.language) {
    const lang = repo.language.toLowerCase();
    
    // JavaScript/TypeScript ecosystem favors MIT
    if (lang.includes('javascript') || lang.includes('typescript')) {
      score['MIT'] += 40;
      reasons.push('JavaScript/TypeScript ecosystem commonly uses MIT');
    }
    
    // Python has mixed preferences but MIT is common
    if (lang.includes('python')) {
      score['MIT'] += 30;
      score['Apache-2.0'] += 20;
      reasons.push('Python projects often use MIT or Apache 2.0');
    }
    
    // Java projects often use Apache 2.0
    if (lang.includes('java')) {
      score['Apache-2.0'] += 40;
      score['MIT'] += 20;
      reasons.push('Java ecosystem commonly uses Apache 2.0');
    }
    
    // C/C++ projects might use GPL for libraries
    if (lang.includes('c++') || lang.includes('c') && !lang.includes('javascript')) {
      score['GPL-3.0'] += 20;
      score['LGPL-3.0'] += 20;
      score['MIT'] += 30;
      reasons.push('C/C++ projects use varied licenses');
    }
    
    // Shell scripts are typically MIT or Apache
    if (lang.includes('shell')) {
      score['MIT'] += 30;
      score['Apache-2.0'] += 20;
      reasons.push('Shell scripts commonly use permissive licenses');
    }
  }

  // Description-based recommendations
  if (repo.description) {
    const desc = repo.description.toLowerCase();
    
    // API, platform, framework suggests Apache 2.0 (patent protection)
    if (desc.includes('api') || desc.includes('platform') || desc.includes('framework')) {
      score['Apache-2.0'] += 30;
      reasons.push('API/Platform benefits from patent protection in Apache 2.0');
    }
    
    // Library suggests LGPL for copyleft or MIT for permissive
    if (desc.includes('library') || desc.includes('lib')) {
      score['LGPL-3.0'] += 15;
      score['MIT'] += 25;
      reasons.push('Libraries benefit from permissive licenses for wider adoption');
    }
    
    // Enterprise or legal mentions suggest Apache 2.0
    if (desc.includes('enterprise') || desc.includes('legal') || desc.includes('compliance')) {
      score['Apache-2.0'] += 35;
      reasons.push('Enterprise projects benefit from Apache 2.0 clarity');
    }
    
    // Free software, copyleft suggests GPL
    if (desc.includes('free software') || desc.includes('copyleft')) {
      score['GPL-3.0'] += 40;
      reasons.push('Explicit copyleft preference detected');
    }
    
    // Admin, management, portal suggests MIT (internal tools)
    if (desc.includes('admin') || desc.includes('portal') || desc.includes('dashboard')) {
      score['MIT'] += 25;
      reasons.push('Administrative tools typically use MIT');
    }
  }

  // Topics-based recommendations
  if (repo.topics && repo.topics.length > 0) {
    for (const topic of repo.topics) {
      const t = topic.toLowerCase();
      
      if (t.includes('config') || t.includes('github-config')) {
        score['MIT'] += 20;
        reasons.push('Configuration repositories typically use MIT');
      }
      
      if (t.includes('api') || t.includes('rest')) {
        score['Apache-2.0'] += 20;
      }
      
      if (t.includes('library') || t.includes('framework')) {
        score['MIT'] += 15;
      }
    }
  }

  // Name-based heuristics
  if (repo.name) {
    const name = repo.name.toLowerCase();
    
    // seedwave, faa.zone ecosystem - use MIT for consistency
    if (name.includes('seedwave') || name.includes('faa.zone') || name.includes('faa-zone')) {
      score['MIT'] += 35;
      reasons.push('Part of FAA ecosystem, using MIT for consistency');
    }
    
    // API, backend, platform projects
    if (name.includes('api') || name.includes('backend') || name.includes('platform')) {
      score['Apache-2.0'] += 25;
    }
    
    // Config, vaultmesh, admin
    if (name.includes('config') || name.includes('vault') || name.includes('admin')) {
      score['MIT'] += 25;
    }
  }

  // Find the license with the highest score
  let bestLicense = 'MIT';
  let maxScore = score['MIT'];
  
  for (const [license, licenseScore] of Object.entries(score)) {
    if (licenseScore > maxScore) {
      maxScore = licenseScore;
      bestLicense = license;
    }
  }

  // Calculate confidence (normalize score to 0-100)
  const totalScore = Object.values(score).reduce((a, b) => a + b, 0);
  const confidence = Math.min(100, Math.round((maxScore / totalScore) * 100));

  // Generate reason summary
  let reasonSummary = reasons.length > 0 
    ? reasons.slice(0, 3).join('; ') 
    : 'Default recommendation based on best practices';

  return {
    repository: repo.full_name,
    recommendedLicense: bestLicense,
    reason: reasonSummary,
    confidence,
  };
}

/**
 * Get the license template content for a specific license type
 */
export function getLicenseTemplate(licenseType: string, year: number, owner: string): string {
  const templates: Record<string, string> = {
    'MIT': `MIT License

Copyright (c) ${year} ${owner}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,

    'Apache-2.0': `Apache License
Version 2.0, January 2004
http://www.apache.org/licenses/

Copyright ${year} ${owner}

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.`,

    'GPL-3.0': `GNU GENERAL PUBLIC LICENSE
Version 3, 29 June 2007

Copyright (C) ${year} ${owner}

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.`,

    'BSD-3-Clause': `BSD 3-Clause License

Copyright (c) ${year}, ${owner}
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.`,
  };

  return templates[licenseType] || templates['MIT'];
}
