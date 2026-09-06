const { default: TelegramBot } = require('node-telegram-bot-api');
const { exec } = require('child_process');

const TOKEN = '8845481308:AAE-K1YHbvdHTOkGbtbnGCbwKnmxW-GjH-Q';
const bot = new TelegramBot(TOKEN, { polling: true });

let CHAT_ID = null;

bot.on('message', (msg) => {
  if (!CHAT_ID) {
    CHAT_ID = msg.chat.id;
    bot.sendMessage(CHAT_ID, '🏰 Nia is now fully autonomous. She will notify you of deals.');
    return;
  }
});

// Simulate a deal notification (real system would hook into CEO)
setTimeout(() => {
  if (CHAT_ID) {
    bot.sendMessage(CHAT_ID, '💰 Deal ready: Seller at 123 Main St replied "Interested".');
  }
}, 10000);
