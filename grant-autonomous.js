const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const LOG_FILE = './logs/grant-autonomous.log';

function log(message) {
  const entry = `[${new Date().toISOString()}] ${message}`;
  console.log(`📋 GrantBot: ${message}`);
  fs.appendFileSync(LOG_FILE, entry + '\n');
}

async function runGrantCycle() {
  log('🔄 Running grant application cycle...');

  // 1. Run the grant engine
  exec('node NIA_GRANTS_AUTONOMOUS.js run', (error, stdout, stderr) => {
    if (error) {
      log(`❌ Grant execution failed: ${error.message}`);
      return;
    }
    log(`✅ Grant execution completed`);
    log(stdout);
  });

  // 2. Check for pending grants that need follow‑up
  const grantsFile = './data/grants.json';
  if (fs.existsSync(grantsFile)) {
    const grants = JSON.parse(fs.readFileSync(grantsFile, 'utf8'));
    const pending = grants.filter(g => g.status === 'SUBMITTED' && !g.followedUp);
    if (pending.length > 0) {
      log(`📌 ${pending.length} grants need follow‑up`);
      // You can add logic here to email reminders, auto‑reapply, etc.
    } else {
      log('✅ No pending grants need follow‑up');
    }
  }

  log('⏳ Waiting 12 hours until next grant cycle...');
}

// ─── Run every 12 hours ──────────────────────────────────────
runGrantCycle();
setInterval(runGrantCycle, 12 * 60 * 60 * 1000);
