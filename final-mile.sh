#!/bin/bash

echo ""
echo "  ╔══════════════════════════════════════════════════════╗"
echo "  ║     🏁 FINAL MILE — UNSTOPPABLE NIA                 ║"
echo "  ║     Self‑Healing · SMS‑to‑Deal · Daily Summary      ║"
echo "  ╚══════════════════════════════════════════════════════╝"
echo ""

# ─── 1. Create Self‑Healing Watcher ────────────────────────
echo "🩹 Installing Self‑Healing Watcher..."
cat > watcher.js << 'EOF'
const { exec } = require('child_process');

const SERVICES = ['ceo', 'ai-negotiator', 'orchestrator'];

function restartIfDown(name) {
  exec(`pm2 list | grep ${name} | grep -q errored`, (err, stdout, stderr) => {
    if (!err) {
      console.log(`🩹 Restarting ${name}...`);
      exec(`pm2 restart ${name}`);
    }
  });
}

setInterval(() => SERVICES.forEach(restartIfDown), 30000);
