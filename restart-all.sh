#!/bin/bash

echo ""
echo "  ╔══════════════════════════════════════════════════════╗"
echo "  ║     🔄 RESTARTING ALL SERVICES                      ║"
echo "  ║     CEO · Grants · Jarvis · Orchestrator            ║"
echo "  ╚══════════════════════════════════════════════════════╝"
echo ""

cd ~/nia-capital-os

# Kill any stale processes
pm2 kill 2>/dev/null
pkill -f node 2>/dev/null
pkill -f python 2>/dev/null
sleep 2

# Start core services
pm2 start app.js --name nia --log logs/nia.log
pm2 start NIA-CEO/autonomous.js --name ceo --log logs/ceo.log
pm2 start orchestrator.js --name orchestrator --log logs/orchestrator.log
pm2 start telegram-interface.js --name jarvis --log logs/jarvis.log

# Start grants engine
cd ~/nia-grants
pm2 start app.js --name grants --log logs/grants.log

# Save PM2 state
pm2 save

echo ""
echo "✅ All services restarted."
echo "📊 Check status: pm2 list"
echo "📱 Telegram: Send /start to your bot"
echo "💰 Revenue engine active."
