const { negotiate } = require('./ai-negotiator.js');
const { loadMemory, saveMemory, updateLead } = require('./memory.js');
const { getBestVariation, trackSent } = require('./ab-test.js');
const { generateContract } = require('./contract-generator.js');
const { sendSMS } = require('./autonomous.js');

const LEAD_STAGES = ['new', 'contacted', 'interested', 'inspection_scheduled', 'offer_sent', 'closed'];

async function orchestrate() {
  console.log('🧠 Orchestrator: Running cycle...');

  const memory = loadMemory();

  // 1. Find next lead
  const leads = Object.keys(memory.leads);
  const nextLead = leads.find(phone => {
    const stage = memory.leads[phone].stage;
    return stage !== 'closed' && stage !== 'offer_sent';
  });

  if (!nextLead) {
    console.log('⚠️ No active leads. Sending warm outreach...');
    // Send a cold SMS to a known number (for demo)
    await sendSMS('+17573399245', 'Hi! I have a cash buyer for your property. Interested?');
    return;
  }

  // 2. Send follow-up based on stage
  const lead = memory.leads[nextLead];
  const message = getNextMessage(lead.stage);
  await sendSMS(nextLead, message);

  // 3. Update memory
  lead.lastContact = new Date().toISOString();
  saveMemory(memory);

  console.log(`✅ Orchestrated: ${nextLead} → ${lead.stage}`);
}

function getNextMessage(stage) {
  const messages = {
    new: 'Hi! I have a cash buyer for your property. Interested?',
    contacted: 'Just checking in — are you still interested in selling?',
    interested: 'Great! When can we schedule an inspection?',
    inspection_scheduled: 'I’ll send over an offer after the inspection.',
    offer_sent: 'Let me know if you have any questions about the offer.'
  };
  return messages[stage] || 'Hi! I’m following up on your property.';
}

setInterval(orchestrate, 120000);
