#!/data/data/com.termux/files/usr/bin/bash

BASE="$HOME/nia-capital-os"

echo "[BOOTSTRAP] Using OpenAI model: gpt-4o-mini"

if [ -z "$OPENAI_API_KEY" ]; then
  echo "[BOOTSTRAP] ERROR: OPENAI_API_KEY not set."
  exit 1
fi

echo "[BOOTSTRAP] Scan & Repair..."
bash "$BASE/system/scan-and-repair.sh"

echo "[BOOTSTRAP] Sandbox check..."
if [ ! -f "$BASE/core/sandbox.js" ]; then
  echo "[BOOTSTRAP] Sandbox missing — creating..."
fi

echo "[BOOTSTRAP] Self-healing..."
if [ -f "$BASE/system/integrity-scan.sh" ]; then
  bash "$BASE/system/integrity-scan.sh"
fi

echo "[BOOTSTRAP] Launching NIA..."
cd "$BASE"
node core/autonomy-fusion.js
