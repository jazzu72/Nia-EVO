#!/bin/bash

echo "🔧 Starting full system repair..."

# ─── 1. Restart the Orchestrator ─────────────────────────────
echo "🔄 Restarting Orchestrator..."
pm2 restart orchestrator 2>/dev/null || echo "✅ Orchestrator already running"

# ─── 2. Fix Telegram 409 Conflict ────────────────────────────
echo "🤖 Fixing Telegram duplicate instances..."
pkill -f telegram-interface
pkill -f telegram-business
sleep 2
node telegram-interface.js &

# ─── 3. Verify Antigravity is running ────────────────────────
echo "🧠 Checking Antigravity..."
if pgrep -f "antigravity-proactive.py" > /dev/null; then
  echo "✅ Antigravity is running"
else
  echo "🔄 Starting Antigravity..."
  cd ~/nia-capital-os
  python antigravity-proactive.py &
fi

# ─── 4. Verify Grant Hunter is running ───────────────────────
echo "📋 Checking Grant Hunter..."
if pgrep -f "nia-grants/app.js" > /dev/null; then
  echo "✅ Grant Hunter is running"
else
  echo "🔄 Starting Grant Hunter..."
  cd ~/nia-grants
  node app.js &
fi

# ─── 5. Final status check ────────────────────────────────────
echo ""
echo "📊 Final system status:"
pm2 list

echo ""
echo "✅ Repair complete."
