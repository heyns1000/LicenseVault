import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

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

async function downloadAllFiles() {
  const drive = await getGoogleDriveClient();
  const healthTrackId = '1jWW6Kw3DJ2m6q_TquA6Eyd1QK-0hYC5-';
  
  console.log('🔍 Scanning ALL files in HealthTrack 2...\n');
  
  const allFiles: any[] = [];
  let pageToken = null;
  
  do {
    const response: any = await drive.files.list({
      q: `'${healthTrackId}' in parents`,
      pageSize: 1000,
      pageToken: pageToken || undefined,
      fields: 'nextPageToken, files(id, name, mimeType, size, parents)',
    });
    
    if (response.data.files) {
      allFiles.push(...response.data.files);
    }
    
    pageToken = response.data.nextPageToken;
  } while (pageToken);
  
  console.log(`Found ${allFiles.length} items in root\n`);
  
  const codeFiles = allFiles.filter(f => 
    !f.mimeType.includes('folder') &&
    (f.name.endsWith('.py') || 
     f.name.endsWith('.ts') || 
     f.name.endsWith('.tsx') ||
     f.name.endsWith('.js') ||
     f.name.endsWith('.jsx') ||
     f.name.endsWith('.json') ||
     f.name.endsWith('.md') ||
     f.name.endsWith('.txt') ||
     f.name.endsWith('.css') ||
     f.name.endsWith('.html') ||
     f.name === '.replit' ||
     f.name === 'replit.nix' ||
     f.name === 'requirements.txt' ||
     f.name === 'package.json')
  );
  
  console.log(`Found ${codeFiles.length} code/config files to download\n`);
  
  const destPath = path.join(process.cwd(), 'healthtrack-injected');
  if (!fs.existsSync(destPath)) {
    fs.mkdirSync(destPath, { recursive: true });
  }
  
  let downloaded = 0;
  
  for (const file of codeFiles) {
    try {
      const filePath = path.join(destPath, file.name);
      const dest = fs.createWriteStream(filePath);
      
      const response = await drive.files.get(
        { fileId: file.id, alt: 'media' },
        { responseType: 'stream' }
      );
      
      await new Promise((resolve, reject) => {
        response.data
          .on('end', () => resolve(filePath))
          .on('error', reject)
          .pipe(dest);
      });
      
      downloaded++;
      const size = file.size ? `${(file.size / 1024).toFixed(2)} KB` : 'unknown';
      console.log(`✅ ${file.name} (${size})`);
    } catch (error) {
      console.log(`❌ Failed: ${file.name}`);
    }
  }
  
  console.log(`\n✅ Downloaded ${downloaded} files to healthtrack-injected/`);
  
  return { total: allFiles.length, codeFiles: codeFiles.length, downloaded };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  downloadAllFiles()
    .then(result => {
      console.log('\n📊 SUMMARY:');
      console.log(`   Total items: ${result.total}`);
      console.log(`   Code files: ${result.codeFiles}`);
      console.log(`   Downloaded: ${result.downloaded}`);
    })
    .catch(error => {
      console.error('❌ Download failed:', error);
      process.exit(1);
    });
}
