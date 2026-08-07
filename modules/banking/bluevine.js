const fs = require('fs');
const path = require('path');

// Your Bluevine account details (hardcoded per your request)
const ACCOUNT = {
  bank: 'Bluevine',
  accountNumber: '875108033064',
  routingNumber: '125109019',
  balance: 0, // manually updated via /deposit
  lastUpdated: null
};

const PIPELINE_FILE = path.join(__dirname, '../../data/revenue-pipeline.json');

function getAccount() {
  return { ...ACCOUNT };
}

function updateBalance(amount, note = '') {
  const pipeline = fs.existsSync(PIPELINE_FILE)
    ? JSON.parse(fs.readFileSync(PIPELINE_FILE, 'utf8'))
    : [];

  // Add a deposit record
  pipeline.push({
    id: Date.now(),
    type: 'DEPOSIT',
    target: 'Bluevine',
    action: `Deposit $${amount} – ${note}`,
    status: 'CLOSED',
    amount: amount,
    created: new Date().toISOString()
  });

  ACCOUNT.balance += amount;
  ACCOUNT.lastUpdated = new Date().toISOString();

  fs.writeFileSync(PIPELINE_FILE, JSON.stringify(pipeline, null, 2));
  return { balance: ACCOUNT.balance, amount, note };
}

function getBalance() {
  return ACCOUNT.balance;
}

module.exports = { getAccount, updateBalance, getBalance };
