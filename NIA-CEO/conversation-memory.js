const fs = require('fs');
const path = require('path');

const CONVERSATIONS_FILE = path.join(__dirname, '../../data/conversations.json');

function loadConversations() {
  if (!fs.existsSync(CONVERSATIONS_FILE)) return {};
  return JSON.parse(fs.readFileSync(CONVERSATIONS_FILE, 'utf8'));
}

function saveConversations(data) {
  fs.writeFileSync(CONVERSATIONS_FILE, JSON.stringify(data, null, 2));
}

function getConversation(sellerPhone) {
  const convos = loadConversations();
  return convos[sellerPhone] || [];
}

function addMessage(sellerPhone, role, text) {
  const convos = loadConversations();
  if (!convos[sellerPhone]) convos[sellerPhone] = [];
  convos[sellerPhone].push({
    role,
    text,
    timestamp: new Date().toISOString()
  });
  saveConversations(convos);
}

function getContext(sellerPhone, limit = 5) {
  const convos = getConversation(sellerPhone);
  return convos.slice(-limit);
}

module.exports = {
  getConversation,
  addMessage,
  getContext
};
