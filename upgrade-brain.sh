#!/bin/bash

echo ""
echo "  ╔══════════════════════════════════════════════════════╗"
echo "  ║     🧠 UPGRADING NIA'S BRAIN                        ║"
echo "  ║     Strategic · Emotional · Self‑Learning           ║"
echo "  ╚══════════════════════════════════════════════════════╝"
echo ""

# ─── 1. Install Brain Core ──────────────────────────────────
echo "🧠 Installing Brain Core..."
cat > brain-core.js << 'EOF'
const fs = require('fs');
const { exec } = require('child_process');

const MEMORY_FILE = './memory.json';
const LOG_FILE = './logs/brain.log';

function log(message) {
  const entry = `[${new Date().toISOString()}] ${message}`;
  console.log(`🧠 Brain: ${message}`);
  fs.appendFileSync(LOG_FILE, entry + '\n');
}

function loadMemory() {
  if (!fs.existsSync(MEMORY_FILE)) return { leads: {}, stats: {} };
  return JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'));
}

function saveMemory(data) {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(data, null, 2));
}

function getNextAction() {
  const mem = loadMemory();
  const now = new Date();

  // Priority 1: Reply to new messages
  const pendingReplies = Object.keys(mem.leads).filter(phone => {
    const lead = mem.leads[phone];
    const lastContact = new Date(lead.lastContact);
    const hoursSince = (now - lastContact) / (1000 * 60 * 60);
    return hoursSince < 24 && lead.stage !== 'closed';
  });

  if (pendingReplies.length > 0) {
    log(`📩 Priority: ${pendingReplies.length} pending replies`);
    return { action: 'reply', leads: pendingReplies };
  }

  // Priority 2: Follow up with warm leads
  const warmLeads = Object.keys(mem.leads).filter(phone => {
    const lead = mem.leads[phone];
    const lastContact = new Date(lead.lastContact);
    const daysSince = (now - lastContact) / (1000 * 60 * 60 * 24);
    return daysSince > 3 && daysSince < 7 && lead.stage !== 'closed';
  });

  if (warmLeads.length > 0) {
    log(`🔥 Priority: ${warmLeads.length} warm leads need follow‑up`);
    return { action: 'follow-up', leads: warmLeads };
  }

  // Priority 3: Send cold outreach
  log('❄️ No active leads. Sending cold outreach...');
  return { action: 'cold-outreach', leads: ['+17573399245'] };
}

function assessLead(phone) {
  const mem = loadMemory();
  const lead = mem.leads[phone];
  if (!lead) return { score: 0, reason: 'No history' };

  let score = 0;
  const stageScores = { new: 1, contacted: 2, interested: 3, inspection_scheduled: 4, offer_sent: 5, closed: 10 };
  score += stageScores[lead.stage] || 0;
  score += lead.history ? Math.min(lead.history.length, 5) : 0;
  if (lead.lastContact) {
    const days = (new Date() - new Date(lead.lastContact)) / (1000 * 60 * 60 * 24);
    score += days < 3 ? 2 : days < 7 ? 1 : -1;
  }

  return { score, reason: `Stage: ${lead.stage}, History: ${lead.history?.length || 0}` };
}

function generateStrategy() {
  const mem = loadMemory();
  const stats = mem.stats || { deals: 0, revenue: 0 };
  const leads = Object.keys(mem.leads).length;

  log(`📊 Strategy: ${leads} leads, ${stats.deals} deals closed, $${stats.revenue} revenue`);

  if (stats.deals === 0) {
    return 'Focus on closing first deal — speed matters.';
  }
  if (stats.deals < 5) {
    return 'Optimize follow‑up timing. Check reply rates.';
  }
  return 'Scale outreach. Automate more.';
}

function trackOutcome(phone, outcome) {
  const mem = loadMemory();
  mem.stats = mem.stats || { deals: 0, revenue: 0 };
  if (outcome === 'closed') {
    mem.stats.deals += 1;
    mem.stats.revenue += 85000;
  }
  saveMemory(mem);
  log(`📈 Outcome: ${outcome} for ${phone}. Deals: ${mem.stats.deals}`);
}

module.exports = {
  log,
  loadMemory,
  saveMemory,
  getNextAction,
  assessLead,
  generateStrategy,
  trackOutcome
};
