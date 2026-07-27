/**
 * NIA CAPITAL OS - Core Revenue System
 * Only what matters: Landing page, Dashboard, API endpoints
 * Single purpose: Track capital and close deals
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// ════════════════════════════════════════════════════════════════════════════
// ROUTES
// ════════════════════════════════════════════════════════════════════════════

// Landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard/elite.html'));
});

// PWA
app.get('/manifest.json', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/manifest.json'));
});

app.get('/sw.js', (req, res) => {
  res.type('application/javascript');
  res.sendFile(path.join(__dirname, '../public/sw.js'));
});

const businessRoutes = require('../../modules/business/routes');
const realestateRoutes = require('../../modules/realestate/routes');

app.use('/api/business', businessRoutes);
app.use('/api/realestate', realestateRoutes);
// ════════════════════════════════════════════════════════════════════════════

app.get('/realestate-dashboard',(req,res)=>{
res.sendFile(path.join(__dirname,'../../public/dashboard/realestate.html'));
});

// API - WHAT MATTERS FOR REVENUE
// ════════════════════════════════════════════════════════════════════════════

// System health
app.get('/api/status', (req, res) => {
  res.json({
    system: 'Nia Capital OS',
    status: 'operational',
    uptime: Math.floor(process.uptime() / 3600) + 'h',
    timestamp: new Date().toISOString()
  });
});

// Capital tracking
app.get('/api/capital', (req, res) => {
  res.json({
    available: 203400,
    deployed: 0,
    total: 203400,
    currency: 'USD'
  });
});

// Deals pipeline
app.get('/api/deals', (req, res) => {
  res.json({
    total: 0,
    closed: 0,
    pipeline: 0,
    nextDeal: null
  });
});

// Grants
app.get('/api/grants', (req, res) => {
  res.json({
    total: 1625000,
    programs: 7,
    status: 'monitoring'
  });
});

// ════════════════════════════════════════════════════════════════════════════
// ERROR HANDLERS
// ════════════════════════════════════════════════════════════════════════════

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Server error' });
});

// ════════════════════════════════════════════════════════════════════════════
// START
// ════════════════════════════════════════════════════════════════════════════

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ Nia Capital OS running on port ${PORT}`);
  console.log(`🏠 Landing: http://localhost:${PORT}/`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`💰 Capital: http://localhost:${PORT}/api/capital\n`);
});

module.exports = app;
