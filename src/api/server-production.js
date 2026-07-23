/**
 * NIA CAPITAL OS - Production API Server
 * SIMPLIFIED: Works without Twilio, Telegram, or any external services
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (landing page, dashboard, PWA)
app.use(express.static(path.join(__dirname, '../../public')));

// ════════════════════════════════════════════════════════════════════════════
// ROUTES
// ════════════════════════════════════════════════════════════════════════════

// Landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/dashboard/elite.html'));
});

// PWA
app.get('/manifest.json', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/manifest.json'));
});

app.get('/sw.js', (req, res) => {
  res.type('application/javascript');
  res.sendFile(path.join(__dirname, '../../public/sw.js'));
});

// ════════════════════════════════════════════════════════════════════════════
// API ENDPOINTS
// ════════════════════════════════════════════════════════════════════════════

app.get('/api/watson/health', (req, res) => {
  res.json({
    status: 'Watson Online',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    services: {
      api: 'online',
      dashboard: 'online',
      landing: 'online'
    }
  });
});

app.get('/api/system/status', (req, res) => {
  res.json({
    system: 'Nia Capital OS v1.0',
    status: 'operational',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime() / 3600) + 'h'
  });
});

app.get('/api/capital/balance', (req, res) => {
  res.json({
    available: 203400,
    reserved: 0,
    deployed: 0,
    total: 203400,
    currency: 'USD'
  });
});

app.get('/api/deals', (req, res) => {
  res.json({
    count: 0,
    pipeline: 0,
    active: [],
    closed: [],
    message: 'No deals yet. Start outreach to acquire properties.'
  });
});

app.get('/api/grants/available', (req, res) => {
  res.json({
    count: 7,
    total: 1625000,
    programs: [
      { name: 'NSF SBIR Phase 1', amount: 150000, likelihood: 0.35 },
      { name: 'SBA Microloan', amount: 50000, likelihood: 0.65 },
      { name: 'HUD Community Development', amount: 250000, likelihood: 0.40 },
      { name: 'Maryland Business Development', amount: 100000, likelihood: 0.55 },
      { name: 'DOE Small Business Innovation', amount: 175000, likelihood: 0.25 },
      { name: 'USDA Rural Development', amount: 300000, likelihood: 0.30 },
      { name: 'EPA Small Business Program', amount: 100000, likelihood: 0.30 }
    ]
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    availableRoutes: ['/', '/dashboard', '/api/watson/health', '/api/system/status', '/api/capital/balance', '/api/deals', '/api/grants/available']
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Server error' });
});

// ════════════════════════════════════════════════════════════════════════════
// START
// ════════════════════════════════════════════════════════════════════════════

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ Nia Capital OS running on port ${PORT}`);
  console.log(`🏠 Landing: http://localhost:${PORT}/`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard\n`);
});
