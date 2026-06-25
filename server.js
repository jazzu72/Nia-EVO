const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ledger
class Ledger {
  constructor() {
    this.path = path.join(process.env.HOME, '.nia-complete', 'ledger.json');
    if (!fs.existsSync(this.path)) {
      fs.writeFileSync(this.path, JSON.stringify({ transactions: [], balance: { available: 0, total: 0 } }, null, 2));
    }
  }

  load() {
    return JSON.parse(fs.readFileSync(this.path, 'utf8'));
  }

  save(data) {
    fs.writeFileSync(this.path, JSON.stringify(data, null, 2));
  }

  addRevenue(amount, source) {
    const data = this.load();
    data.transactions.push({ type: 'revenue', amount, source, timestamp: new Date().toISOString() });
    data.balance.available += amount;
    data.balance.total += amount;
    this.save(data);
    return data;
  }

  addExpense(amount, reason) {
    const data = this.load();
    data.transactions.push({ type: 'expense', amount, reason, timestamp: new Date().toISOString() });
    data.balance.available -= amount;
    data.balance.total -= amount;
    this.save(data);
    return data;
  }

  getBalance() {
    return this.load().balance;
  }

  getTransactions(limit = 10) {
    return this.load().transactions.slice(-limit);
  }
}

const ledger = new Ledger();

app.get('/api/balance', (req, res) => {
  res.json(ledger.getBalance());
});

app.post('/api/revenue', (req, res) => {
  const { amount, source } = req.body;
  ledger.addRevenue(amount, source);
  res.json({ success: true });
});

app.post('/api/expense', (req, res) => {
  const { amount, reason } = req.body;
  ledger.addExpense(amount, reason);
  res.json({ success: true });
});

app.get('/api/transactions', (req, res) => {
  res.json(ledger.getTransactions(100));
});

app.listen(PORT, () => {
  console.log('\n🚀 NIA-EVO LIVE on http://localhost:3000\n');
});

// Deal Discovery API
app.get('/api/deals/discover', async (req, res) => {
  const DealDiscoveryMock = require('./deal-discovery-mock');
  const engine = new DealDiscoveryMock();
  await engine.discoverDeals();
  res.json({
    deals: engine.getDealsForAPI(),
    count: engine.getDealsForAPI().length,
    hotDeals: engine.deals.filter(d => d.quality === 'HOT').length
  });
});

app.get('/api/deals', (req, res) => {
  const DealDiscoveryMock = require('./deal-discovery-mock');
  const engine = new DealDiscoveryMock();
  res.json(engine.getDealsForAPI());
});


// Deal Discovery API
app.get('/api/deals/discover', async (req, res) => {
  const DealDiscoveryMock = require('./deal-discovery-mock');
  const engine = new DealDiscoveryMock();
  await engine.discoverDeals();
  res.json({
    deals: engine.getDealsForAPI(),
    count: engine.getDealsForAPI().length,
    hotDeals: engine.deals.filter(d => d.quality === 'HOT').length
  });
});

app.get('/api/deals', (req, res) => {
  const DealDiscoveryMock = require('./deal-discovery-mock');
  const engine = new DealDiscoveryMock();
  res.json(engine.getDealsForAPI());
});

