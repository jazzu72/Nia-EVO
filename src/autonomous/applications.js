const fs = require('fs');
const path = require('path');

const DATA_FILE = './data/applications.json';

// Ensure data directory exists
if (!fs.existsSync('./data')) {
  fs.mkdirSync('./data', { recursive: true });
}

// Ensure data file exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

function loadApplications() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Error loading applications:', error.message);
    return [];
  }
}

function saveApplications(apps) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(apps, null, 2));
  } catch (error) {
    console.error('❌ Error saving applications:', error.message);
  }
}

function generateId() {
  return 'APP-' + Date.now().toString().slice(-6) + '-' + Math.random().toString(36).substr(2, 4);
}

function addApplication(name, type, description) {
  const apps = loadApplications();
  const newApp = {
    id: generateId(),
    name,
    type,
    description,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };
  apps.push(newApp);
  saveApplications(apps);
  console.log(`✅ Added application: ${name} (${newApp.id})`);
  return newApp;
}

function listApplications() {
  const apps = loadApplications();
  if (apps.length === 0) {
    console.log('📭 No applications found');
    return;
  }

  console.log('\n📋 APPLICATIONS');
  console.log('='.repeat(60));
  apps.forEach(app => {
    const icon = app.status === 'APPROVED' ? '✅' :
                 app.status === 'REJECTED' ? '❌' : '⏳';
    console.log(`${icon} ${app.name}: ${app.type} (${app.status})`);
    console.log(`   ID: ${app.id} | ${app.description}`);
    console.log('-'.repeat(60));
  });
}

function updateApplicationStatus(id, status) {
  const apps = loadApplications();
  const app = apps.find(a => a.id === id);
  if (!app) {
    console.error(`❌ Application ${id} not found`);
    return false;
  }
  app.status = status;
  saveApplications(apps);
  console.log(`✅ ${app.name} status updated to ${status}`);
  return true;
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0] || 'list';

  switch(command) {
    case 'list':
      listApplications();
      break;
    case 'add':
      if (args.length < 4) {
        console.log('Usage: node applications.js add "Name" "Type" "Description"');
        return;
      }
      addApplication(args[1], args[2], args[3]);
      break;
    case 'update':
      if (args.length < 3) {
        console.log('Usage: node applications.js update APP_ID STATUS');
        return;
      }
      updateApplicationStatus(args[1], args[2]);
      break;
    default:
      console.log('Commands: list, add, update');
  }
}

module.exports = {
  loadApplications,
  saveApplications,
  addApplication,
  listApplications,
  updateApplicationStatus
};
