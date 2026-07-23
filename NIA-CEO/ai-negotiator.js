const { exec } = require('child_process');
const { getContext, addMessage } = require('./conversation-memory.js');

async function negotiate(sellerPhone, sellerMessage) {
  // 1. Store seller's message
  addMessage(sellerPhone, 'seller', sellerMessage);

  // 2. Get conversation context (last 5 messages)
  const context = getContext(sellerPhone, 5);
  const history = context.map(m => `${m.role}: ${m.text}`).join('\n');

  // 3. Build a context‑aware prompt
  const prompt = `
You are Nia, an AI negotiator for real estate deals.
You are talking to a seller who just replied.

Previous conversation:
${history}

Your goal: Move this conversation toward a deal.
- Be warm, persuasive, and human.
- If they ask about price, give a fair number.
- If they show interest, push for an inspection.
- Keep replies under 160 characters.

Reply to the seller now:
`;

  // 4. Generate a reply using Ollama
  const reply = await new Promise((resolve) => {
    const cmd = `ollama run mistral "${prompt}"`;
    exec(cmd, { timeout: 15000 }, (error, stdout) => {
      if (error) return resolve('I’ll follow up with you shortly.');
      resolve(stdout.trim() || 'Let’s talk more.');
    });
  });

  // 5. Store Nia's reply
  addMessage(sellerPhone, 'nia', reply);

  return reply;
}

module.exports = { negotiate };
