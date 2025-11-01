import { db } from './db';
import { hsomniBrands, hsomniSectors } from '@shared/schema';
import { eq } from 'drizzle-orm';

const healthBrands = ['MedVault', 'CleanCast', 'ScrollHealth', 'Hygienix', 'CareNode','VaultSan', 'TrackMeds', 'SteriMesh', 'MedLoop', 'PulseClean','HealthDrop', 'SanitiPath', 'VaultMeds', 'BioPulse', 'NurseFlow','AirHealth', 'ScanCare', 'PathogenTrace', 'CareYield', 'SoapGrid','MedTrace', 'SteriLoop', 'BioScan', 'CareLink', 'VaultWell','DoseSync', 'SanityTrack', 'CleanPulse', 'NurseGrid', 'ScanHealth','PureFlow', 'MedCert', 'SteriPack', 'AlertCare', 'VaultNurse','TrackVitals', 'HygieneCast', 'PatientSync', 'MedFuse', 'CleanChain','SoapNode', 'ScanDose', 'CareCast', 'HealthPing', 'PatientPath','PureVault', 'MedDrop', 'SanitiLoop', 'AlertDose', 'CleanLine','VaultVitals', 'MaskTrack', 'CarePrint', 'SteriBoard', 'NurseYield','BioTrack', 'VaultWellness', 'TouchClean', 'MedEcho', 'PatientCert','MedLogix', 'ScanSan', 'NurseCast', 'TouchScan', 'DoseVault','PathClean', 'SanitiID', 'RecordGrid', 'PureCare', 'MedClaim','QRVitals', 'HygieneNode', 'SoapDrop', 'NurseVault', 'BioClaim','ScanWell', 'SprayTrack', 'CarePath', 'VaultScript', 'PatientLink','SteriCheck', 'HealthCast', 'DoseLink', 'TouchProof', 'RecordVault','MedPortal', 'AlertVault', 'ClaimDose', 'CleanForm', 'ScanProof','NurseSignal', 'MedPathway', 'WellnessTrack'];

const healthSubNodes = [['ScanID', 'PatientDrop', 'RecordLink', 'VaultCare'],['SanitizeGrid', 'QRLabel', 'TouchLock', 'DropZone'],['ScrollID', 'TreatmentTrack', 'CareClaim', 'HealthEcho'],['WashCycle', 'QRNode', 'DisinfectLink', 'VaultTag'],['PatientSync', 'PayoutCare', 'NodeClaim', 'AlertScan'],['CleanTrace', 'HygieneCert', 'QRGrid', 'SecureDrop'],['DoseTrack', 'QRScript', 'VaultDrug', 'AlertLink'],['MeshDrop', 'CleanEcho', 'QRTrack', 'SteriNode'],['HealthPath', 'PatientCast', 'QRClaim', 'VaultID'],['PulseSync', 'ScanLink', 'SanitaryTag', 'VaultLock'],['DropPoint', 'TrackDose', 'QRTrace', 'MedNode'],['PathNode', 'CleanSync', 'HygieneRoute', 'QRClaim'],['MedID', 'TrackPill', 'DropChart', 'AlertLoop'],['QRNode', 'ScanVitals', 'VaultRecord', 'HealthPing'],['ShiftTrack', 'AlertGrid', 'VaultChart', 'PeerLink'],['VentFlow', 'PurifyNode', 'AirTrack', 'CleanEcho'],['CareID', 'QRChart', 'PatientGrid', 'RecordVault'],['PathNode', 'TraceMap', 'AlertDrop', 'VaultScan'],['PayoutClaim', 'CareNode', 'VaultPay', 'ScrollCert'],['WashSync', 'DispenserLink', 'QRNode', 'VaultDrop'],['TraceNode', 'QRMap', 'PatientPing', 'RecordFlow'],['LoopClean', 'VaultNode', 'DisinfectClaim', 'ScanPulse'],['BioNode', 'TestTrace', 'VaultLink', 'QRResult'],['PatientNode', 'ClaimGrid', 'ScrollAlert', 'VaultCare'],['WellnessID', 'QRPath', 'DropNode', 'HealthYield'],['QRTrack', 'PillGrid', 'TimerClaim', 'VaultDose'],['HygieneNode', 'ScanTouch', 'VaultDrop', 'QRLoop'],['CleanLink', 'QRSignal', 'VaultMesh', 'PathDrop'],['NurseID', 'RosterFlow', 'AlertRoute', 'CareTag'],['ScanLoop', 'QRVitals', 'VaultDrop', 'RecordTag'],['WaterPath', 'CleanYield', 'VaultPipe', 'QRDrop'],['CertID', 'RecordNode', 'QRVerify', 'ScrollCare'],['QRWrap', 'VaultClean', 'ScanShield', 'DropKit'],['SignalAlert', 'PatientLoop', 'QRNotify', 'VaultTrack'],['NurseClaim', 'QRPanel', 'NodeTag', 'ShiftProof'],['VitalID', 'ScanPulse', 'VaultTrack', 'QRClaim'],['QRPush', 'CleanNode', 'VaultDrop', 'SprayTrace'],['ScrollTrack', 'VaultChart', 'QRPath', 'IDNode'],['VaultJoin', 'QRClaim', 'ScrollDose', 'PatientLink'],['QRLoop', 'VaultMark', 'HygieneFlow', 'ScanProof'],['FoamClaim', 'VaultDispenser', 'QRWash', 'CleanTag'],['DoseTrace', 'QRScript', 'VaultTrigger', 'LabelNode'],['SignalDrop', 'QRAlert', 'NurseRoute', 'VaultLink'],['PingNode', 'QRVital', 'VaultTrack', 'AlertBeam'],['QRRoute', 'MedID', 'VaultDrop', 'CareSync'],['VaultFlow', 'QRDispenser', 'HygieneLog', 'ScanEcho'],['DropForm', 'ClaimScript', 'QRLoop', 'VaultNode'],['LoopClean', 'SprayNode', 'VaultClaim', 'HygieneGrid'],['QRSignal', 'VaultNotify', 'ScheduleClaim', 'DosePing'],['LinePath', 'QRCheck', 'VaultFlow', 'ScanProof'],['PulseID', 'ScanNode', 'QRTrack', 'VitalsClaim'],['QRWear', 'CleanFit', 'VaultSync', 'HygienePing'],['PrintLabel', 'QRScan', 'DropVault', 'CleanNode'],['BoardRoute', 'HygieneLink', 'VaultMap', 'QRPath'],['PayoutNode', 'VaultCert', 'NurseFlow', 'QRSignal'],['BioScan', 'QRProof', 'VaultClaim', 'PatientEcho'],['ScrollCare', 'QRDrop', 'MedMesh', 'RecordSync'],['QRScan', 'VaultTouch', 'HygieneLock', 'SignalNode'],['EchoID', 'VaultPanel', 'QRPing', 'RecordPath'],['ScrollCert', 'QRAccess', 'VaultLedger', 'ClaimLink'],['TrackVault', 'QRPanel', 'PatientTag', 'SyncChart'],['HygieneScan', 'QRRead', 'VaultIndex', 'CleanFlow'],['CastPath', 'QRBoard', 'CarePulse', 'VaultShift'],['ScanNode', 'TouchRead', 'VaultMark', 'QRTag'],['VaultClaim', 'QRDose', 'TimerPath', 'MedLabel'],['ScrollRoute', 'QRScan', 'VaultTrack', 'PathEcho'],['QRBadge', 'VaultName', 'ClaimID', 'CleanCheck'],['RecordLoop', 'VaultEntry', 'QRNode', 'ScanBook'],['QRFlow', 'SanitizePath', 'CareTouch', 'VaultSync'],['VaultSheet', 'QRProof', 'ScrollClaim', 'SignalTrack'],['VitalsTag', 'QRTrack', 'VaultPulse', 'HealthNode'],['CleanLabel', 'ScanEcho', 'VaultDrop', 'TagID'],['SoapPing', 'QRTrigger', 'DispenserLog', 'VaultTrack'],['VaultRoster', 'NurseTrack', 'ShiftID', 'QRLog'],['BioTrack', 'VaultCert', 'QRForm', 'DNAPath'],['QRClaim', 'ScrollDrop', 'VaultCare', 'CheckPulse'],['SprayNode', 'VaultStream', 'QRPath', 'HygieneFlow'],['QRTag', 'NurseRoute', 'VaultChart', 'ShiftEcho'],['ScriptID', 'QRConfirm', 'MedDrop', 'ClaimProof'],['QRBoard', 'VaultJoin', 'CarePass', 'RecordTrack'],['CheckPulse', 'VaultClean', 'QRNode', 'HygieneCert'],['CastAlert', 'QRSignal', 'NodeDrop', 'VaultClaim'],['QRLabel', 'VaultID', 'TrackMed', 'ScrollProof'],['VaultLink', 'CleanTrace', 'ScanNode', 'QRDrop'],['FilePath', 'QRPatient', 'VaultScan', 'ArchiveNode'],['QRGate', 'VaultOpen', 'PatientCert', 'NodePass'],['SignalPing', 'VaultEcho', 'ScanNotify', 'QRPath'],['DoseNode', 'VaultRoute', 'LabelScan', 'QRClaim'],['QRPanel', 'VaultPath', 'PrintTag', 'DisinfectProof'],['VaultDrop', 'QRNode', 'CertID', 'PulseRecord'],['SignalNode', 'QRChart', 'VaultEcho', 'RosterClaim'],['QRLog', 'PatientPath', 'ScrollLink', 'VaultMark'],['TrackChart', 'VaultPulse', 'QRNode', 'LoopScan']];

async function importFruitfulHealthBrands() {
  try {
    console.log('\n🏥 IMPORTING HEALTH BRANDS FROM FruitfulPlanetChange REPOSITORY\n');
    
    const [healthSector] = await db.select().from(hsomniSectors).where(eq(hsomniSectors.sectorKey, 'health'));
    
    if (!healthSector) {
      console.error('❌ Health sector not found in database');
      return;
    }
    
    console.log(`✅ Health Sector ID: ${healthSector.id}`);
    console.log(`📊 Source Data: ${healthBrands.length} CORE brands, ${healthSubNodes.flat().length} subnodes\n`);
    
    await db.delete(hsomniBrands).where(eq(hsomniBrands.sectorId, healthSector.id));
    console.log('🗑️  Cleared existing health brands\n');
    
    let coreInserted = 0;
    let subnodeInserted = 0;
    
    for (let i = 0; i < healthBrands.length; i++) {
      const brandName = healthBrands[i];
      const subnodes = healthSubNodes[i] || [];
      
      const [coreBrand] = await db.insert(hsomniBrands).values({
        name: brandName,
        description: `Health & Hygiene CORE brand from FruitfulPlanetChange`,
        sectorId: healthSector.id,
        integration: 'VaultMesh™',
        status: 'active',
        isCore: true,
        metadata: {
          source: 'FruitfulPlanetChange',
          repository: '/tmp/FruitfulPlanetChange/attached_assets/',
          importDate: new Date().toISOString()
        }
      }).returning();
      
      coreInserted++;
      
      for (const subnodeName of subnodes) {
        await db.insert(hsomniBrands).values({
          name: subnodeName,
          description: `SUBNODE of ${brandName}`,
          sectorId: healthSector.id,
          integration: 'VaultMesh™',
          status: 'active',
          isCore: false,
          parentId: coreBrand.id,
          metadata: {
            parentBrand: brandName,
            source: 'FruitfulPlanetChange',
            importDate: new Date().toISOString()
          }
        });
        subnodeInserted++;
      }
      
      if ((i + 1) % 10 === 0) {
        console.log(`   Imported ${i + 1}/${healthBrands.length} CORE brands...`);
      }
    }
    
    console.log(`\n✅ IMPORT COMPLETE!`);
    console.log(`   CORE brands imported: ${coreInserted}`);
    console.log(`   Subnodes imported: ${subnodeInserted}`);
    console.log(`   Total: ${coreInserted + subnodeInserted}`);
    console.log(`\n🔗 Source: FruitfulPlanetChange Repository`);
    console.log(`📁 Path: /tmp/FruitfulPlanetChange/attached_assets/`);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

importFruitfulHealthBrands();
