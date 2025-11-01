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

async function recursiveScan(drive: any, folderId: string, folderPath: string = '', allFiles: any[] = []) {
  let pageToken = null;
  
  do {
    const response: any = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      pageSize: 1000,
      pageToken: pageToken || undefined,
      fields: 'nextPageToken, files(id, name, mimeType, size, parents)',
    });
    
    if (response.data.files) {
      for (const file of response.data.files) {
        const filePath = path.join(folderPath, file.name);
        file.fullPath = filePath;
        allFiles.push(file);
        
        if (file.mimeType === 'application/vnd.google-apps.folder') {
          await recursiveScan(drive, file.id, filePath, allFiles);
        }
      }
    }
    
    pageToken = response.data.nextPageToken;
  } while (pageToken);
  
  return allFiles;
}

async function deepScan() {
  const drive = await getGoogleDriveClient();
  const healthTrackId = '1jWW6Kw3DJ2m6q_TquA6Eyd1QK-0hYC5-';
  
  console.log('🔍 DEEP SCANNING HealthTrack 2 (all subdirectories)...\n');
  
  const allFiles = await recursiveScan(drive, healthTrackId, 'HealthTrack 2');
  
  console.log(`\n✅ Found ${allFiles.length} total items\n`);
  
  const codeFiles = allFiles.filter(f => 
    !f.mimeType.includes('folder') &&
    !f.mimeType.includes('google-apps') &&
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
     f.name.endsWith('.sql') ||
     f.name === '.replit' ||
     f.name === 'replit.nix' ||
     f.name === 'requirements.txt' ||
     f.name === 'package.json' ||
     f.name === 'README.md')
  );
  
  console.log(`📄 Found ${codeFiles.length} code/config files:\n`);
  
  const destPath = path.join(process.cwd(), 'healthtrack-injected');
  if (!fs.existsSync(destPath)) {
    fs.mkdirSync(destPath, { recursive: true });
  }
  
  let downloaded = 0;
  const manifest: any = {
    downloadedAt: new Date().toISOString(),
    totalFiles: allFiles.length,
    codeFiles: codeFiles.length,
    files: []
  };
  
  for (const file of codeFiles.slice(0, 100)) { // Download first 100 code files
    try {
      const sanitizedPath = file.fullPath.replace(/[^a-zA-Z0-9._\-\/]/g, '_');
      const filePath = path.join(destPath, path.basename(file.name));
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
      console.log(`✅ ${file.fullPath} (${size})`);
      
      manifest.files.push({
        name: file.name,
        path: file.fullPath,
        size: file.size,
        localPath: filePath
      });
    } catch (error) {
      console.log(`❌ Failed: ${file.fullPath}`);
    }
  }
  
  fs.writeFileSync(
    path.join(destPath, 'HEALTHTRACK-MANIFEST.json'),
    JSON.stringify(manifest, null, 2)
  );
  
  console.log(`\n✅ Downloaded ${downloaded} files to healthtrack-injected/`);
  console.log(`📋 Manifest saved`);
  
  return manifest;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  deepScan()
    .then(manifest => {
      console.log(`\n📊 SUMMARY:`);
      console.log(`   Total items scanned: ${manifest.totalFiles}`);
      console.log(`   Code files found: ${manifest.codeFiles}`);
      console.log(`   Files downloaded: ${manifest.files.length}`);
    })
    .catch(error => {
      console.error('❌ Deep scan failed:', error);
      process.exit(1);
    });
}
