const twilio = require('twilio');

// ─── Twilio credentials (from environment) ───────────────────
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);
const myNumber = process.env.TWILIO_PHONE_NUMBER;

// ─── Autonomous reply logic ──────────────────────────────────
async function checkAndReply() {
  console.log('🤖 CEO: Checking Twilio for replies...');

  const messages = await client.messages.list({
    to: myNumber,
    limit: 20
  });

  for (const msg of messages) {
    // Skip if already replied
    if (msg.direction === 'inbound' && !msg.replied) {
      console.log(`📩 Reply from ${msg.from}: ${msg.body}`);

      // Auto-reply based on keyword
      let reply = "Thanks for your reply! I'll schedule an inspection and get back to you with an offer.";
      
      if (msg.body.toLowerCase().includes('price')) {
        reply = "We're offering $85,000 for your property. Can we schedule an inspection tomorrow?";
      } else if (msg.body.toLowerCase().includes('inspection')) {
        reply = "Great! I'll schedule an inspection for 10 AM tomorrow. Expect a call from our agent.";
      } else if (msg.body.toLowerCase().includes('accept')) {
        reply = "Fantastic! We'll send over the contract within 24 hours.";
      }

      // Send reply
      await client.messages.create({
        body: reply,
        from: myNumber,
        to: msg.from
      });

      console.log(`✅ CEO replied to ${msg.from}: "${reply}"`);
    }
  }
}

// ─── Run every 2 minutes ──────────────────────────────────────
setInterval(checkAndReply, 120000);
console.log('🤖 CEO Twilio Agent is running.');
