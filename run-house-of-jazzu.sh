#!/bin/bash

echo ""
echo "  ╔══════════════════════════════════════════════════════╗"
echo "  ║     🏰 HOUSE OF JAZZU — PEAK PERFORMANCE            ║"
echo "  ║     CEO · AI · Revenue · Dashboard · Full System     ║"
echo "  ╚══════════════════════════════════════════════════════╝"
echo ""

# ─── 1. Kill any stale processes ────────────────────────────
echo "🛑 Clearing stale processes..."
pm2 kill 2>/dev/null
pkill -f node 2>/dev/null
pkill -f vite 2>/dev/null
sleep 2

# ─── 2. Start all backend services ──────────────────────────
echo "🚀 Starting backend services..."

pm2 start src/api/server.js --name api --log logs/api.log
pm2 start NIA-CEO/autonomous.js --name ceo --log logs/ceo.log
pm2 start NIA-CEO/chief-of-staff.js --name cos --log logs/cos.log
pm2 start NIA_GRANTS_AUTONOMOUS.js --name grants -- run --log logs/grants.log
pm2 start reply-parser.js --name ai-negotiator --log logs/ai-negotiator.log
pm2 start orchestrator.js --name orchestrator --log logs/orchestrator.log
pm2 start watcher.js --name watcher --log logs/watcher.log
pm2 save

# ─── 3. Start the frontend ──────────────────────────────────
echo "🎨 Starting frontend..."
cd frontend
nohup npm run dev > ../logs/frontend.log 2>&1 &
cd ..

# ─── 4. Show live status ────────────────────────────────────
echo ""
echo "  ╔══════════════════════════════════════════════════════╗"
echo "  ║     ✅ HOUSE OF JAZZU — PEAK PERFORMANCE            ║"
echo "  ║     All services online · Revenue engine active     ║"
echo "  ╚══════════════════════════════════════════════════════╝"
echo ""
pm2 list

echo ""
echo "📡 Live monitoring:"
echo "  pm2 logs api"
echo "  pm2 logs ceo"
echo ""
echo "📊 Dashboard: http://localhost:3000"
echo "🖥️  Frontend:  http://localhost:5173 (or 5174/5175)"
echo ""
echo "💰 Revenue engine online. Sellers are waiting."
echo "Let her run."
echo ""
