const twilio = require('twilio');
const { negotiate } = require('./ai-negotiator.js');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function sendSMS(to, message) {
  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });
    console.log(`📱 SMS sent to ${to}: "${message}"`);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error(`❌ SMS failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runCycle() {
  console.log('🤖 CEO CYCLE STARTED');
  await sendSMS('+17573399245', 'Hi! I have a cash buyer for your property. Interested?');
}

setInterval(runCycle, 60000);

// ─── Brain Integration ──────────────────────────────────────
const brain = require('./brain-core.js');

// Replace the simple setInterval loop with a smart loop
async function smartCycle() {
  const action = brain.getNextAction();
  console.log(`🧠 Brain says: ${action.action} → ${action.leads.join(', ')}`);

  for (const phone of action.leads) {
    await sendSMS(phone, 'Hi! I’m following up on your property.');
  }

  const strategy = brain.generateStrategy();
  console.log(`🧠 Strategy: ${strategy}`);
}

// Run every 5 minutes (smarter than 60s)
setInterval(smartCycle, 300000);
