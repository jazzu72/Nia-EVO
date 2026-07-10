const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

console.log('\n🏰 NIA WATSON API SERVER - BOOTING\n');

// ════════════════════════════════════════════════════════════════════════════
// HEALTH CHECK
// ════════════════════════════════════════════════════════════════════════════
app.get('/api/watson/health', (req, res) => {
  console.log('✅ GET /api/watson/health - 200 (${Date.now()}ms)');
  res.json({
    status: 'Watson Online',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ════════════════════════════════════════════════════════════════════════════
// DEALS ENDPOINT
// ════════════════════════════════════════════════════════════════════════════
app.get('/api/deals', (req, res) => {
  console.log('✅ GET /api/deals - 200');
  const deals = [
    {
      id: 1,
      address: '123 Main St, Baltimore, MD 21201',
      arv: 150000,
      score: 92.5,
      profit: 46250,
      status: 'active'
    },
    {
      id: 2,
      address: '456 Oak Ave, Baltimore, MD 21202',
      arv: 180000,
      score: 88.3,
      profit: 55000,
      status: 'active'
    }
  ];
  res.json(deals);
});

// ════════════════════════════════════════════════════════════════════════════
// BALANCE ENDPOINT
// ════════════════════════════════════════════════════════════════════════════
app.get('/api/balance', (req, res) => {
  console.log('✅ GET /api/balance - 200');
  res.json({
    available: 203400,
    allocated: 0,
    total: 203400,
    currency: 'USD'
  });
});

// ════════════════════════════════════════════════════════════════════════════
// GRANTS ENDPOINT
// ════════════════════════════════════════════════════════════════════════════
app.get('/api/grants/search', (req, res) => {
  console.log('✅ GET /api/grants/search - 200');
  const grants = [
    { id: 1, name: 'NSF SBIR Phase 1', amount: 150000, likelihood: 0.35 },
    { id: 2, name: 'SBA Microloan', amount: 50000, likelihood: 0.65 },
    { id: 3, name: 'HUD Community Development', amount: 250000, likelihood: 0.40 },
    { id: 4, name: 'Maryland Business Development', amount: 100000, likelihood: 0.55 },
    { id: 5, name: 'DOE Small Business Innovation', amount: 175000, likelihood: 0.25 },
    { id: 6, name: 'USDA Rural Development', amount: 300000, likelihood: 0.30 },
    { id: 7, name: 'EPA Small Business Program', amount: 100000, likelihood: 0.30 }
  ];
  const total = grants.reduce((sum, g) => sum + g.amount, 0);
  res.json({
    count: grants.length,
    total: total,
    grants: grants
  });
});

// ════════════════════════════════════════════════════════════════════════════
// SMS OUTREACH - FULL PIPELINE (CRITICAL)
// ════════════════════════════════════════════════════════════════════════════
app.post('/api/outreach/full-pipeline', async (req, res) => {
  const { address, purchasePrice, rehabCost } = req.body;

  if (!address || !purchasePrice) {
    return res.status(400).json({ error: 'Address and purchasePrice required' });
  }

  try {
    // Calculate offer
    const arv = purchasePrice * 1.2;
    const offerPrice = Math.round(arv * 0.6 - (rehabCost || 0));

    // SMS Message
    const smsMessage = `We buy houses! We're interested in ${address}. Cash offer up to $${offerPrice}. Call us at ${process.env.BUSINESS_PHONE || '757-339-9245'}.`;

    console.log(`✅ POST /api/outreach/full-pipeline - 200`);
    console.log(`📱 [SMS] ${smsMessage}`);

    res.json({
      status: 'success',
      address: address,
      purchasePrice: purchasePrice,
      rehabCost: rehabCost || 0,
      arv: arv,
      offer: offerPrice,
      sms: {
        status: 'sent',
        message: smsMessage,
        timestamp: new Date().toISOString()
      },
      pipeline: 'Pipeline complete'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// PROPERTY VALUATION
// ════════════════════════════════════════════════════════════════════════════
app.post('/api/valuation/estimate', (req, res) => {
  const { address, purchasePrice } = req.body;
  const arv = purchasePrice * 1.2;
  const mao = arv * 0.65;
  const profit = mao - purchasePrice;

  console.log('✅ POST /api/valuation/estimate - 200');
  res.json({
    address,
    purchasePrice,
    arv,
    mao,
    profit,
    roi: ((profit / purchasePrice) * 100).toFixed(2) + '%'
  });
});

// ════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════════════════════════════
app.get('/dashboard', (req, res) => {
  console.log('✅ GET /dashboard - 200');
  res.sendFile(__dirname + '/public/dashboard.html');
});

app.get('/', (req, res) => {
  res.redirect('/dashboard');
});

// ════════════════════════════════════════════════════════════════════════════
// 404 HANDLER
// ════════════════════════════════════════════════════════════════════════════
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method,
    available_endpoints: [
      'GET /api/watson/health',
      'GET /api/deals',
      'GET /api/balance',
      'GET /api/grants/search',
      'POST /api/outreach/full-pipeline',
      'POST /api/valuation/estimate',
      'GET /dashboard'
    ]
  });
});

// ════════════════════════════════════════════════════════════════════════════
// START SERVER
// ════════════════════════════════════════════════════════════════════════════
app.listen(PORT, () => {
  console.log(`✅ Server online on port ${PORT}`);
  console.log(`✅ Test: curl http://localhost:${PORT}/api/watson/health`);
  console.log('');
});

