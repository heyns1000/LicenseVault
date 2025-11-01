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

async function findHealthTrackFolder() {
  const drive = await getGoogleDriveClient();
  
  console.log('🔍 Finding HealthTrack 2 folder...');
  
  const response = await drive.files.list({
    q: "name contains 'HealthTrack' or name contains 'healthtrack'",
    pageSize: 100,
    fields: 'files(id, name, mimeType, parents)',
  });
  
  const healthTrackFolders = response.data.files?.filter(f => 
    f.mimeType === 'application/vnd.google-apps.folder' && 
    f.name?.toLowerCase().includes('healthtrack')
  );
  
  if (!healthTrackFolders || healthTrackFolders.length === 0) {
    throw new Error('HealthTrack folder not found');
  }
  
  console.log(`✅ Found ${healthTrackFolders.length} HealthTrack folder(s)`);
  return healthTrackFolders[0];
}

async function downloadFile(drive: any, fileId: string, filePath: string) {
  const dest = fs.createWriteStream(filePath);
  
  const response = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'stream' }
  );
  
  return new Promise((resolve, reject) => {
    response.data
      .on('end', () => resolve(filePath))
      .on('error', (err: any) => reject(err))
      .pipe(dest);
  });
}

async function cloneFolder(drive: any, folderId: string, destinationPath: string, folderName: string = '') {
  // Create destination directory
  if (!fs.existsSync(destinationPath)) {
    fs.mkdirSync(destinationPath, { recursive: true });
  }
  
  console.log(`📁 Cloning folder: ${folderName || 'root'}`);
  
  // List all files in folder
  let pageToken = null;
  let fileCount = 0;
  
  do {
    const response: any = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      pageSize: 100,
      pageToken: pageToken || undefined,
      fields: 'nextPageToken, files(id, name, mimeType, size)',
    });
    
    const files = response.data.files || [];
    
    for (const file of files) {
      const filePath = path.join(destinationPath, file.name);
      
      if (file.mimeType === 'application/vnd.google-apps.folder') {
        // Recursively clone subdirectories
        await cloneFolder(drive, file.id, filePath, file.name);
      } else if (file.mimeType.startsWith('application/vnd.google-apps.')) {
        // Skip Google Workspace files (Docs, Sheets, etc.) - can't download directly
        console.log(`⏭️  Skipping Google Workspace file: ${file.name}`);
      } else {
        // Download regular files
        try {
          await downloadFile(drive, file.id, filePath);
          fileCount++;
          console.log(`✅ Downloaded: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
        } catch (error) {
          console.log(`❌ Failed to download: ${file.name}`);
        }
      }
    }
    
    pageToken = response.data.nextPageToken;
  } while (pageToken);
  
  return fileCount;
}

async function cloneHealthTrack() {
  const drive = await getGoogleDriveClient();
  const folder = await findHealthTrackFolder();
  
  console.log(`\n🚀 Cloning HealthTrack from Google Drive...`);
  console.log(`   Folder: ${folder.name}`);
  console.log(`   ID: ${folder.id}\n`);
  
  const destinationPath = path.join(process.cwd(), 'healthtrack-clone');
  
  const fileCount = await cloneFolder(drive, folder.id!, destinationPath, folder.name);
  
  console.log(`\n✅ CLONE COMPLETE!`);
  console.log(`   Total files: ${fileCount}`);
  console.log(`   Location: ${destinationPath}\n`);
  
  // Create a manifest
  const manifest = {
    clonedAt: new Date().toISOString(),
    sourceFolderId: folder.id,
    sourceFolderName: folder.name,
    destinationPath: destinationPath,
    totalFiles: fileCount,
  };
  
  fs.writeFileSync(
    path.join(destinationPath, 'CLONE-MANIFEST.json'),
    JSON.stringify(manifest, null, 2)
  );
  
  return manifest;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  cloneHealthTrack()
    .then(manifest => {
      console.log('📋 Manifest saved to CLONE-MANIFEST.json');
    })
    .catch(error => {
      console.error('❌ Clone failed:', error);
      process.exit(1);
    });
}
