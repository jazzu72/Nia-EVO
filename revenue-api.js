const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3100;
const DEPLOYMENT_ID = 'NIA-REVENUE-API-B33C913';
const LEDGER = path.join(__dirname, 'revenue-ledger.json');

function readLedger() {
  try { return JSON.parse(fs.readFileSync(LEDGER, 'utf8')); }
  catch { return { revenue: 0, deals: 0, entries: [] }; }
}

app.get('/', (req, res) => {
  res.json({ service: 'Nia-EVO Revenue API', status: 'online' });
});

app.get('/api/revenue', (req, res) => {
  const ledger = readLedger();
  res.json({
    revenue: ledger.revenue,
    deals: ledger.deals,
    entries: ledger.entries,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/revenue', express.json(), (req, res) => {
  const amount = Number(req.body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number' });
  }
  const ledger = readLedger();
  const entry = {
    id: `REV-${Date.now()}`,
    amount,
    description: req.body.description || 'Revenue entry',
    timestamp: new Date().toISOString()
  };
  ledger.revenue += amount;
  ledger.deals += 1;
  ledger.entries.push(entry);
  fs.writeFileSync(LEDGER, JSON.stringify(ledger, null, 2));
  res.status(201).json({ ok: true, entry, revenue: ledger.revenue, deals: ledger.deals });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'Nia-EVO Revenue API',
    deployment: DEPLOYMENT_ID,
    entrypoint: 'revenue-api.js'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Revenue API running on port ${PORT}`);
});

// ─── Catch‑all for unknown routes ────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

// ─── Catch‑all for unknown routes ────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

// ─── Catch‑all for unknown routes ────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});
