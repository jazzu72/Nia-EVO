const fs = require('fs');
const path = require('path');

const PIPELINE_FILE = path.join(__dirname, 'data', 'revenue-pipeline.json');

function loadPipeline() {
  if (!fs.existsSync(PIPELINE_FILE)) {
    return { contacts: [], appointments: [], proposals: [], closedDeals: [], revenue: 0 };
  }
  try {
    return JSON.parse(fs.readFileSync(PIPELINE_FILE, 'utf8'));
  } catch { return { contacts: [], appointments: [], proposals: [], closedDeals: [], revenue: 0 }; }
}

function savePipeline(data) {
  fs.writeFileSync(PIPELINE_FILE, JSON.stringify(data, null, 2));
}

function logActivity(contactId, type, note = '') {
  const data = loadPipeline();
  const contact = data.contacts.find(c => c.id === contactId);
  if (!contact) return null;
  if (!contact.activities) contact.activities = [];
  const activity = {
    id: Date.now().toString(36),
    type,  // 'call', 'email', 'followup', 'note'
    note,
    timestamp: new Date().toISOString()
  };
  contact.activities.push(activity);
  contact.lastActivity = activity.timestamp;
  // Update probability based on activity history
  contact.probability = calculateProbability(contact);
  savePipeline(data);
  return activity;
}

function setFollowUp(contactId, followUpDate) {
  const data = loadPipeline();
  const contact = data.contacts.find(c => c.id === contactId);
  if (!contact) return null;
  contact.nextFollowUp = followUpDate;
  savePipeline(data);
  return contact;
}

function addNote(contactId, note) {
  return logActivity(contactId, 'note', note);
}

function calculateProbability(contact) {
  let prob = 10; // base
  const activities = contact.activities || [];
  if (activities.length === 0) return prob;

  // Each activity increases probability
  const callCount = activities.filter(a => a.type === 'call').length;
  const emailCount = activities.filter(a => a.type === 'email').length;
  const followUpCount = activities.filter(a => a.type === 'followup').length;

  prob += Math.min(callCount * 5, 30);
  prob += Math.min(emailCount * 3, 20);
  prob += Math.min(followUpCount * 8, 25);

  // Recency boost: last activity within 7 days
  const last = new Date(contact.lastActivity || contact.createdAt);
  const daysSince = (Date.now() - last.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince < 7) prob += 10;

  // Score boost from existing score
  if (contact.score) prob += Math.min(contact.score / 2, 15);

  return Math.min(Math.round(prob), 99);
}

function getActivityStats(contactId) {
  const data = loadPipeline();
  const contact = data.contacts.find(c => c.id === contactId);
  if (!contact) return null;
  return {
    totalActivities: (contact.activities || []).length,
    calls: (contact.activities || []).filter(a => a.type === 'call').length,
    emails: (contact.activities || []).filter(a => a.type === 'email').length,
    followUps: (contact.activities || []).filter(a => a.type === 'followup').length,
    lastActivity: contact.lastActivity || null,
    nextFollowUp: contact.nextFollowUp || null,
    probability: contact.probability || 0
  };
}

function getDealProbability(contactId) {
  const data = loadPipeline();
  const contact = data.contacts.find(c => c.id === contactId);
  if (!contact) return null;
  return contact.probability || 0;
}

module.exports = {
  logActivity,
  setFollowUp,
  addNote,
  calculateProbability,
  getActivityStats,
  getDealProbability,
  loadPipeline,
  savePipeline
};
