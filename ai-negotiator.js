const { exec } = require('child_process');
const fs = require('fs');
const { loadMemory, saveMemory, updateLead } = require('./memory.js');

const LOG_FILE = './logs/ai-negotiation.log';

function log(message) {
  const entry = `[${new Date().toISOString()}] ${message}`;
  console.log(`🧠 AI: ${message}`);
  fs.appendFileSync(LOG_FILE, entry + '\n');
}

async function askLLM(prompt, model = 'mistral') {
  return new Promise((resolve, reject) => {
    const cmd = `ollama run ${model} "${prompt}"`;
    exec(cmd, { timeout: 15000 }, (error, stdout, stderr) => {
      if (error) {
        log(`❌ LLM error: ${error.message}`);
        return resolve('I’ll follow up with you shortly.');
      }
      resolve(stdout.trim() || 'I’ll be in touch.');
    });
  });
}

async function negotiate(sellerPhone, sellerMessage) {
  log(`📩 Negotiating with ${sellerPhone}: "${sellerMessage}"`);

  const memory = loadMemory();
  const lead = memory.leads[sellerPhone] || { stage: 'new', history: [] };

  const prompt = `
You are Nia, an AI negotiator for real estate deals.
You are talking to a seller who just replied to your SMS.

Their message: "${sellerMessage}"
Their stage: ${lead.stage}
Previous conversation: ${lead.history.slice(-3).join(' | ') || 'None'}

Your job:
- Be warm, human, and persuasive.
- If they show interest, move them toward an inspection or offer.
- If they ask about price, give a fair but profitable number.
- Keep replies under 160 characters (SMS limit).

Reply to the seller now (just your reply, no extra text):
`;

  const reply = await askLLM(prompt, 'mistral');

  lead.history.push(`Seller: ${sellerMessage} → Nia: ${reply}`);
  lead.stage = lead.stage === 'new' ? 'contacted' : lead.stage;
  lead.lastContact = new Date().toISOString();
  memory.leads[sellerPhone] = lead;
  saveMemory(memory);

  log(`✅ AI response: "${reply}"`);
  return reply;
}

module.exports = { negotiate, askLLM };
