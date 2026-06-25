#!/usr/bin/env node

const express = require('express');
const path = require('path');
const fs = require('fs');
const PropertyManager = require('./property-manager');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Initialize property manager
const properties = new PropertyManager();

// Financial ledger
class FinancialLedger {
  constructor() {
    this.ledgerPath = path.join(process.env.HOME, '.nia-complete', 'ledger.json');
    this.ensureLedger();
  }

  ensureLedger() {
    if (!fs.existsSync(this.ledgerPath)) {
      fs.writeFileSync(this.ledgerPath, JSON.stringify({
        transactions: [],
        balance: { available: 0, total: 0 }
      }, null, 2));
    }
  }

  loadLedger() {
    return JSON.parse(fs.readFileSync(this.ledgerPath, 'utf8'));
  }

  saveLedger(data) {
    fs.writeFileSync(this.ledgerPath, JSON.stringify(data, null, 2));
  }

  addRevenue(amount, source) {
    const ledger = this.loadLedger();
    ledger.transactions.push({
      type: 'revenue',
      amount,
      source,
      timestamp: new Date()
    });
    ledger.balance.available += amount;
    ledger.balance.total += amount;
    this.saveLedger(ledger);
    return ledger;
  }

  addExpense(amount, reason) {
    const ledger = this.loadLedger();
    if (ledger.balance.available < amount) {
      throw new Error('Insufficient funds');
    }
    ledger.transactions.push({
      type: 'expense',
      amount,
      reason,
      timestamp: new Date()
    });
    ledger.balance.available -= amount;
    ledger.balance.total -= amount;
    this.saveLedger(ledger);
    return ledger;
  }

  getBalance() {
    const ledger = this.loadLedger();
    return ledger.balance;
  }

  getTransactions(limit = 10) {
    const ledger = this.loadLedger();
    return ledger.transactions.slice(-limit);
  }
}

const ledger = new FinancialLedger();

// API Routes
app.get('/api/status', (req, res) => {
  const balance = ledger.getBalance();
  const portfolio = properties.getPortfolioSummary();
  res.json({
    founder: 'Jason LeSane',
    company: 'House of Jazzu LLC',
    location: 'Norfolk, VA',
    status: 'OPERATIONAL',
    constitution: 'ENFORCED',
    balance,
    portfolio
  });
});

app.get('/api/balance', (req, res) => {
  res.json(ledger.getBalance());
});

app.post('/api/revenue', (req, res) => {
  try {
    const { amount, source } = req.body;
    const result = ledger.addRevenue(amount, source);
    res.json({ success: true, ledger: result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/expense', (req, res) => {
  try {
    const { amount, reason } = req.body;
    const result = ledger.addExpense(amount, reason);
    res.json({ success: true, ledger: result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/transactions', (req, res) => {
  const limit = req.query.limit || 10;
  res.json(ledger.getTransactions(limit));
});

app.get('/api/portfolio', (req, res) => {
  const summary = properties.getPortfolioSummary();
  const props = properties.getAllProperties();
  res.json({ summary, properties: props });
});

app.post('/api/property', (req, res) => {
  try {
    const { address, purchasePrice, downPayment, monthlyRent, neighborhood } = req.body;
    const id = properties.addProperty(address, purchasePrice, downPayment, monthlyRent, neighborhood);
    res.json({ success: true, id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/property/:id/metrics', (req, res) => {
  try {
    const metrics = properties.getPropertyMetrics(parseInt(req.params.id));
    res.json(metrics);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/property/:id/income', (req, res) => {
  try {
    const { amount, notes } = req.body;
    properties.addIncome(parseInt(req.params.id), amount, 'rent', notes || 'Rent');
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/property/:id/expense', (req, res) => {
  try {
    const { amount, notes } = req.body;
    properties.addExpense(parseInt(req.params.id), amount, 'maintenance', notes || 'Expense');
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 NIA-EVO API running on http://localhost:${PORT}\n`);
});

module.exports = app;
