const { default: TelegramBot } = require('node-telegram-bot-api');
const { exec } = require('child_process');

const TOKEN = '8845481308:AAE-K1YHbvdHTOkGbtbnGCbwKnmxW-GjH-Q';
const bot = new TelegramBot(TOKEN, { polling: true });

let CHAT_ID = null;
const activeConversations = {};

// ─── Send a message to your phone ──────────────────────────
function sendToPhone(message) {
  if (!CHAT_ID) return;
  bot.sendMessage(CHAT_ID, message);
}

    if (err) return;
    try {
      const replies = JSON.parse(out);
      for (const reply of replies) {
        const seller = reply.from;
        const body = reply.body;

        // Store conversation
        if (!activeConversations[seller]) {
          activeConversations[seller] = [];
        }
        activeConversations[seller].push({ role: 'seller', text: body });

        sendToPhone(`📩 ${seller}: "${body}"`);
      }
    } catch (e) {}
  });
}

// ─── Reply to a seller via Telegram ─────────────────────────
bot.on('message', (msg) => {
  if (!CHAT_ID) {
    CHAT_ID = msg.chat.id;
    sendToPhone('👋 Nia is online. Seller replies will appear here.');
    return;
  }

  const text = msg.text;
  if (!text) return;

  // Find the most recent active seller
  const sellers = Object.keys(activeConversations);
  if (sellers.length === 0) {
    sendToPhone('No active sellers. Wait for a reply.');
    return;
  }

  const lastSeller = sellers[sellers.length - 1];
  const seller = lastSeller;

  // Send SMS via Nia
  exec(`curl -X POST http://localhost:3000/api/sms/send -d '{"to":"${seller}","message":"${text}"}'`);

  // Store conversation
  if (!activeConversations[seller]) {
    activeConversations[seller] = [];
  }
  activeConversations[seller].push({ role: 'you', text });

  sendToPhone(`✅ Sent to ${seller}: "${text}"`);
});

// ─── List active conversations ──────────────────────────────
bot.onText(/\/list/, (msg) => {
  const sellers = Object.keys(activeConversations);
  if (sellers.length === 0) {
    sendToPhone('No active conversations.');
    return;
  }
  sendToPhone(`Active conversations: ${sellers.join(', ')}`);
});

// ─── Start monitoring ────────────────────────────────────────
console.log('💬 Conversational Telegram bot is running.');
