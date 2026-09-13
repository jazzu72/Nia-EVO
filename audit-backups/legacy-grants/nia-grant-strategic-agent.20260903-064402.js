const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const axios = require('axios');

const CONFIG = {
  templateDir: './data/grant-templates/',
  logFile: './logs/strategic-agent.log'
};

function log(msg) {
  const entry = `[${new Date().toISOString()}] ${msg}`;
  console.log(entry);
  fs.appendFileSync(CONFIG.logFile, entry + '\n');
}

let authToken = null;

async function getAuthToken() {
  if (authToken) return authToken;
  const username = process.env.GRANTS_GOV_USERNAME || 'jazzu72';
  const password = process.env.GRANTS_GOV_PASSWORD || '';
  try {
    const res = await axios.post('https://api.grants.gov/api/v1/auth/token', {
      username,
      password
    });
    authToken = res.data.access_token;
    log('✅ Grants.gov authenticated');
    return authToken;
  } catch (e) {
    log(`❌ Grants.gov auth failed: ${e.message}`);
    return null;
  }
}

async function submitApplication(grant) {
  const token = await getAuthToken();
  if (!token) return false;
  try {
    await axios.post('https://api.grants.gov/api/v1/applications', {
      grantId: 'G-' + Date.now(),
      title: grant.title,
      amount: grant.amount || 0,
      deadline: grant.deadline || '2026-12-31',
      agency: grant.source || 'NSF'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    log(`✅ Submitted: ${grant.title}`);
    return true;
  } catch (e) {
    log(`❌ Submission failed for ${grant.title}: ${e.message}`);
    return false;
  }
}

async function runCycle() {
  log('🧠 Running grant strategic cycle...');
  let grants = [];
  try {
    grants = JSON.parse(fs.readFileSync('./data/curated-grants.json', 'utf8'));
  } catch {
    log('⚠️ No curated grants file found.');
    return;
  }
  log(`📋 Loaded ${grants.length} curated grants.`);

  let submitted = 0;
  for (const g of grants) {
    const ok = await submitApplication(g);
    if (ok) submitted++;
  }

  if (submitted === 0) {
    log('⚠️ No grants submitted. Queuing for manual submission...');
    const queue = './data/manual-submission-queue.json';
    let q = fs.existsSync(queue) ? JSON.parse(fs.readFileSync(queue)) : [];
    grants.forEach(g => {
      if (!q.find(item => item.title === g.title)) {
        q.push({ ...g, status: 'MANUAL', queuedAt: new Date().toISOString() });
      }
    });
    fs.writeFileSync(queue, JSON.stringify(q, null, 2));
    log(`📋 Queued ${grants.length} grants for manual submission.`);
  }

  log(`✅ Strategic cycle complete. Submitted ${submitted} grants.`);
}

runCycle();
cron.schedule('0 0 * * *', runCycle);
log('🤖 Nia Grant Strategic Agent is online.');
