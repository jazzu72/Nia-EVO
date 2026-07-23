const twilio = require('twilio');
const { negotiate } = require('./ai-negotiator.js');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function handleIncoming() {
  const messages = await client.messages.list({
    to: process.env.TWILIO_PHONE_NUMBER,
    limit: 10
  });

  for (const msg of messages) {
    if (msg.direction === 'inbound') {
      console.log(`📩 Incoming: ${msg.from} → ${msg.body}`);
      const aiReply = await negotiate(msg.from, msg.body);
      await client.messages.create({
        body: aiReply,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: msg.from
      });
      console.log(`✅ AI reply sent: "${aiReply}"`);
    }
  }
}

setInterval(handleIncoming, 60000);

// ─── SMS‑to‑Deal Integration ────────────────────────────────
const { closeDeal } = require('./sms-to-deal.js');

// Intercept incoming messages for deal intent
const originalHandleIncoming = handleIncoming;
handleIncoming = async function() {
  const messages = await client.messages.list({
    to: process.env.TWILIO_PHONE_NUMBER,
    limit: 10
  });

  for (const msg of messages) {
    if (msg.direction === 'inbound') {
      console.log(`📩 Incoming: ${msg.from} → ${msg.body}`);
      await closeDeal(msg.from, msg.body);
      const aiReply = await negotiate(msg.from, msg.body);
      await client.messages.create({
        body: aiReply,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: msg.from
      });
      console.log(`✅ AI reply sent: "${aiReply}"`);
    }
  }
};
