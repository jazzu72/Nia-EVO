#!/bin/bash

echo ""
echo "  ╔══════════════════════════════════════════════════════╗"
echo "  ║     🚀 STARTING NIA ECOSYSTEM — ALL PORTS          ║"
echo "  ║     Nia:3000 · MuseForge:4000 · MoneyMunchkins:5000 ║"
echo "  ╚══════════════════════════════════════════════════════╝"
echo ""

pkill -f "node.*server.js" 2>/dev/null
pkill -f "flask" 2>/dev/null
pkill -f "flutter" 2>/dev/null
sleep 2

if [ -f "src/api/server.js" ]; then
  pm2 start src/api/server.js --name nia-api --log logs/nia.log
else
  echo "⚠️  src/api/server.js not found. Skipping Nia."
fi

if [ -d "museforge_deploy" ]; then
  cd museforge_deploy
  sed -i 's/port=5000/port=4000/g' museforge_backend_webhook.py 2>/dev/null
  python museforge_backend_webhook.py &
  cd ..
else
  echo "⚠️  museforge_deploy not found. Skipping MuseForge."
fi

# ─── Money Munchkins (Port 5000) ────────────────────────────
echo "🪙 Starting Money Munchkins (port 5000)..."
if [ -d "MoneyMunchkin/web" ]; then
  serve -s MoneyMunchkin/web -l 5000 &
else
  echo "⚠️  MoneyMunchkin/web not found. Skipping."
fi
