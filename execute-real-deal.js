#!/usr/bin/env node

/**
 * EXECUTE REAL DEAL WITH MERCURY
 * End-to-end: discovery → closing → real money movement
 */

const path = require('path');
const fs = require('fs');
const MarkovMoneyFlowEngine = require('./money-flow-markov');
const MercuryIntegration = require('./mercury-integration');

class FinancialLedger {
  constructor() {
    this.path = path.join(process.env.HOME, '.nia-complete', 'ledger.json');
  }
  load() {
    return JSON.parse(fs.readFileSync(this.path, 'utf8'));
  }
  save(data) {
    fs.writeFileSync(this.path, JSON.stringify(data, null, 2));
  }
  addRevenue(amount, source) {
    const data = this.load();
    data.transactions.push({ type: 'revenue', amount, source, timestamp: new Date() });
    data.balance.available += amount;
    data.balance.total += amount;
    this.save(data);
  }
  addExpense(amount, reason) {
    const data = this.load();
    data.transactions.push({ type: 'expense', amount, reason, timestamp: new Date() });
    data.balance.available -= amount;
    data.balance.total -= amount;
    this.save(data);
  }
  getBalance() {
    return this.load().balance;
  }
}

async function executeRealDeal() {
  // Initialize
  const ledger = new FinancialLedger();
  const flow = new MarkovMoneyFlowEngine();

  // Get Mercury credentials
  const apiKey = process.env.MERCURY_API_KEY;
  const accountId = process.env.MERCURY_ACCOUNT;

  if (!apiKey || !accountId) {
    console.log('❌ Missing Mercury credentials');
    console.log('Set: export MERCURY_API_KEY="..." && export MERCURY_ACCOUNT="..."\n');
    process.exit(1);
  }

  const mercury = new MercuryIntegration(apiKey, accountId);

  console.log('\n════════════════════════════════════════════════════════════');
  console.log('🚀 REAL DEAL EXECUTION WITH MERCURY');
  console.log('════════════════════════════════════════════════════════════\n');

  // Verify Mercury connection
  const connected = await mercury.verifyConnection();
  if (!connected) {
    console.log('❌ Cannot proceed - Mercury not connected\n');
    process.exit(1);
  }

  // Real deal
  const deal = {
    id: 'real-deal-001',
    title: 'Fixer Upper - Canton - REAL',
    price: 85000,
    arv: 141667,
    location: 'Canton',
    condition: 'needs_work'
  };

  console.log('STEP 1: MARKOV SCORE');
  console.log('─'.repeat(60));
  const scored = flow.discoverAndScore(deal);

  console.log('STEP 2: AUTO-OFFER');
  console.log('─'.repeat(60));
  flow.sendOfferIfQualified(deal.id);

  console.log('STEP 3: ACCEPT & PLAN');
  console.log('─'.repeat(60));
  flow.acceptAndPlanDeployment(deal.id);

  console.log('STEP 4: CLOSE DEAL');
  console.log('─'.repeat(60));
  flow.closeDeal(deal.id, ledger);

  // REAL MERCURY TRANSFER
  console.log('STEP 5: WIRE ASSIGNMENT FEE (REAL MERCURY)');
  console.log('─'.repeat(60));
  try {
    await mercury.wireAssignmentFee(
      'title@company.com',
      scored.markovAnalysis.wholesaleFee,
      deal.title
    );
  } catch (err) {
    console.log(`❌ Wire failed: ${err.message}\n`);
    process.exit(1);
  }

  console.log('STEP 6: DEPLOY CAPITAL');
  console.log('─'.repeat(60));
  flow.deployCapital(deal.id, '3830 Brooklyn Ave, Canton', ledger);

  // REAL MERCURY TRANSFER - DOWN PAYMENT
  console.log('STEP 7: WIRE DOWN PAYMENT (REAL MERCURY)');
  console.log('─'.repeat(60));
  try {
    await mercury.wireDownPayment(
      'lender@bank.com',
      Math.round(deal.price * 0.40),
      '3830 Brooklyn Ave, Canton'
    );
  } catch (err) {
    console.log(`❌ Wire failed: ${err.message}\n`);
    process.exit(1);
  }

  console.log('STEP 8: COLLECT CASHFLOW');
  console.log('─'.repeat(60));
  flow.collectCashflow('3830 Brooklyn Ave, Canton', scored.markovAnalysis.monthlyRent, ledger);

  // Final report
  console.log('\n════════════════════════════════════════════════════════════');
  console.log('✅ REAL DEAL COMPLETE - MERCURY AUDIT LOG');
  console.log('════════════════════════════════════════════════════════════\n');

  const history = mercury.getTransactionHistory();
  console.log(`Transfers: ${history.transfers.length}`);
  console.log(`Failed: ${history.failedCount}`);
  console.log(`Total Moved: $${history.totalTransferred.toLocaleString()}\n`);

  history.transfers.forEach(t => {
    console.log(`✓ ${t.type}: $${t.amount.toLocaleString()} → ${t.recipient}`);
  });

  console.log('\n════════════════════════════════════════════════════════════\n');
}

executeRealDeal().catch(err => {
  console.error(`❌ Execution failed: ${err.message}\n`);
  process.exit(1);
});
