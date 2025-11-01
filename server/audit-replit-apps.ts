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

async function auditReplitApps() {
  const drive = await getGoogleDriveClient();
  
  console.log('🔍 AUDITING ALL REPLIT APPS FROM GOOGLE DRIVE...\n');
  
  const queries = [
    "name contains 'replit'",
    "name contains 'repl'",
    "name contains '.replit'",
    "name contains 'app'",
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
  
  // Filter for actual Replit apps
  const replitApps = uniqueFiles.filter(f => 
    f.name.toLowerCase().includes('replit') || 
    f.name.toLowerCase().includes('repl') ||
    f.name === '.replit' ||
    f.mimeType === 'application/vnd.google-apps.folder' && f.name.toLowerCase().includes('app')
  );
  
  // Get parent folder names for context
  for (const app of replitApps) {
    if (app.parents && app.parents.length > 0) {
      try {
        const parent = await drive.files.get({
          fileId: app.parents[0],
          fields: 'id, name'
        });
        app.parentFolderName = parent.data.name;
      } catch (e) {
        app.parentFolderName = 'Unknown';
      }
    }
  }
  
  console.log(`✅ Found ${replitApps.length} Replit apps/files`);
  
  const audit = {
    auditDate: new Date().toISOString(),
    auditType: 'REPLIT_APPS_COMPLETE_AUDIT',
    source: 'Google Drive - HeynsSchoeman Account',
    totalApps: replitApps.length,
    apps: replitApps.map((app, index) => ({
      auditIndex: index + 1,
      id: app.id,
      name: app.name,
      type: app.mimeType,
      size: app.size ? parseInt(app.size) : 0,
      created: app.createdTime,
      modified: app.modifiedTime,
      parentFolder: app.parentFolderName || 'Root',
      webLink: app.webViewLink,
      owners: app.owners?.map((o: any) => o.emailAddress) || [],
      shared: app.shared || false,
      description: app.description || '',
    })),
    summary: {
      totalFiles: replitApps.length,
      folders: replitApps.filter(a => a.mimeType === 'application/vnd.google-apps.folder').length,
      files: replitApps.filter(a => a.mimeType !== 'application/vnd.google-apps.folder').length,
      totalSizeBytes: replitApps.reduce((sum, a) => sum + (a.size ? parseInt(a.size) : 0), 0),
      oldestApp: replitApps.sort((a, b) => new Date(a.createdTime).getTime() - new Date(b.createdTime).getTime())[0]?.name,
      newestApp: replitApps.sort((a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime())[0]?.name,
    }
  };
  
  // Write to file
  fs.writeFileSync('REPLIT-APPS-AUDIT.json', JSON.stringify(audit, null, 2));
  console.log('\n✅ Audit complete! Saved to REPLIT-APPS-AUDIT.json\n');
  
  return audit;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  auditReplitApps()
    .then(audit => {
      console.log('📊 SUMMARY:');
      console.log(`   Total Apps: ${audit.totalApps}`);
      console.log(`   Folders: ${audit.summary.folders}`);
      console.log(`   Files: ${audit.summary.files}`);
      console.log(`   Total Size: ${(audit.summary.totalSizeBytes / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Oldest: ${audit.summary.oldestApp}`);
      console.log(`   Newest: ${audit.summary.newestApp}`);
    })
    .catch(error => {
      console.error('❌ Audit failed:', error);
      process.exit(1);
    });
}
