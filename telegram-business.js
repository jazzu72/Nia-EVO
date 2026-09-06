const { default: TelegramBot } = require('node-telegram-bot-api');
const { exec } = require('child_process');

const TOKEN = '8845481308:AAE-K1YHbvdHTOkGbtbnGCbwKnmxW-GjH-Q';
const bot = new TelegramBot(TOKEN, { polling: true });

let CHAT_ID = null;

function sendToPhone(message) {
  if (!CHAT_ID) return;
  bot.sendMessage(CHAT_ID, message);
}

bot.on('message', (msg) => {
  if (!CHAT_ID) {
    CHAT_ID = msg.chat.id;
    sendToPhone('🏢 Business OS is online. Type /help for commands.');
    return;
  }

  const text = msg.text;
  if (!text) return;

  if (text === '/dashboard') {
    exec('curl -s http://localhost:3000/api/business/dashboard', (err, out) => {
      const data = JSON.parse(out);
      sendToPhone(`📊 Business Dashboard
Revenue: $${data.revenue}
Invoices: ${data.outstandingInvoices}
Appointments: ${data.appointments}
Leads: ${data.newLeads}`);
    });
    return;
  }

  if (text === '/invoices') {
    exec('curl -s http://localhost:3000/api/business/invoices', (err, out) => {
      const invoices = JSON.parse(out);
      if (invoices.length === 0) {
        sendToPhone('📄 No invoices found.');
        return;
      }
      sendToPhone(`📄 Invoices:
${invoices.map(i => `${i.customer}: $${i.amount}`).join('\n')}`);
    });
    return;
  }

  if (text.startsWith('/invoice ')) {
    const parts = text.split(' ');
    const customer = parts[1];
    const amount = parts[2];
    exec(`curl -X POST http://localhost:3000/api/business/invoices -d '{"customer":"${customer}","amount":${amount}}'`);
    sendToPhone(`✅ Invoice created for ${customer}: $${amount}`);
    return;
  }

  sendToPhone('Unknown command. Try: /dashboard, /invoices, /invoice [customer] [amount]');
});

console.log('🤖 Telegram Business OS is running.');
