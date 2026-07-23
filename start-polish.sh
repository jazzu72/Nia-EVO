#!/bin/bash

echo ""
echo "  ╔══════════════════════════════════════════════════════╗"
echo "  ║     🎨 POLISH — QUANTUM INSTAGRAM                   ║"
echo "  ║     Disney-Level Graphics · AI Effects · MuseSync   ║"
echo "  ╚══════════════════════════════════════════════════════╝"
echo ""

export POLISH_KEY=$(openssl rand -hex 32)
echo "🔐 Visual Vault key generated"

nohup node PolishOS/studio/quantum-studio.js > logs/polish-studio.log 2>&1 &
nohup node PolishOS/engine/disney-engine.js > logs/polish-engine.log 2>&1 &
nohup node PolishOS/core/post-pro.js > logs/polish-postpro.log 2>&1 &

echo ""
echo "  ╔══════════════════════════════════════════════════════╗"
echo "  ║     🎨 Polish is now fully operational              ║"
echo "  ║     Quantum Instagram is live.                      ║"
echo "  ╚══════════════════════════════════════════════════════╝"
echo ""
