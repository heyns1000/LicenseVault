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

async function recursiveScan(drive: any, folderId: string, folderPath: string = '', allFiles: any[] = []) {
  let pageToken = null;
  
  do {
    const response: any = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      pageSize: 1000,
      pageToken: pageToken || undefined,
      fields: 'nextPageToken, files(id, name, mimeType, size)',
    });
    
    if (response.data.files) {
      for (const file of response.data.files) {
        allFiles.push({
          name: file.name,
          type: file.mimeType,
          size: file.size,
          path: `${folderPath}/${file.name}`
        });
        
        if (file.mimeType === 'application/vnd.google-apps.folder') {
          await recursiveScan(drive, file.id, `${folderPath}/${file.name}`, allFiles);
        }
      }
    }
    
    pageToken = response.data.nextPageToken;
  } while (pageToken);
  
  return allFiles;
}

async function listAll() {
  const drive = await getGoogleDriveClient();
  const healthTrackId = '1jWW6Kw3DJ2m6q_TquA6Eyd1QK-0hYC5-';
  
  console.log('📋 Listing ALL files in HealthTrack 2...\n');
  
  const allFiles = await recursiveScan(drive, healthTrackId, 'HealthTrack 2');
  
  const files = allFiles.filter(f => !f.type.includes('folder'));
  
  console.log(`Total items: ${allFiles.length}`);
  console.log(`Files (non-folders): ${files.length}\n`);
  
  // Group by mime type
  const byType: Record<string, number> = {};
  files.forEach(f => {
    byType[f.type] = (byType[f.type] || 0) + 1;
  });
  
  console.log('File types found:');
  Object.entries(byType).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
    console.log(`  ${count}x ${type}`);
  });
  
  console.log(`\nSample files (first 50):`);
  files.slice(0, 50).forEach(f => {
    console.log(`  ${f.path} (${f.type})`);
  });
  
  fs.writeFileSync('HEALTHTRACK-FILE-LIST.json', JSON.stringify({ totalFiles: files.length, files: files.slice(0, 200), byType }, null, 2));
  console.log(`\n✅ Full list saved to HEALTHTRACK-FILE-LIST.json`);
  
  return { totalFiles: files.length, byType };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  listAll()
    .then(() => {})
    .catch(error => {
      console.error('❌ List failed:', error);
      process.exit(1);
    });
}
