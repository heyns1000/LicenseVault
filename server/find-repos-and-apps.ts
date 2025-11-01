import { google } from 'googleapis';

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

/**
 * Search for specific folders and files matching repo/app criteria
 */
async function findReposAndApps() {
  const drive = await getGoogleDriveClient();
  
  console.log('🔍 Searching for GitHub repositories and Replit apps...\n');
  
  // Search for folders containing repos/github
  const repoQueries = [
    "mimeType='application/vnd.google-apps.folder' and (name contains 'repo' or name contains 'github' or name contains 'git')",
    "name contains '.git'",
    "name contains 'repository'"
  ];
  
  const repos: any[] = [];
  
  for (const query of repoQueries) {
    const response = await drive.files.list({
      q: query,
      pageSize: 100,
      fields: 'files(id, name, mimeType, createdTime, modifiedTime, webViewLink, parents)',
      orderBy: 'modifiedTime desc'
    });
    
    if (response.data.files) {
      repos.push(...response.data.files);
    }
  }
  
  console.log(`📁 Found ${repos.length} repository folders/files`);
  
  // Search for Replit apps
  const appQueries = [
    "name contains 'replit'",
    "name contains 'repl'",
    "name contains '-app'",
    "name contains 'application'"
  ];
  
  const apps: any[] = [];
  
  for (const query of appQueries) {
    const response = await drive.files.list({
      q: query,
      pageSize: 100,
      fields: 'files(id, name, mimeType, createdTime, modifiedTime, webViewLink, parents)',
      orderBy: 'modifiedTime desc'
    });
    
    if (response.data.files) {
      apps.push(...response.data.files);
    }
  }
  
  console.log(`📱 Found ${apps.length} Replit app files/folders`);
  
  // Deduplicate
  const uniqueRepos = Array.from(new Map(repos.map(r => [r.id, r])).values());
  const uniqueApps = Array.from(new Map(apps.map(a => [a.id, a])).values());
  
  console.log(`\n✅ RESULTS:`);
  console.log(`   Unique Repositories: ${uniqueRepos.length}`);
  console.log(`   Unique Apps: ${uniqueApps.length}`);
  
  return {
    repositories: uniqueRepos,
    apps: uniqueApps,
    timestamp: new Date().toISOString()
  };
}

// Export for use in other scripts
export { findReposAndApps };

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  findReposAndApps()
    .then(results => {
      console.log('\n📊 DETAILED RESULTS:\n');
      console.log(JSON.stringify(results, null, 2));
    })
    .catch(error => {
      console.error('❌ Search failed:', error);
      process.exit(1);
    });
}
