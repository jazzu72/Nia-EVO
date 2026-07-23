#!/bin/bash

echo "📊 Nia-Capital-OS Service Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check each service
if pgrep -f "node src/api/server.js" > /dev/null; then
  echo "✅ API Server: Running"
else
  echo "❌ API Server: Stopped"
fi

if pgrep -f "node NIA-CEO/autonomous.js" > /dev/null; then
  echo "✅ Autonomous CEO: Running"
else
  echo "❌ Autonomous CEO: Stopped"
fi

if pgrep -f "node src/telegram/bot.js" > /dev/null; then
  echo "✅ Telegram Bot: Running"
else
  echo "❌ Telegram Bot: Stopped"
fi

if pgrep -f "node NIA_GRANTS_AUTONOMOUS.js" > /dev/null; then
  echo "✅ Grant Engine: Running"
else
  echo "❌ Grant Engine: Stopped"
fi

if pgrep -f "node src/autonomous/applications.js" > /dev/null; then
  echo "✅ Applications: Running"
else
  echo "❌ Applications: Stopped"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
