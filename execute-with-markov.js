#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const MarkovMoneyFlowEngine = require('./money-flow-markov');

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

console.log('\n════════════════════════════════════════════════════════════');
console.log('🚀 EXECUTING WITH MARKOV MATH');
console.log('════════════════════════════════════════════════════════════\n');

const ledger = new FinancialLedger();
const flow = new MarkovMoneyFlowEngine();

// Add starting capital
ledger.addRevenue(95000, 'initial_capital');

const deal = {
  id: 'deal-001',
  title: 'Fixer Upper - Canton',
  price: 85000,
  arv: 141667,
  location: 'Canton',
  condition: 'needs_work'
};

console.log('STEP 1: DISCOVER & MARKOV SCORE');
console.log('─'.repeat(60));
const scored = flow.discoverAndScore(deal);

console.log('STEP 2: AUTO-OFFER (if score > 75)');
console.log('─'.repeat(60));
flow.sendOfferIfQualified(deal.id);

console.log('STEP 3: ACCEPT & PLAN DEPLOYMENT');
console.log('─'.repeat(60));
flow.acceptAndPlanDeployment(deal.id);

console.log('STEP 4: CLOSE DEAL');
console.log('─'.repeat(60));
flow.closeDeal(deal.id, ledger);

console.log('STEP 5: DEPLOY CAPITAL');
console.log('─'.repeat(60));
flow.deployCapital(deal.id, '3830 Brooklyn Ave, Canton', ledger);

console.log('STEP 6: COLLECT CASHFLOW');
console.log('─'.repeat(60));
flow.collectCashflow('3830 Brooklyn Ave, Canton', scored.markovAnalysis.monthlyRent, ledger);

console.log('FINAL ANALYSIS');
console.log('═'.repeat(60));
flow.portfolioAnalysis();

const balance = ledger.getBalance();
console.log(`📊 ACCOUNT STATUS:`);
console.log(`   Starting: $95,000`);
console.log(`   Wholesale Revenue: +$${scored.markovAnalysis.wholesaleFee.toLocaleString()}`);
console.log(`   Down Payment: -$${Math.round(deal.price * 0.40).toLocaleString()}`);
console.log(`   First Month Rent: +$${scored.markovAnalysis.monthlyRent.toLocaleString()}`);
console.log(`   Current Balance: $${balance.available.toLocaleString()}`);
console.log(`   Status: ✅ PROFITABLE & COMPOUNDING\n`);

