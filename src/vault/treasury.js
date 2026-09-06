const fs = require('fs');
const path = require('path');

const LEDGER_FILE = './runtime/vault/ledger.json';
const SECRETS_FILE = './runtime/vault/secrets.enc';

if (!fs.existsSync('./runtime/vault')) {
  fs.mkdirSync('./runtime/vault', { recursive: true });
}
if (!fs.existsSync(LEDGER_FILE)) {
  fs.writeFileSync(LEDGER_FILE, JSON.stringify({ balance: 0, transactions: [] }, null, 2));
}

function loadLedger() {
  try {
    return JSON.parse(fs.readFileSync(LEDGER_FILE, 'utf8'));
  } catch {
    return { balance: 0, transactions: [] };
  }
}

function saveLedger(ledger) {
  fs.writeFileSync(LEDGER_FILE, JSON.stringify(ledger, null, 2));
}

function deposit(amount, source, note = '') {
  const ledger = loadLedger();
  const entry = {
    id: 'TX-' + Date.now().toString(36).toUpperCase(),
    type: 'deposit',
    amount,
    source,
    note,
    timestamp: new Date().toISOString()
  };
  ledger.balance += amount;
  ledger.transactions.push(entry);
  saveLedger(ledger);
  return entry;
}

function withdraw(amount, destination, note = '') {
  const ledger = loadLedger();
  if (ledger.balance < amount) {
    throw new Error(`Insufficient balance: $${ledger.balance} < $${amount}`);
  }
  const entry = {
    id: 'TX-' + Date.now().toString(36).toUpperCase(),
    type: 'withdraw',
    amount,
    destination,
    note,
    timestamp: new Date().toISOString()
  };
  ledger.balance -= amount;
  ledger.transactions.push(entry);
  saveLedger(ledger);
  return entry;
}

function getBalance() {
  return loadLedger().balance;
}

function getTransactions(limit = 50) {
  const ledger = loadLedger();
  return ledger.transactions.slice(-limit).reverse();
}

function reconcile(revenueData) {
  const ledger = loadLedger();
  const matched = revenueData.deals.filter(deal => {
    return !ledger.transactions.find(tx => 
      tx.source === deal.phone && tx.amount === deal.amount
    );
  });
  return matched;
}

module.exports = {
  deposit,
  withdraw,
  getBalance,
  getTransactions,
  reconcile
};
