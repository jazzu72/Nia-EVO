#!/bin/bash

echo ""
echo "  ╔══════════════════════════════════════════════════════╗"
echo "  ║     🎵 MUSE FORGE OS — FULLY LOADED                 ║"
echo "  ║     Quantum Music Creator · AI Composer · NFT       ║"
echo "  ╚══════════════════════════════════════════════════════╝"
echo ""

export MUSEFORGE_KEY=$(openssl rand -hex 32)
echo "🔐 Music Vault key generated"

nohup node MuseForgeOS/autonomous-producer.js > logs/museforge.log 2>&1 &

echo ""
echo "  ╔══════════════════════════════════════════════════════╗"
echo "  ║     🎵 MuseForge OS is now fully operational        ║"
echo "  ║     She composes. She produces. She releases.       ║"
echo "  ╚══════════════════════════════════════════════════════╝"
echo ""
