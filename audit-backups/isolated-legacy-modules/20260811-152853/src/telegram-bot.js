/**
 * Telegram Bot Integration
 * Real-time notifications and commands
 */

const https = require('https');
require('dotenv').config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Send Telegram message
function sendTelegramMessage(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('Telegram not configured, skipping notification');
    return;
  }

  const text = typeof message === 'string' ? message : JSON.stringify(message, null, 2);
  
  const data = JSON.stringify({
    chat_id: TELEGRAM_CHAT_ID,
    text: text,
    parse_mode: 'HTML'
  });

  const options = {
    hostname: 'api.telegram.org',
    port: 443,
    path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = https.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('✅ Telegram notification sent');
      } else {
        console.log('⚠️ Telegram response:', res.statusCode);
      }
    });
  });

  req.on('error', err => console.log('Telegram error:', err.message));
  req.write(data);
  req.end();
}

// Alert formats
const alerts = {
  smsReceived: (seller, message) => 
  
  dealCreated: (address, price, profit) =>
    `🏠 <b>Deal Created</b>\n${address}\nPrice: $${price.toLocaleString()}\nProfit: $${profit.toLocaleString()}`,
  
  capitalUpdated: (available, deployed) =>
    `💰 <b>Capital Update</b>\nAvailable: $${available.toLocaleString()}\nDeployed: $${deployed.toLocaleString()}`,
  
  healthAlert: (status) =>
    `⚠️ <b>System Alert</b>\n${status}`,
  
  statusReport: (stats) => {
    let report = '<b>📊 Daily Status Report</b>\n\n';
    report += `SMS Sent: ${stats.smsSent}\n`;
    report += `Active Leads: ${stats.leads}\n`;
    report += `Capital: $${stats.capital.toLocaleString()}\n`;
    report += `Grants: $${stats.grants.toLocaleString()}\n`;
    return report;
  }
};

module.exports = { sendTelegramMessage, alerts };
