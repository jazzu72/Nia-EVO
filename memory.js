const fs = require('fs');
const MEMORY_FILE = './memory.json';

function loadMemory() {
  if (!fs.existsSync(MEMORY_FILE)) return { leads: {} };
  return JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'));
}

function saveMemory(data) {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(data, null, 2));
}

function updateLead(phone, stage, note) {
  const mem = loadMemory();
  if (!mem.leads[phone]) mem.leads[phone] = { history: [] };
  mem.leads[phone].stage = stage;
  mem.leads[phone].note = note;
  mem.leads[phone].lastContact = new Date().toISOString();
  saveMemory(mem);
}

module.exports = { loadMemory, saveMemory, updateLead };
