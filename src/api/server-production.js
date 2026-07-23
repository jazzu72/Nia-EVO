const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (req, res) => res.sendFile(__dirname + '/public/landing.html'));
  res.json({ status: 'online', service: 'Nia Capital OS' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Nia Capital OS running on http://localhost:${PORT}`);
});

// ─── Business OS ─────────────────────────────────────────────
const businessRoutes = require('../../modules/business/routes');
app.use('/api/business', businessRoutes);

// ─── Business OS ─────────────────────────────────────────────
const businessRoutes = require('../../modules/business/routes');
app.use('/api/business', businessRoutes);
app.get('/client', (req, res) => res.sendFile(__dirname + '/public/client-dashboard.html'));

const billingRoutes = require('./modules/billing/routes');
app.use('/api/billing', billingRoutes);
app.get('/landing', (req, res) => res.sendFile(__dirname + '/public/landing.html'));
app.get('/landing', (req, res) => res.sendFile(__dirname + '/public/landing.html'));

// Telegram Webhook Handler
const { sendTelegramMessage, alerts } = require('../telegram-bot');

app.post('/api/telegram/webhook', (req, res) => {
  res.json({ ok: true });
  
  const { message } = req.body;
  if (!message) return;

  const text = message.text || '';
  const chatId = message.chat.id;

  // Handle commands
  if (text.startsWith('/status')) {
    sendTelegramMessage(alerts.statusReport({
      smsSent: 50,
      leads: 0,
      capital: config.capital.initialBalance,
      grants: config.grants.pipelineValue
    }));
  } else if (text.startsWith('/dashboard')) {
    sendTelegramMessage(`📊 Dashboard: http://localhost:3000/dashboard`);
  } else if (text.startsWith('/sms')) {
    sendTelegramMessage(`📱 Check Twilio: https://www.twilio.com/console`);
  }
});

// Export telegram alerts for use in other services
app.use((req, res, next) => {
  req.telegram = { sendTelegramMessage, alerts };
  next();
});
