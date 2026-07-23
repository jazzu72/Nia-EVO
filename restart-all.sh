#!/bin/bash

echo ""
echo "  ╔══════════════════════════════════════════════════════╗"
echo "  ║     🔄 RESTARTING NIA OS — FULL SYSTEM              ║"
echo "  ║     API · CEO · CoS · Grants · AI · Jarvis · All    ║"
echo "  ╚══════════════════════════════════════════════════════╝"
echo ""

# ─── 1. Kill all processes ──────────────────────────────────
echo "🛑 Stopping all processes..."
pm2 kill 2>/dev/null
pkill -f node 2>/dev/null
pkill -f python 2>/dev/null
pkill -f telegram-interface 2>/dev/null
sleep 2

# ─── 2. Start core PM2 services ─────────────────────────────
echo "🚀 Starting core services..."
cd ~/nia-capital-os
pm2 start app.js --name nia --log logs/nia.log
pm2 start NIA-CEO/autonomous.js --name ceo --log logs/ceo.log
pm2 start NIA-CEO/chief-of-staff.js --name cos --log logs/cos.log
pm2 start NIA_GRANTS_AUTONOMOUS.js --name grants -- run --log logs/grants.log
pm2 start NIA-CEO/ai-negotiator.js --name ai-negotiator --log logs/ai-negotiator.log
pm2 start orchestrator.js --name orchestrator --log logs/orchestrator.log
pm2 start watcher.js --name watcher --log logs/watcher.log
pm2 start modules/career/career-engine.js --name career --log logs/career.log
pm2 start telegram-interface.js --name jarvis --log logs/jarvis.log

# ─── 3. Start Antigravity and Grant Hunter ──────────────────
echo "🧠 Starting Antigravity..."
cd ~/nia-capital-os
nohup python antigravity-bridge.py > /dev/null 2>&1 &

echo "📋 Starting Grant Hunter..."
cd ~/nia-grants
nohup node app.js > /dev/null 2>&1 &

# ─── 4. Save PM2 state ──────────────────────────────────────
pm2 save

# ─── 5. Show status ─────────────────────────────────────────
echo ""
echo "📊 Final system status:"
pm2 list
echo ""
echo "✅ System restarted. All services online."
