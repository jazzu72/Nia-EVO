#!/data/data/com.termux/files/usr/bin/bash
set -e

SERVER="$HOME/nia-capital-os/server.js"

echo "🔧 Patching Estated valuation into server.js..."

# 1. Ensure server.js exists
if [ ! -f "$SERVER" ]; then
  echo "❌ server.js not found at $SERVER"
  exit 1
fi

# 2. Backup
cp "$SERVER" "$SERVER.bak.estated"
echo "📁 Backup created: server.js.bak.estated"

# 3. Add Estated import if missing
if ! grep -q "fetchEstatedValuation" "$SERVER"; then
  echo "🔧 Adding Estated import..."
  echo "import { fetchEstatedValuation } from './estated.js';" | cat - "$SERVER" > "$SERVER.tmp" && mv "$SERVER.tmp" "$SERVER"
  echo "✅ Estated import added."
else
  echo "✔️ Estated import already present."
fi

# 4. Add valuation function if missing
if ! grep -q "applyValuation" "$SERVER"; then
  echo "🔧 Injecting valuation function..."

  cat >> "$SERVER" << 'EOP'

/* --- NIA‑EVO ESTATED VALUATION (AUTO‑PATCHED) --- */
async function applyValuation(deals) {
  console.log("🏷️ Applying Estated valuations...");

  const enriched = [];

  for (const d of deals) {
    try {
      const val = await fetchEstatedValuation(d.address || d.title || "");
      enriched.push({
        ...d,
        avm: val?.avm || null,
        lastSale: val?.lastSale || null,
        taxHistory: val?.taxHistory || null
      });
    } catch (err) {
      console.error("Estated valuation error:", err);
      enriched.push(d);
    }
  }

  return enriched;
}
EOP

  echo "✅ Valuation function added."
else
  echo "✔️ Valuation function already present."
fi

# 5. Add valuation call into pipeline if missing
if ! grep -q "applyValuation" "$SERVER"; then
  echo "🔧 Injecting valuation call into pipeline..."

  cat >> "$SERVER" << 'EOP'

/* --- NIA‑EVO PIPELINE VALUATION CALL (AUTO‑PATCHED) --- */
async function runValuationPipeline(allDeals) {
  return await applyValuation(allDeals);
}
EOP

  echo "✅ Valuation pipeline call added."
else
  echo "✔️ Valuation pipeline call already present."
fi

echo "🎉 Estated valuation patch complete."
echo "   Restart with: cd ~/nia-capital-os && node server.js"
