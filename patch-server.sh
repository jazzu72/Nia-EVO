#!/data/data/com.termux/files/usr/bin/bash
set -e

SERVER="$HOME/nia-capital-os/server.js"

echo "🔧 Patching server.js safely..."

# 1. Ensure server.js exists
if [ ! -f "$SERVER" ]; then
  echo "❌ server.js not found at $SERVER"
  exit 1
fi

# 2. Backup
cp "$SERVER" "$SERVER.bak"
echo "📁 Backup created: server.js.bak"

# 3. Add imports if missing
add_import() {
  local import_line="$1"
  if ! grep -q "$import_line" "$SERVER"; then
    echo "$import_line" | cat - "$SERVER" > "$SERVER.tmp" && mv "$SERVER.tmp" "$SERVER"
    echo "✅ Added import: $import_line"
  else
    echo "✔️ Import already present: $import_line"
  fi
}

add_import "import { fetchAllRSS } from './rss-engine.js';"
add_import "import { fetchCraigslistDeals } from './craigslist-deals.js';"
add_import "import { scoreDeal } from './deal-scoring.js';"

# 4. Add ingestion scoring block if missing
if ! grep -q "scoreDeal" "$SERVER"; then
  echo "🔧 Injecting scoring pipeline..."

  cat >> "$SERVER" << 'EOP'

/* --- NIA‑EVO DEAL SCORING PIPELINE (AUTO‑PATCHED) --- */
async function applyDealScoring(allDeals) {
  try {
    allDeals = allDeals.map(d => scoreDeal(d));
    return allDeals;
  } catch (err) {
    console.error("Scoring error:", err);
    return allDeals;
  }
}
EOP

  echo "✅ Scoring pipeline added."
else
  echo "✔️ Scoring pipeline already present."
fi

echo "🎉 Patch complete. Restart with:"
echo "   cd ~/nia-capital-os && node server.js"
