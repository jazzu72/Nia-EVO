#!/data/data/com.termux/files/usr/bin/bash
set -e

SERVER="$HOME/nia-capital-os/server.js"

echo "🔧 Patching auto‑dedupe into server.js..."

# 1. Ensure server.js exists
if [ ! -f "$SERVER" ]; then
  echo "❌ server.js not found at $SERVER"
  exit 1
fi

# 2. Backup
cp "$SERVER" "$SERVER.bak.dedupe"
echo "📁 Backup created: server.js.bak.dedupe"

# 3. Add hashDeal import if missing
if ! grep -q "hashDeal" "$SERVER"; then
  echo "🔧 Adding hashDeal import..."
  echo "import { hashDeal } from './deal-scoring.js';" | cat - "$SERVER" > "$SERVER.tmp" && mv "$SERVER.tmp" "$SERVER"
  echo "✅ hashDeal import added."
else
  echo "✔️ hashDeal import already present."
fi

# 4. Add dedupe function if missing
if ! grep -q "dedupeDeals" "$SERVER"; then
  echo "🔧 Injecting dedupe function..."

  cat >> "$SERVER" << 'EOP'

/* --- NIA‑EVO AUTO‑DEDUPE (AUTO‑PATCHED) --- */
function dedupeDeals(deals) {
  try {
    const seen = new Set();
    const unique = [];

    for (const d of deals) {
      const h = hashDeal(d);
      if (!seen.has(h)) {
        seen.add(h);
        unique.push(d);
      }
    }

    return unique;
  } catch (err) {
    console.error("Dedupe error:", err);
    return deals;
  }
}
EOP

  echo "✅ Dedupe function added."
else
  echo "✔️ Dedupe function already present."
fi

# 5. Add dedupe call in pipeline if missing
if ! grep -q "dedupeDeals" "$SERVER"; then
  echo "🔧 Injecting dedupe call into pipeline..."

  cat >> "$SERVER" << 'EOP'

/* --- NIA‑EVO PIPELINE DEDUPE CALL (AUTO‑PATCHED) --- */
async function applyDedupe(allDeals) {
  console.log("🧹 Removing duplicate deals...");
  return dedupeDeals(allDeals);
}
EOP

  echo "✅ Dedupe call added."
else
  echo "✔️ Dedupe call already present."
fi

echo "🎉 Auto‑dedupe patch complete."
echo "   Restart with: cd ~/nia-capital-os && node server.js"
