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

async function getGoogleDriveClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.drive({ version: 'v3', auth: oauth2Client });
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime?: string;
  modifiedTime?: string;
  size?: string;
  parents?: string[];
  webViewLink?: string;
}

interface CatalogResult {
  totalFiles: number;
  totalFolders: number;
  repositories: DriveFile[];
  replitApps: DriveFile[];
  otherFiles: DriveFile[];
  allFiles: DriveFile[];
}

/**
 * List all files in Google Drive
 */
export async function listAllDriveFiles(): Promise<CatalogResult> {
  const drive = await getGoogleDriveClient();
  
  const allFiles: DriveFile[] = [];
  let pageToken: string | undefined;
  
  console.log('🔍 Starting Google Drive catalog...');
  
  do {
    const response = await drive.files.list({
      pageSize: 1000,
      fields: 'nextPageToken, files(id, name, mimeType, createdTime, modifiedTime, size, parents, webViewLink)',
      pageToken,
      orderBy: 'modifiedTime desc'
    });
    
    const files = response.data.files || [];
    allFiles.push(...files as DriveFile[]);
    pageToken = response.data.nextPageToken || undefined;
    
    console.log(`   Found ${files.length} files (total: ${allFiles.length})...`);
  } while (pageToken);
  
  console.log(`✅ Total files found: ${allFiles.length}`);
  
  // Categorize files
  const folders = allFiles.filter(f => f.mimeType === 'application/vnd.google-apps.folder');
  const repositories = allFiles.filter(f => 
    f.name.toLowerCase().includes('repo') || 
    f.name.toLowerCase().includes('github') ||
    f.name.toLowerCase().includes('git')
  );
  const replitApps = allFiles.filter(f => 
    f.name.toLowerCase().includes('replit') || 
    f.name.toLowerCase().includes('repl') ||
    f.mimeType === 'application/vnd.google-apps.document' && f.name.includes('app')
  );
  
  const result: CatalogResult = {
    totalFiles: allFiles.filter(f => f.mimeType !== 'application/vnd.google-apps.folder').length,
    totalFolders: folders.length,
    repositories,
    replitApps,
    otherFiles: allFiles.filter(f => 
      !repositories.includes(f) && 
      !replitApps.includes(f) &&
      f.mimeType !== 'application/vnd.google-apps.folder'
    ),
    allFiles
  };
  
  console.log(`\n📊 CATALOG SUMMARY:`);
  console.log(`   Total Files: ${result.totalFiles}`);
  console.log(`   Total Folders: ${result.totalFolders}`);
  console.log(`   Repositories: ${result.repositories.length}`);
  console.log(`   Replit Apps: ${result.replitApps.length}`);
  console.log(`   Other Files: ${result.otherFiles.length}`);
  
  return result;
}

/**
 * Download file content from Google Drive
 */
export async function downloadFileContent(fileId: string): Promise<string> {
  const drive = await getGoogleDriveClient();
  
  try {
    const response = await drive.files.get({
      fileId,
      alt: 'media'
    }, { responseType: 'text' });
    
    return response.data as string;
  } catch (error) {
    console.error(`Error downloading file ${fileId}:`, error);
    throw error;
  }
}

/**
 * Export Google Docs/Sheets to readable format
 */
export async function exportGoogleFile(fileId: string, mimeType: string): Promise<string> {
  const drive = await getGoogleDriveClient();
  
  let exportMimeType = 'text/plain';
  if (mimeType.includes('spreadsheet')) {
    exportMimeType = 'text/csv';
  } else if (mimeType.includes('document')) {
    exportMimeType = 'text/plain';
  }
  
  try {
    const response = await drive.files.export({
      fileId,
      mimeType: exportMimeType
    }, { responseType: 'text' });
    
    return response.data as string;
  } catch (error) {
    console.error(`Error exporting file ${fileId}:`, error);
    throw error;
  }
}

/**
 * Main catalog function - run this to generate full report
 */
export async function generateFullCatalog() {
  console.log('🚀 Starting FULL Google Drive Ecosystem Catalog...\n');
  
  const catalog = await listAllDriveFiles();
  
  // Save catalog to JSON
  const catalogData = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: catalog.totalFiles,
      totalFolders: catalog.totalFolders,
      repositoriesFound: catalog.repositories.length,
      replitAppsFound: catalog.replitApps.length
    },
    repositories: catalog.repositories.map(r => ({
      id: r.id,
      name: r.name,
      link: r.webViewLink,
      modified: r.modifiedTime
    })),
    replitApps: catalog.replitApps.map(a => ({
      id: a.id,
      name: a.name,
      link: a.webViewLink,
      modified: a.modifiedTime
    })),
    allFiles: catalog.allFiles.map(f => ({
      id: f.id,
      name: f.name,
      type: f.mimeType,
      size: f.size,
      modified: f.modifiedTime,
      link: f.webViewLink
    }))
  };
  
  return catalogData;
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateFullCatalog()
    .then(catalog => {
      console.log('\n✅ Catalog complete!');
      console.log(JSON.stringify(catalog, null, 2));
    })
    .catch(error => {
      console.error('❌ Catalog failed:', error);
      process.exit(1);
    });
}
