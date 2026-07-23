#!/bin/bash

echo ""
echo "  ╔══════════════════════════════════════════════════════╗"
echo "  ║     🚀 STARTING NIA ECOSYSTEM — ALL PORTS          ║"
echo "  ║     Nia:3000 · MuseForge:4000 · MoneyMunchkins:5000 ║"
echo "  ╚══════════════════════════════════════════════════════╝"
echo ""

# ─── Nia Capital OS (Port 3000) ─────────────────────────────
echo "📡 Starting Nia (port 3000)..."
pm2 start src/api/server.js --name nia-api --log logs/nia.log

# ─── MuseForge Backend (Port 4000) ──────────────────────────
echo "🎵 Starting MuseForge (port 4000)..."
cd museforge_deploy
flask run --host=0.0.0.0 --port=4000 &
cd ..

# ─── Money Munchkins (Port 5000) ────────────────────────────
echo "🪙 Starting Money Munchkins (port 5000)..."
cd MoneyMunchkin
flutter run -d web-server --web-port=5000 &
cd ..

echo ""
echo "  ╔══════════════════════════════════════════════════════╗"
echo "  ║     ✅ ECOSYSTEM ONLINE                             ║"
echo "  ║     Nia: http://localhost:3000                      ║"
echo "  ║     MuseForge: http://localhost:4000                ║"
echo "  ║     MoneyMunchkins: http://localhost:5000           ║"
echo "  ╚══════════════════════════════════════════════════════╝"
echo ""
