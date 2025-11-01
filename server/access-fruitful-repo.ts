import { google } from 'googleapis';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
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

async function getUncachableGoogleDriveClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.drive({ version: 'v3', auth: oauth2Client });
}

async function exploreFruitfulPlanetChange() {
  const drive = await getUncachableGoogleDriveClient();
  
  const fruitfulFolderId = '1ye2DMl74MMUbXmh7EEZi6AESklLoogDm';
  
  console.log('\n🔍 EXPLORING FruitfulPlanetChange Repository...\n');
  
  const response = await drive.files.list({
    q: `'${fruitfulFolderId}' in parents`,
    pageSize: 1000,
    fields: 'nextPageToken, files(id, name, mimeType, size, modifiedTime, webViewLink)',
    orderBy: 'name'
  });

  const files = response.data.files || [];
  
  console.log(`📁 Found ${files.length} files in FruitfulPlanetChange root\n`);
  
  const jsFiles = files.filter(f => f.name?.endsWith('.js') || f.name?.endsWith('.ts') || f.name?.endsWith('.tsx'));
  const jsonFiles = files.filter(f => f.name?.endsWith('.json'));
  const folders = files.filter(f => f.mimeType === 'application/vnd.google-apps.folder');
  const healthFiles = files.filter(f => f.name?.toLowerCase().includes('health'));
  
  console.log(`📊 FILE BREAKDOWN:`);
  console.log(`   JS/TS files: ${jsFiles.length}`);
  console.log(`   JSON files: ${jsonFiles.length}`);
  console.log(`   Folders: ${folders.length}`);
  console.log(`   Health-related: ${healthFiles.length}\n`);
  
  if (healthFiles.length > 0) {
    console.log('💊 HEALTH-RELATED FILES:');
    healthFiles.forEach(f => {
      console.log(`   - ${f.name} (${f.mimeType})`);
      console.log(`     ID: ${f.id}`);
      console.log(`     Size: ${f.size} bytes`);
      console.log(`     Link: ${f.webViewLink}\n`);
    });
  }
  
  console.log('\n📂 ALL FOLDERS:');
  folders.forEach(f => {
    console.log(`   - ${f.name} (ID: ${f.id})`);
  });
  
  console.log('\n📄 KEY FILES:');
  const keyFiles = files.filter(f => 
    f.name?.includes('brand') || 
    f.name?.includes('sector') || 
    f.name?.includes('hsomni') ||
    f.name?.endsWith('.json')
  );
  keyFiles.slice(0, 20).forEach(f => {
    console.log(`   - ${f.name} (${f.size || 0} bytes)`);
  });
  
  return { files, healthFiles, folders, keyFiles };
}

exploreFruitfulPlanetChange()
  .then(result => {
    console.log(`\n✅ EXPLORATION COMPLETE`);
    console.log(`Total files scanned: ${result.files.length}`);
  })
  .catch(error => {
    console.error('❌ Error exploring repository:', error);
    process.exit(1);
  });
