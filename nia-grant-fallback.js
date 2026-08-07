const fs = require('fs');
const { exec } = require('child_process');

const grants = JSON.parse(fs.readFileSync('./data/curated-grants.json', 'utf8'));
const queue = './data/manual-submission-queue.json';

let q = fs.existsSync(queue) ? JSON.parse(fs.readFileSync(queue)) : [];
grants.forEach(g => {
  if (!q.find(item => item.title === g.title)) {
    q.push({ ...g, status: 'MANUAL', queuedAt: new Date().toISOString() });
  }
});
fs.writeFileSync(queue, JSON.stringify(q, null, 2));

// Notify via Telegram
const token = process.env.TELEGRAM_BOT_TOKEN || '8845481308:AAE-K1YHbvdHTOkGbtbnGCbwKnmxW-GjH-Q';
const chatId = process.env.TELEGRAM_CHAT_ID || 'YOUR_CHAT_ID';
const msg = `📋 ${grants.length} grants queued for manual submission. Check ${queue}`;
exec(`curl -s -X POST https://api.telegram.org/bot${token}/sendMessage -d "chat_id=${chatId}&text=${encodeURIComponent(msg)}"`);
console.log('✅ Grants queued for manual submission. Telegram alert sent.');
