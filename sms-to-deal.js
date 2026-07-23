const fs = require('fs');
const { exec } = require('child_process');
const { sendSMS } = require('./autonomous.js');
const { trackDeal } = require('./revenue-engine.js');

function detectDealIntent(message) {
  const keywords = ['yes', 'interested', 'accept', 'deal', 'close', 'sold', 'inspection'];
  return keywords.some(k => message.toLowerCase().includes(k));
}

async function closeDeal(phone, message) {
  if (!detectDealIntent(message)) return;

  console.log(`🤝 Detected deal intent from ${phone}: "${message}"`);

  // Generate contract
  const contract = `
PURCHASE AGREEMENT
Buyer: Nia Capital OS
Seller: ${phone}
Price: $85,000
Date: ${new Date().toISOString()}
  `;
  fs.writeFileSync(`./contracts/${phone.replace(/\+/g, '')}.txt`, contract);

  // Send confirmation SMS
  await sendSMS(phone, '✅ Deal confirmed! Contract has been sent. Please review and sign.');

  // Track revenue
  trackDeal(phone, 85000);

  // Notify owner
  exec(`./notify.sh "💰 Deal closed with ${phone} for $85,000!"`);
}

module.exports = { detectDealIntent, closeDeal };
