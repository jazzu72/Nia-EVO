const fs = require('fs');
const { exec } = require('child_process');

const PIPELINE = './data/revenue-pipeline.json';

function loadPipeline() {
  if (!fs.existsSync(PIPELINE)) return { contacts: [] };
  return JSON.parse(fs.readFileSync(PIPELINE, 'utf8'));
}

function savePipeline(data) {
  fs.writeFileSync(PIPELINE, JSON.stringify(data, null, 2));
}

function checkAndTrigger() {
  const data = loadPipeline();
  const hot = data.contacts.filter(c => c.probability >= 70 && !c.triggerProposal);

  hot.forEach(c => {
    c.triggerProposal = true;
    c.proposalRequested = true;
    console.log(`🚀 Auto Proposal Trigger activated for ${c.name}`);
  });

  savePipeline(data);
  if (hot.length > 0) {
    exec('pm2 restart proposal-queue-worker deal-closer');
  }
}

checkAndTrigger();
