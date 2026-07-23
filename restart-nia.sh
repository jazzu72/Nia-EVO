#!/bin/bash

echo ""
echo "  ╔══════════════════════════════════════════════════════╗"
echo "  ║     🔄 RESTARTING NIA CAPITAL OS                   ║"
echo "  ║     Full system · All services · Clean start       ║"
echo "  ╚══════════════════════════════════════════════════════╝"
echo ""

# ─── 1. Stop everything ──────────────────────────────────────
echo "🛑 Stopping all processes..."
pm2 kill 2>/dev/null
pkill -f node 2>/dev/null
pkill -f jarvis 2>/dev/null
sleep 2

# ─── 2. Start core services ──────────────────────────────────
echo "🚀 Starting core services..."
cd ~/nia-capital-os
pm2 start src/api/server-production.js --name api --log logs/api.log
pm2 start NIA-CEO/autonomous.js --name ceo --log logs/ceo.log
pm2 start NIA-CEO/chief-of-staff.js --name cos --log logs/cos.log
pm2 start NIA_GRANTS_AUTONOMOUS.js --name grants -- run --log logs/grants.log
pm2 start reply-parser.js --name ai-negotiator --log logs/ai-negotiator.log
pm2 start orchestrator.js --name orchestrator --log logs/orchestrator.log
pm2 start watcher.js --name watcher --log logs/watcher.log
pm2 start modules/career/career-engine.js --name career --log logs/career.log
pm2 save

# ─── 3. Start voice layer ────────────────────────────────────
echo "🗣️ Starting Jarvis voice layer..."
node jarvis-mode.js &
node proactive-notifier.js &

# ─── 4. Show status ──────────────────────────────────────────
echo ""
echo "  ╔══════════════════════════════════════════════════════╗"
echo "  ║     ✅ SYSTEM RESTARTED                             ║"
echo "  ║     🗣️ Jarvis is listening                         ║"
echo "  ║     💰 Revenue engine is active                     ║"
echo "  ╚══════════════════════════════════════════════════════╝"
echo ""
pm2 list
