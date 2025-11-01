import { google } from 'googleapis';
import * as fs from 'fs';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-drive',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Google Drive not connected');
  }
  return accessToken;
}

async function getGoogleDriveClient() {
  const accessToken = await getAccessToken();
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.drive({ version: 'v3', auth: oauth2Client });
}

async function auditGitHubRepos() {
  const drive = await getGoogleDriveClient();
  
  console.log('🔍 AUDITING ALL GITHUB REPOSITORIES FROM GOOGLE DRIVE...\n');
  
  const queries = [
    "name contains '.git'",
    "name contains '.github'",
    "name contains 'repository'",
    "name contains 'repo'",
  ];
  
  const allFiles: any[] = [];
  
  for (const query of queries) {
    let pageToken = null;
    do {
      const response: any = await drive.files.list({
        q: query,
        pageSize: 1000,
        pageToken: pageToken || undefined,
        fields: 'nextPageToken, files(id, name, mimeType, createdTime, modifiedTime, size, webViewLink, parents, owners, shared, description)',
        orderBy: 'modifiedTime desc'
      });
      
      if (response.data.files) {
        allFiles.push(...response.data.files);
      }
      
      pageToken = response.data.nextPageToken;
    } while (pageToken);
  }
  
  // Deduplicate by file ID
  const uniqueFiles = Array.from(new Map(allFiles.map(f => [f.id, f])).values());
  
  // Filter for actual Git repos
  const gitRepos = uniqueFiles.filter(f => 
    f.name === '.git' ||
    f.name === '.github' ||
    f.name.toLowerCase().includes('repository') ||
    (f.mimeType === 'application/vnd.google-apps.folder' && f.name.toLowerCase().includes('repo'))
  );
  
  // Get parent folder names for context (this is likely the repo name)
  for (const repo of gitRepos) {
    if (repo.parents && repo.parents.length > 0) {
      try {
        const parent = await drive.files.get({
          fileId: repo.parents[0],
          fields: 'id, name, createdTime, modifiedTime'
        });
        repo.repositoryName = parent.data.name;
        repo.repositoryCreated = parent.data.createdTime;
        repo.repositoryModified = parent.data.modifiedTime;
        
        // Try to get grandparent for more context
        if (parent.data.parents && parent.data.parents.length > 0) {
          const grandparent = await drive.files.get({
            fileId: parent.data.parents[0],
            fields: 'id, name'
          });
          repo.parentFolderName = grandparent.data.name;
        }
      } catch (e) {
        repo.repositoryName = 'Unknown';
      }
    }
  }
  
  console.log(`✅ Found ${gitRepos.length} GitHub repository markers`);
  
  const audit = {
    auditDate: new Date().toISOString(),
    auditType: 'GITHUB_REPOS_COMPLETE_AUDIT',
    source: 'Google Drive - HeynsSchoeman Account',
    totalRepoMarkers: gitRepos.length,
    repositories: gitRepos.map((repo, index) => ({
      auditIndex: index + 1,
      id: repo.id,
      markerName: repo.name,
      repositoryName: repo.repositoryName || 'Unknown',
      type: repo.mimeType,
      size: repo.size ? parseInt(repo.size) : 0,
      created: repo.created || repo.repositoryCreated,
      modified: repo.modifiedTime || repo.repositoryModified,
      parentFolder: repo.parentFolderName || 'Root',
      webLink: repo.webViewLink,
      owners: repo.owners?.map((o: any) => o.emailAddress) || [],
      shared: repo.shared || false,
    })),
    summary: {
      totalMarkers: gitRepos.length,
      uniqueRepositories: new Set(gitRepos.map(r => r.repositoryName)).size,
      gitFolders: gitRepos.filter(r => r.name === '.git').length,
      githubFolders: gitRepos.filter(r => r.name === '.github').length,
      otherRepoMarkers: gitRepos.filter(r => r.name !== '.git' && r.name !== '.github').length,
      totalSizeBytes: gitRepos.reduce((sum, r) => sum + (r.size ? parseInt(r.size) : 0), 0),
      oldestRepo: gitRepos.sort((a, b) => new Date(a.createdTime || 0).getTime() - new Date(b.createdTime || 0).getTime())[0]?.repositoryName,
      newestRepo: gitRepos.sort((a, b) => new Date(b.modifiedTime || 0).getTime() - new Date(a.modifiedTime || 0).getTime())[0]?.repositoryName,
    }
  };
  
  // Write to file
  fs.writeFileSync('GITHUB-REPOS-AUDIT.json', JSON.stringify(audit, null, 2));
  console.log('\n✅ Audit complete! Saved to GITHUB-REPOS-AUDIT.json\n');
  
  return audit;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  auditGitHubRepos()
    .then(audit => {
      console.log('📊 SUMMARY:');
      console.log(`   Total Repo Markers: ${audit.totalRepoMarkers}`);
      console.log(`   Unique Repositories: ${audit.summary.uniqueRepositories}`);
      console.log(`   .git folders: ${audit.summary.gitFolders}`);
      console.log(`   .github folders: ${audit.summary.githubFolders}`);
      console.log(`   Total Size: ${(audit.summary.totalSizeBytes / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Oldest: ${audit.summary.oldestRepo}`);
      console.log(`   Newest: ${audit.summary.newestRepo}`);
    })
    .catch(error => {
      console.error('❌ Audit failed:', error);
      process.exit(1);
    });
}
