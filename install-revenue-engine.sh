#!/bin/bash

echo ""
echo "  ╔══════════════════════════════════════════════════════╗"
echo "  ║     💰 INSTALLING REVENUE ENGINE                    ║"
echo "  ║     Tracking · Forecasting · Alerting               ║"
echo "  ╚══════════════════════════════════════════════════════╝"
echo ""

# ─── 1. Create Revenue Engine Module ────────────────────────
echo "💰 Creating Revenue Engine..."
cat > revenue-engine.js << 'EOF'
const fs = require('fs');
const { exec } = require('child_process');
const { loadMemory, saveMemory } = require('./brain-core.js');

const LOG_FILE = './logs/revenue.log';
const TARGET_WEEKLY = 5000;
const TARGET_MONTHLY = 20000;

function log(message) {
  const entry = `[${new Date().toISOString()}] ${message}`;
  console.log(`💰 Revenue: ${message}`);
  fs.appendFileSync(LOG_FILE, entry + '\n');
}

function trackRevenue(amount, source) {
  const mem = loadMemory();
  mem.stats = mem.stats || { revenue: 0, deals: 0, sources: {} };
  mem.stats.revenue += amount;
  mem.stats.sources[source] = (mem.stats.sources[source] || 0) + amount;
  saveMemory(mem);
  log(`💵 +$${amount} from ${source}. Total: $${mem.stats.revenue}`);
}

function trackDeal(phone, price) {
  const mem = loadMemory();
  mem.stats = mem.stats || { deals: 0, revenue: 0 };
  mem.stats.deals += 1;
  mem.stats.revenue += price;
  saveMemory(mem);
  log(`🤝 Deal closed: ${phone} for $${price}`);
}

function getForecast(days = 30) {
  const mem = loadMemory();
  const stats = mem.stats || { revenue: 0, deals: 0 };
  const avgDeal = stats.deals > 0 ? stats.revenue / stats.deals : 85000;
  const dealsPerWeek = stats.deals / (7 * (stats.activeDays || 1));
  const projected = dealsPerWeek * 4 * avgDeal;

  return {
    revenue: stats.revenue,
    deals: stats.deals,
    avgDeal,
    dealsPerWeek,
    projectedMonthly: projected,
    target: TARGET_MONTHLY,
    shortfall: Math.max(0, TARGET_MONTHLY - projected)
  };
}

function checkAlerts() {
  const forecast = getForecast();
  if (forecast.shortfall > 0) {
    log(`⚠️  Shortfall alert: $${forecast.shortfall} below target`);
    exec(`./notify.sh "⚠️ Revenue shortfall: $${forecast.shortfall}"`);
  }
  return forecast;
}

function adjustStrategy() {
  const forecast = getForecast();
  if (forecast.deals < 2) {
    log('📈 Strategy: Increase SMS volume by 2x');
    return 'Increase SMS volume';
  }
  if (forecast.avgDeal < 50000) {
    log('📈 Strategy: Target higher‑value properties');
    return 'Target higher‑value properties';
  }
  return 'Maintain current strategy';
}

module.exports = {
  trackRevenue,
  trackDeal,
  getForecast,
  checkAlerts,
  adjustStrategy
};
