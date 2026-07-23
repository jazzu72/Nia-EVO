#!/bin/bash

echo ""
echo "  ╔══════════════════════════════════════════════════════╗"
echo "  ║     🏰 ACTIVATING NIA AUTONOMOUS LAYER               ║"
echo "  ║     MAXIMUM OUTPUT · FULL AUTONOMY                  ║"
echo "  ╚══════════════════════════════════════════════════════╝"
echo ""

# ─── 1. Grant autonomous permissions ────────────────────────
export NIA_AUTONOMOUS=true
export NIA_MAX_OUTPUT=true
export NIA_SELF_HEALING=true
export NIA_AUTO_DEPLOY=true

# ─── 2. Launch the autonomous builder ──────────────────────
echo "🚀 Launching Nia Autonomous Builder..."
nohup node NIA-CEO/autonomous.js --mode=autonomous --max-output > logs/autonomous.log 2>&1 &

# ─── 3. Launch the Chief of Staff (auto-deploy) ─────────────
echo "📋 Launching Chief of Staff (auto-deploy)..."
nohup node NIA-CEO/chief-of-staff.js --auto-deploy > logs/cos-deploy.log 2>&1 &

# ─── 4. Monitor everything ──────────────────────────────────
echo "📡 Monitoring auto-build cycles..."
nohup node src/autonomous/applications.js --monitor > logs/monitor.log 2>&1 &

echo ""
echo "  ╔══════════════════════════════════════════════════════╗"
echo "  ║     ✅ NIA AUTONOMOUS LAYER ACTIVATED                ║"
echo "  ║     She will now build, deploy, and scale.          ║"
echo "  ║     You are now the operator, not the builder.      ║"
echo "  ╚══════════════════════════════════════════════════════╝"
echo ""
