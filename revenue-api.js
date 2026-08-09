const express = require('express');
const app = express();
const PORT = process.env.PORT || 3100;
const DEPLOYMENT_ID = 'NIA-REVENUE-API-B33C913';

app.get('/', (req, res) => {
  res.json({ service: 'Nia-EVO Revenue API', status: 'online' });
});

app.get('/api/revenue', (req, res) => {
  res.json({ revenue: 2500, deals: 1, timestamp: new Date().toISOString() });
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
