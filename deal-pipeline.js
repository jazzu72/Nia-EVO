
const { scheduleInspection } = require('./modules/scheduler/auto-schedule');
const { sendForSignature } = require('./modules/contracts/auto-sign');
const { transferFunds } = require('./modules/treasury/auto-fund');

const originalAutoClose = autoCloseDeal;
autoCloseDeal = async function(id) {
  const pipe = loadPipeline();
  const deal = pipe.deals.find(d => d.id === id);
  if (!deal || deal.stage !== 'offer_accepted') return;

  scheduleInspection(deal);
  const contractText = generateContract(deal);
  deal.contractText = contractText;
  await sendForSignature(deal);
  deal.stage = 'funding';
  savePipeline(pipe);
  await transferFunds(deal);
  deal.stage = 'closed';
  deal.closedAt = new Date().toISOString();
  savePipeline(pipe);
  console.log(`💰 Deal ${id} auto‑closed. Revenue logged.`);
  return deal;
};

const { scheduleInspection } = require('./modules/scheduler/auto-schedule');
const { sendForSignature } = require('./modules/contracts/auto-sign');
const { transferFunds } = require('./modules/treasury/auto-fund');

const originalAutoClose = autoCloseDeal;
autoCloseDeal = async function(id) {
  const pipe = loadPipeline();
  const deal = pipe.deals.find(d => d.id === id);
  if (!deal || deal.stage !== 'offer_accepted') return;

  scheduleInspection(deal);
  const contractText = generateContract(deal);
  deal.contractText = contractText;
  await sendForSignature(deal);
  deal.stage = 'funding';
  savePipeline(pipe);
  await transferFunds(deal);
  deal.stage = 'closed';
  deal.closedAt = new Date().toISOString();
  savePipeline(pipe);
  console.log(`💰 Deal ${id} auto‑closed. Revenue logged.`);
  return deal;
};
