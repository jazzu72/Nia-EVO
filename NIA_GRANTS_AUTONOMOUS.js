const fs = require('fs');
const path = require('path');
const https = require('https');

// ============================================================
// CONFIGURATION - UPDATE WITH YOUR CREDENTIALS
// ============================================================
const CONFIG = {
  grantGov: {
    apiUrl: 'https://api.grants.gov/api/v1',
    username: 'YOUR_GRANT_GOV_USERNAME',
    password: 'YOUR_GRANT_GOV_PASSWORD',
    agency: 'YOUR_AGENCY_CODE'
  },
  dataDir: './data',
  grantsFile: './data/grants.json',
  autoSubmit: true
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

if (!fs.existsSync(CONFIG.dataDir)) {
  fs.mkdirSync(CONFIG.dataDir, { recursive: true });
}

function loadGrants() {
  try {
    if (!fs.existsSync(CONFIG.grantsFile)) {
      fs.writeFileSync(CONFIG.grantsFile, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(CONFIG.grantsFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Error loading grants:', error.message);
    return [];
  }
}

function saveGrants(grants) {
  try {
    fs.writeFileSync(CONFIG.grantsFile, JSON.stringify(grants, null, 2));
    console.log('✅ Grants data saved successfully');
  } catch (error) {
    console.error('❌ Error saving grants:', error.message);
  }
}

function generateId() {
  return 'G-' + Date.now().toString().slice(-6) + '-' + Math.random().toString(36).substr(2, 4);
}

// ============================================================
// CORE FUNCTIONS
// ============================================================

async function addGrant(name, amount, deadline, funder) {
  const grants = loadGrants();
  const newGrant = {
    id: generateId(),
    name,
    amount: Number(amount),
    status: 'DRAFT',
    deadline,
    funder,
    createdAt: new Date().toISOString(),
    submittedToGov: false,
    govSubmissionId: null
  };
  grants.push(newGrant);
  saveGrants(grants);
  console.log(`✅ Added grant: ${name} (${newGrant.id})`);
  return newGrant;
}

async function updateStatus(id, newStatus) {
  const grants = loadGrants();
  const grant = grants.find(g => g.id === id);
  if (!grant) {
    console.error(`❌ Grant ${id} not found`);
    return false;
  }
  grant.status = newStatus;
  saveGrants(grants);
  console.log(`✅ ${grant.name} status updated to ${newStatus}`);
  return true;
}

function listGrants() {
  const grants = loadGrants();
  if (grants.length === 0) {
    console.log('📭 No grants found');
    return;
  }

  console.log('\n📋 GRANT SUMMARY');
  console.log('='.repeat(70));

  grants.forEach(g => {
    const icon = g.status === 'SUBMITTED' ? '✅' :
                 g.status === 'DRAFT' ? '📝' :
                 g.status === 'REVIEWING' ? '🔄' : '📌';

    console.log(`${icon} ${g.name}: $${g.amount.toLocaleString()} (${g.status})`);
    console.log(`   ID: ${g.id} | Funder: ${g.funder} | Deadline: ${g.deadline}`);
    console.log('-'.repeat(70));
  });
}

async function runAutomation() {
  console.log('\n🤖 NIA GRANTS AUTONOMOUS - Running...\n');

  const grants = loadGrants();
  const now = new Date();

  const approaching = grants.filter(g => {
    const deadline = new Date(g.deadline);
    const daysUntil = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    return daysUntil <= 7 && daysUntil > 0 && g.status === 'DRAFT';
  });

  if (approaching.length > 0) {
    console.log('⚠️  Grants approaching deadline (within 7 days):');
    for (const g of approaching) {
      console.log(`   - ${g.name} (deadline: ${g.deadline})`);
      await updateStatus(g.id, 'SUBMITTED');
    }
  } else {
    console.log('✅ No grants approaching deadline');
  }

  generateReport();
}

function generateReport() {
  const grants = loadGrants();
  const submitted = grants.filter(g => g.status === 'SUBMITTED');
  const total = submitted.reduce((sum, g) => sum + g.amount, 0);

  console.log('\n💰 TOTAL GRANTS SUBMITTED: $' + total.toLocaleString());
  console.log('📋 TOTAL APPLICATIONS: ' + submitted.length);
  console.log('📊 TOTAL GRANTS: ' + grants.length);

  const statusCounts = {};
  grants.forEach(g => {
    statusCounts[g.status] = (statusCounts[g.status] || 0) + 1;
  });
  console.log('📈 Status breakdown:', statusCounts);
}

function showConfig() {
  console.log('\n⚙️  Current Configuration:');
  console.log('   API URL:', CONFIG.grantGov.apiUrl);
  console.log('   Username:', CONFIG.grantGov.username);
  console.log('   Auto-submit:', CONFIG.autoSubmit);
  console.log('   Data file:', CONFIG.grantsFile);
  console.log('\n⚠️  Edit CONFIG object in the script to change settings');
}

// ============================================================
// CLI INTERFACE
// ============================================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'list';

  switch(command) {
    case 'list':
      listGrants();
      break;
    case 'add':
      if (args.length < 5) {
        console.log('Usage: node NIA_GRANTS_AUTONOMOUS.js add "Name" amount deadline funder');
        console.log('Example: node NIA_GRANTS_AUTONOMOUS.js add "New Grant" 50000 2026-08-15 "NSF"');
        return;
      }
      await addGrant(args[1], args[2], args[3], args[4]);
      break;
    case 'update':
      if (args.length < 3) {
        console.log('Usage: node NIA_GRANTS_AUTONOMOUS.js update GRANT_ID STATUS');
        return;
      }
      await updateStatus(args[1], args[2]);
      break;
    case 'run':
      await runAutomation();
      break;
    case 'report':
      generateReport();
      break;
    case 'config':
      showConfig();
      break;
    default:
      console.log('Commands: list, add, update, run, report, config');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  loadGrants,
  saveGrants,
  addGrant,
  updateStatus,
  listGrants,
  runAutomation,
  generateReport
};
