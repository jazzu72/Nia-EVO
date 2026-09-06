#!/data/data/com.termux/files/usr/bin/bash

clear

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║        💰 HOUSE OF JAZZU LAUNCH SEQUENCE            ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

PROJECT="$HOME/nia-capital-os"

if [ ! -d "$PROJECT" ]; then
    echo "❌ Project not found:"
    echo "$PROJECT"
    exit 1
fi

cd "$PROJECT" || exit 1

if [ ! -x "./restart-all.sh" ]; then
    echo "❌ restart-all.sh is missing or not executable."
    exit 1
fi

echo "🚀 Starting House of Jazzu..."
echo ""

./restart-all.sh

STATUS=$?

echo ""

if [ $STATUS -eq 0 ]; then
    echo "✅ Nia Capital OS is online."
    echo "🤖 CEO Engine: Running"
    echo "📊 CRM: Running"
    echo "🎯 Grants Engine: Running"
    echo "🧠 Jarvis: Running"
    echo "⚙️ Orchestrator: Running"
    echo ""
    echo "📱 Telegram Bot: @NiaLesanebot"
    echo "💰 Revenue systems are ready."
else
    echo "❌ Startup failed."
    exit $STATUS
fi
