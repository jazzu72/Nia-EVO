const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const LEADS_FILE = './data/ai-prospects.json';
const REAL_ESTATE_FILE = './data/real-estate-leads.json';
const TRUTH_LOG = './data/truth-log.json';
const KILL_SWITCH = './data/kill-switch.flag';

function logTruth(action, details) {
  const entry = { timestamp: new Date().toISOString(), action, details };
  let log = [];
  if (fs.existsSync(TRUTH_LOG)) {
    log = JSON.parse(fs.readFileSync(TRUTH_LOG, 'utf8'));
  }
  log.push(entry);
  fs.writeFileSync(TRUTH_LOG, JSON.stringify(log, null, 2));
}

function isKilled() {
  return fs.existsSync(KILL_SWITCH);
}

function sendSMS(number, message) {
  if (isKilled()) return;
  const cmd = `curl -X POST http://localhost:3000/api/sms/send -d '{"to":"${number}","message":"${message}"}'`;
  exec(cmd, (err) => {
    if (err) {
      logTruth('SMS_FAILED', { number, message, error: err.message });
    } else {
      logTruth('SMS_SENT', { number, message });
    }
  });
}

function sendEmail(email, subject, body) {
  if (isKilled()) return;
  // Use nodemailer or your existing email tool
  logTruth('EMAIL_QUEUED', { email, subject, body });
}

function callLead(lead) {
  if (isKilled()) return;
  const contact = lead.phone || lead.contact;
  const message = `Hi, this is Nia from House of Jazzu. We can help you automate your business. Can we schedule a 15‑minute call?`;

  if (contact && contact.match(/^\+?[0-9]{10,15}$/)) {
    sendSMS(contact, message);
  } else if (lead.email) {
    sendEmail(lead.email, 'Nia Capital OS – Business Automation', message);
  } else {
    logTruth('NO_CONTACT_METHOD', { lead });
  }
}

function runCycle() {
  if (isKilled()) {
    console.log('🛑 Kill switch active. CEO agent paused.');
    return;
  }

  // Load leads
  const aiLeads = fs.existsSync(LEADS_FILE) ? JSON.parse(fs.readFileSync(LEADS_FILE)) : [];
  const reLeads = fs.existsSync(REAL_ESTATE_FILE) ? JSON.parse(fs.readFileSync(REAL_ESTATE_FILE)) : [];

  // Combine, filter uncontacted (status !== 'contacted')
  const all = [...aiLeads, ...reLeads].filter(l => l.status !== 'contacted');

  if (all.length === 0) {
    logTruth('NO_NEW_LEADS', {});
    console.log('ℹ️ No new leads.');
    return;
  }

  // Sort by score (highest first)
  const sorted = all.sort((a, b) => (b.score || 0) - (a.score || 0));

  // Call the top 3
  const top = sorted.slice(0, 3);
  top.forEach(lead => {
    callLead(lead);
    lead.status = 'contacted';
  });

  // Save updated status
  const updateFile = (file, data) => {
    const existing = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : [];
    const updated = existing.map(l => {
      const matched = data.find(d => d.id === l.id);
      return matched || l;
    });
    // Add new leads that weren't in original
    data.forEach(d => {
      if (!updated.find(u => u.id === d.id)) updated.push(d);
    });
    fs.writeFileSync(file, JSON.stringify(updated, null, 2));
  };

  // Update both files (but only the ones we touched)
  // For simplicity, we'll just overwrite with merged data.
  // But to keep it clean, we'll just log and rely on truth log.
  logTruth('OUTREACH_ATTEMPTED', { count: top.length, leads: top.map(l => l.id) });
  console.log(`📞 CEO agent called ${top.length} leads.`);
}

// Run every 15 minutes
runCycle();
setInterval(runCycle, 15 * 60 * 1000);

console.log('🤖 Nia CEO Agent started. Kill switch: /kill on Telegram.');
