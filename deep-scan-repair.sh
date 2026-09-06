#!/bin/bash

echo ""
echo "  ╔══════════════════════════════════════════════════════╗"
echo "  ║     🔍 DEEP SCAN & REPAIR — NIA CAPITAL OS         ║"
echo "  ║     Checks everything. Fixes everything.           ║"
echo "  ╚══════════════════════════════════════════════════════╝"
echo ""

cd ~/nia-capital-os

# ─── 1. Check critical files ─────────────────────────────────
echo "📁 Checking critical files..."
MISSING=0

for file in app.js orchestrator.js telegram-interface.js NIA-CEO/autonomous.js gov-submitter.js; do
  if [ ! -f "$file" ]; then
    echo "❌ Missing: $file"
    MISSING=1
  else
    echo "✅ Found: $file"
  fi
done

if [ $MISSING -eq 1 ]; then
  echo "⚠️ Some files are missing. Run the build script to restore them."
fi

# ─── 2. Check PM2 services ──────────────────────────────────
echo ""
echo "📊 Checking PM2 services..."
pm2 list | grep -E "errored|stopped" && echo "⚠️ Some services are down." || echo "✅ All services appear online."

# ─── 3. Check dependencies ──────────────────────────────────
echo ""
echo "📦 Checking dependencies..."
for pkg in express telegraf rss-parser pdf-lib twilio; do
  if npm list $pkg 2>/dev/null | grep -q $pkg; then
    echo "✅ $pkg installed"
  else
    echo "❌ $pkg missing — installing..."
    npm install $pkg --silent
  fi
done

# ─── 4. Check environment variables ─────────────────────────
echo ""
echo "🔑 Checking .env file..."
if [ -f .env ]; then
  echo "✅ .env exists"
  grep -q "OPENAI_API_KEY" .env && echo "✅ OPENAI_API_KEY set" || echo "⚠️ OPENAI_API_KEY missing"
  grep -q "TELEGRAM_BOT_TOKEN" .env && echo "✅ TELEGRAM_BOT_TOKEN set" || echo "⚠️ TELEGRAM_BOT_TOKEN missing"
else
  echo "❌ .env missing — creating from template..."
  cp .env.example .env 2>/dev/null || echo "⚠️ No .env.example found."
fi

# ─── 5. Check grant engine files ─────────────────────────────
echo ""
echo "📋 Checking grant engine..."
if [ -f ~/nia-grants/app.js ]; then
  echo "✅ Grant hunter app.js exists"
else
  echo "❌ Grant hunter app.js missing — skipping."
fi

# ─── 6. Check revenue data files ────────────────────────────
echo ""
echo "💰 Checking revenue data..."
for f in data/revenue-pipeline.json data/leads/qualified-leads.json; do
  if [ -f "$f" ]; then
    echo "✅ $f exists"
  else
    echo "❌ $f missing"
  fi
done

# ─── 7. Restart any errored services ────────────────────────
echo ""
echo "🔄 Restarting errored services..."
pm2 list | grep errored | awk '{print $2}' | xargs -r pm2 restart

# ─── 8. Save PM2 state ──────────────────────────────────────
pm2 save

echo ""
echo "  ╔══════════════════════════════════════════════════════╗"
echo "  ║     ✅ SCAN & REPAIR COMPLETE                       ║"
echo "  ║     Check logs for any remaining issues.            ║"
echo "  ╚══════════════════════════════════════════════════════╝"
echo ""
