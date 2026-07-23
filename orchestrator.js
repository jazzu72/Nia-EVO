const { loadMemory, saveMemory } = require('./memory.js');
const { sendSMS } = require('./autonomous.js');

async function orchestrate() {
  console.log('🧠 Orchestrator: Running cycle...');

  const memory = loadMemory();

  const leads = Object.keys(memory.leads);
  const nextLead = leads.find(phone => {
    const stage = memory.leads[phone].stage;
    return stage !== 'closed' && stage !== 'offer_sent';
  });

  if (!nextLead) {
    console.log('⚠️ No active leads. Sending warm outreach...');
    await sendSMS('+17573399245', 'Hi! I have a cash buyer for your property. Interested?');
    return;
  }

  const lead = memory.leads[nextLead];
  const messages = {
    new: 'Hi! I have a cash buyer for your property. Interested?',
    contacted: 'Just checking in — are you still interested in selling?',
    interested: 'Great! When can we schedule an inspection?',
    inspection_scheduled: 'I’ll send over an offer after the inspection.',
    offer_sent: 'Let me know if you have any questions about the offer.'
  };
  const message = messages[lead.stage] || 'Hi! I’m following up on your property.';

  await sendSMS(nextLead, message);
  lead.lastContact = new Date().toISOString();
  saveMemory(memory);

  console.log(`✅ Orchestrated: ${nextLead} → ${lead.stage}`);
}

setInterval(orchestrate, 120000);
