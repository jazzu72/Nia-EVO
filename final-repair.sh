#!/bin/bash

echo ""
echo "  ╔══════════════════════════════════════════════════════╗"
echo "  ║     🔧 FINAL REPAIR — NIA OS                       ║"
echo "  ║     Rebuilding app.js · Fixing 0.0.0.0 bind        ║"
echo "  ╚══════════════════════════════════════════════════════╝"
echo ""

# ─── 1. Kill all processes ──────────────────────────────────
echo "🛑 Stopping all processes..."
pm2 kill
pkill -f antigravity
pkill -f telegram
sleep 2

# ─── 2. Rebuild app.js with proper binding ──────────────────
echo "📄 Rebuilding app.js..."
cat > app.js << 'EOF'
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── Health check ────────────────────────────────────────────
app.get('/health', (req, res) => {
  console.log('✅ Health check hit');
  res.json({ status: 'healthy', uptime: process.uptime() });
});

// ─── Business OS ─────────────────────────────────────────────
try {
  const businessRoutes = require('./modules/business/routes');
  app.use('/api/business', businessRoutes);
  console.log('✅ Business OS loaded');
} catch (err) {
  console.warn('⚠️ Business OS not loaded:', err.message);
}

// ─── Default route ───────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// ─── Start server ────────────────────────────────────────────
app.listen(PORT, HOST, () => {
  console.log(`🏰 Nia OS running on http://${HOST}:${PORT}`);
  console.log(`✅ Server is listening on port ${PORT}`);
});
