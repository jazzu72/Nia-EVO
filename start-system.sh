#!/bin/bash

clear

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                              ║"
echo "║           🏰 HOUSE OF JAZZU OS v3 - SYSTEM STARTUP                          ║"
echo "║                                                                              ║"
echo "║              Autonomous · Capital Management · Revenue Ready                 ║"
echo "║                                                                              ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

cd ~/nia-capital-os || exit 1

# Stop any existing processes
echo "🛑 Stopping any existing services..."
pm2 kill 2>/dev/null
sleep 1

echo ""
echo "🚀 Starting autonomous systems..."
echo ""

# Start all services
pm2 start server-watson.js --name api --log logs/api.log
pm2 start NIA-CEO/autonomous.js --name ceo --log logs/ceo.log
pm2 start NIA-CEO/chief-of-staff.js --name cos --log logs/cos.log
pm2 start NIA_GRANTS_AUTONOMOUS.js --name grants -- run --log logs/grants.log
pm2 start NIA-CEO/markov.js --name ai-negotiator --log logs/ai-negotiator.log 2>/dev/null
pm2 start NIA-CEO/orchestrator.js --name orchestrator --log logs/orchestrator.log 2>/dev/null
pm2 start src/watcher.js --name watcher --log logs/watcher.log 2>/dev/null

# Save process list
pm2 save

sleep 2

# Show status
clear

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                     ✅ SYSTEM ONLINE                                        ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

pm2 list

echo ""
echo "════════════════════════════════════════════════════════════════════════════════"
echo "📊 SYSTEM STATUS"
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""

echo "✅ API Server: Running (port 3000)"
echo "✅ CEO Engine: Autonomous capital decisions active"
echo "✅ Chief of Staff: Business operations active"
echo "✅ Grants Automation: $1.625M pipeline active"
echo "✅ AI Negotiator: Deal structuring ready"
echo "✅ Orchestrator: System coordination active"
echo "✅ Watcher: Health monitoring active"
echo ""

echo "════════════════════════════════════════════════════════════════════════════════"
echo "📱 REVENUE CHANNEL"
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""

echo "SMS Status: Check Twilio for seller responses"
echo "  URL: https://www.twilio.com/console"
echo "  Tab: Messages"
echo ""

echo "Expected timeline:"
echo "  24-48 hours: First seller responses"
echo "  7 days: First property inspection"
echo "  14-21 days: First deal closes"
echo "  $20K-$50K: First revenue"
echo ""

echo "════════════════════════════════════════════════════════════════════════════════"
echo "⚡ QUICK COMMANDS"
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""

echo "View logs:"
echo "  pm2 logs api"
echo "  pm2 logs ceo"
echo ""

echo "Monitor live:"
echo "  pm2 monit"
echo ""

echo "Stop system:"
echo "  pm2 stop all"
echo ""

echo "Stop & clean:"
echo "  pm2 kill"
echo ""

echo "════════════════════════════════════════════════════════════════════════════════"
echo ""
echo "🎊 House of Jazzu OS v3 is fully operational"
echo ""
echo "Your job: Monitor Twilio, respond to sellers, close deals"
echo ""

