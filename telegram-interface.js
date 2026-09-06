const { Telegraf, Markup } = require('telegraf');
const { exec } = require('child_process');
const fetch = require('node-fetch');

const TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN';
const bot = new Telegraf(TOKEN);

let CHAT_ID = null;
const API_BASE = 'http://localhost:3000/api';

const replies = {
  greeting: ['👋 Good to see you, boss.', '🏰 Ready to work.', '⚡ Systems nominal.'],
  dealReady: (addr) => `🔥 Deal ready: ${addr}\nTap "Close" to proceed.`,
  error: '⚠️ Something went wrong. Try again later.'
};

function randomGreeting() {
  return replies.greeting[Math.floor(Math.random() * replies.greeting.length)];
}

async function fetchData(endpoint) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`);
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch (e) {
    console.error(`Fetch error: ${e.message}`);
    return null;
  }
}

bot.start((ctx) => {
  CHAT_ID = ctx.chat.id;
  ctx.reply(
    `🏰 *Jarvis Online*\n\n${randomGreeting()}\n\nWhat would you like to do?`,
    Markup.inlineKeyboard([
      [Markup.button.callback('📊 Deals', 'menu_deals')],
      [Markup.button.callback('📋 Grants', 'menu_grants')],
      [Markup.button.callback('💰 Treasury', 'menu_treasury')],
      [Markup.button.callback('🛠️ System', 'menu_system')],
      [Markup.button.callback('ℹ️ Help', 'menu_help')],
    ])
  );
});

bot.action('menu_deals', async (ctx) => {
  const data = await fetchData('/business/dashboard');
  const active = data?.newLeads || 0;
  ctx.editMessageText(
    `📊 *Active Deals*\n\n🔹 New leads: ${active}\n🔹 Total pipeline: $${(data?.revenue || 0).toLocaleString()}\n\nChoose an action:`,
    Markup.inlineKeyboard([
      [Markup.button.callback('📋 View all leads', 'deals_list')],
      [Markup.button.callback('🏠 Back to main', 'back_main')],
    ])
  );
});

bot.action('menu_grants', async (ctx) => {
  const data = await fetchData('/grants');
  const count = data?.length || 0;
  ctx.editMessageText(
    `📋 *Grant Engine*\n\n🔹 Active grants: ${count}\n\nChoose an action:`,
    Markup.inlineKeyboard([
      [Markup.button.callback('🔍 Scan now', 'grants_scan')],
      [Markup.button.callback('🏠 Back to main', 'back_main')],
    ])
  );
});

bot.action('menu_treasury', async (ctx) => {
  const data = await fetchData('/treasury/balance');
  const balance = data?.balance || 0;
  ctx.editMessageText(
    `💰 *Treasury*\n\nAvailable balance: *$${balance.toLocaleString()}*\n\nRecent transactions: (coming soon)`,
    Markup.inlineKeyboard([
      [Markup.button.callback('📊 View all', 'treasury_details')],
      [Markup.button.callback('🏠 Back to main', 'back_main')],
    ])
  );
});

bot.action('menu_system', async (ctx) => {
  const health = await fetchData('/health');
  ctx.editMessageText(
    `🛠️ *System Status*\n\nAPI: ${health ? '✅ Healthy' : '❌ Unreachable'}\nAll services: ${health ? '✅ Online' : '⚠️ Check logs'}`,
    Markup.inlineKeyboard([
      [Markup.button.callback('📊 Full status', 'system_details')],
      [Markup.button.callback('🏠 Back to main', 'back_main')],
    ])
  );
});

bot.action('menu_help', (ctx) => {
  ctx.editMessageText(
    `ℹ️ *Help*\n\nI'm your autonomous CEO assistant. I handle deals, grants, treasury, and system health.\n\nUse the buttons to navigate. If you have a direct question, just type it.`,
    Markup.inlineKeyboard([[Markup.button.callback('🏠 Back to main', 'back_main')]])
  );
});

bot.action('back_main', (ctx) => {
  ctx.editMessageText(
    `🏰 *Jarvis Online*\n\n${randomGreeting()}`,
    Markup.inlineKeyboard([
      [Markup.button.callback('📊 Deals', 'menu_deals')],
      [Markup.button.callback('📋 Grants', 'menu_grants')],
      [Markup.button.callback('💰 Treasury', 'menu_treasury')],
      [Markup.button.callback('🛠️ System', 'menu_system')],
      [Markup.button.callback('ℹ️ Help', 'menu_help')],
    ])
  );
});

bot.on('text', (ctx) => {
  const text = ctx.message.text.toLowerCase();
  if (text.includes('hello') || text.includes('hi')) {
    return ctx.reply(`${randomGreeting()} Type /start to open the main menu.`);
  }
  if (text.includes('thank')) {
    return ctx.reply('🙏 Always here, boss.');
  }
  ctx.reply(`🤖 I didn't understand that. Try /start to see the menu.`);
});

bot.launch();
console.log('🤖 Jarvis is online.');

// ─── Grant notification ──────────────────────────────────────
function notifyGrant(grant) {
  if (!CHAT_ID) return;
  bot.telegram.sendMessage(
    CHAT_ID,
    `📋 *Grant Submitted*\n\nTitle: ${grant.title}\nSource: ${grant.source}\nURL: ${grant.url}`
  );
}
module.exports = { notifyGrant };

// ─── /rss — Fetch latest grants and leads ──────────────────
bot.command('rss', async (ctx) => {
  const { tools } = require('./orchestrator');
  const grants = await tools.rss.fetch(FEEDS.grants, 5);
  const leads = await tools.rss.fetch(FEEDS.realEstate, 5);
  let msg = '📡 *Latest Data*\n\n';
  if (grants.length) {
    msg += '📋 *Grants*\n' + grants.map(g => `• ${g.title}`).join('\n') + '\n\n';
  }
  if (leads.length) {
    msg += '🏠 *Leads*\n' + leads.map(l => `• ${l.title}`).join('\n');
  }
  if (!grants.length && !leads.length) msg += 'No new data found.';
  ctx.reply(msg, { parse_mode: 'Markdown' });
});

// ─── /prospects — Show high‑priority prospects ────────────
bot.command('prospects', async (ctx) => {
  const prospects = require('./modules/revenue/prospects');
  const top = prospects.getHighPriority(50);
  if (top.length === 0) {
    return ctx.reply('📭 No high‑priority prospects found.');
  }
  let msg = '📋 *Top Prospects (Score ≥ 50)*\n\n';
  top.slice(0, 5).forEach(p => {
    msg += `• ${p.company} (${p.industry || 'N/A'}) — Score: ${p.score}\n`;
    msg += `  Contact: ${p.contact || 'N/A'}\n`;
    msg += `  Status: ${p.status}\n\n`;
  });
  ctx.reply(msg, { parse_mode: 'Markdown' });
});

bot.command('kill', (ctx) => {
  const killFlag = './data/kill-switch.flag';
  if (fs.existsSync(killFlag)) {
    ctx.reply('🛑 Kill switch already active. Use /resume to reactivate.');
  } else {
    fs.writeFileSync(killFlag, 'killed');
    ctx.reply('🛑 Kill switch activated. Nia CEO agent paused.');
  }
});

bot.command('resume', (ctx) => {
  const killFlag = './data/kill-switch.flag';
  if (fs.existsSync(killFlag)) {
    fs.unlinkSync(killFlag);
    ctx.reply('✅ Nia CEO agent resumed.');
  } else {
    ctx.reply('✅ Already running.');
  }
});

bot.command('truth', (ctx) => {
  const log = fs.existsSync('./data/truth-log.json') ? JSON.parse(fs.readFileSync('./data/truth-log.json')) : [];
  const last = log.slice(-5).map(e => `${e.timestamp} – ${e.action}`).join('\n');
  ctx.reply(`📖 Truth Log (last 5):\n${last || 'No entries.'}`);
});

bot.command('kill', (ctx) => {
  const killFlag = './data/kill-switch.flag';
  if (fs.existsSync(killFlag)) {
    ctx.reply('🛑 Kill switch already active. Use /resume to reactivate.');
  } else {
    fs.writeFileSync(killFlag, 'killed');
    ctx.reply('🛑 Kill switch activated. Nia CEO agent paused.');
  }
});

bot.command('resume', (ctx) => {
  const killFlag = './data/kill-switch.flag';
  if (fs.existsSync(killFlag)) {
    fs.unlinkSync(killFlag);
    ctx.reply('✅ Nia CEO agent resumed.');
  } else {
    ctx.reply('✅ Already running.');
  }
});

bot.command('truth', (ctx) => {
  const log = fs.existsSync('./data/truth-log.json') ? JSON.parse(fs.readFileSync('./data/truth-log.json')) : [];
  const last = log.slice(-5).map(e => `${e.timestamp} – ${e.action}`).join('\n');
  ctx.reply(`📖 Truth Log (last 5):\n${last || 'No entries.'}`);
});

// ─── Bluevine Commands ──────────────────────────────────────
bot.command('balance', (ctx) => {
  const bank = require('./modules/banking/bluevine');
  const bal = bank.getBalance();
  ctx.reply(`💰 Bluevine Balance: $${bal.toLocaleString()}`);
});

bot.command('deposit', (ctx) => {
  const args = ctx.message.text.split(' ');
  const amount = parseFloat(args[1]);
  const note = args.slice(2).join(' ') || 'Revenue deposit';
  if (!amount || isNaN(amount)) {
    return ctx.reply('Usage: /deposit <amount> [note]');
  }
  const bank = require('./modules/banking/bluevine');
  const result = bank.updateBalance(amount, note);
  ctx.reply(`✅ Deposit of $${amount} recorded.\nNew balance: $${result.balance.toLocaleString()}`);
});

bot.command('account', (ctx) => {
  const bank = require('./modules/banking/bluevine');
  const acc = bank.getAccount();
  ctx.reply(`🏦 Bank: ${acc.bank}\nAccount: ${acc.accountNumber.slice(-4).padStart(12, '*')}\nRouting: ${acc.routingNumber}`);
});
