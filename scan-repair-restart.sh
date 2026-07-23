#!/bin/bash

echo ""
echo "  ╔══════════════════════════════════════════════════════╗"
echo "  ║     🔧 SCAN · REPAIR · RESTART                     ║"
echo "  ║     One command. Full system. Clean slate.         ║"
echo "  ╚══════════════════════════════════════════════════════╝"
echo ""

# ─── 1. SCAN: Check all services ────────────────────────────
echo "🔍 Scanning system..."
pm2 list | grep -E "online|errored|stopped" || echo "⚠️ No PM2 services found"

# ─── 2. REPAIR: Kill stale processes ────────────────────────
echo "🧹 Cleaning up stale processes..."
pkill -f telegram-interface 2>/dev/null
pkill -f node 2>/dev/null
pm2 kill 2>/dev/null

# ─── 3. RESTART: Core services ──────────────────────────────
echo "🚀 Starting core services..."
pm2 start app.js --name nia --log logs/nia.log
pm2 start NIA-CEO/autonomous.js --name ceo --log logs/ceo.log
pm2 start NIA-CEO/chief-of-staff.js --name cos --log logs/cos.log
pm2 start NIA_GRANTS_AUTONOMOUS.js --name grants -- run --log logs/grants.log
pm2 start NIA-CEO/ai-negotiator.js --name ai-negotiator --log logs/ai-negotiator.log
pm2 start orchestrator.js --name orchestrator --log logs/orchestrator.log
pm2 start watcher.js --name watcher --log logs/watcher.log
pm2 start modules/career/career-engine.js --name career --log logs/career.log

# ─── 4. RESTART: Telegram bot ────────────────────────────────
echo "🤖 Starting Telegram bot..."
nohup node telegram-interface.js > /dev/null 2>&1 &

# ─── 5. RESTART: Antigravity ─────────────────────────────────
echo "🧠 Starting Antigravity..."
nohup python antigravity-bridge.py > /dev/null 2>&1 &

# ─── 6. Final status ──────────────────────────────────────────
pm2 save

echo ""
echo "📊 Final system status:"
pm2 list
echo ""
echo "✅ System scanned, repaired, and restarted."
