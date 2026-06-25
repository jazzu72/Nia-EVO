#!/data/data/com.termux/files/usr/bin/bash
set -e

SERVER="$HOME/nia-capital-os/server.js"

echo "🔧 Patching ingestion loop in server.js..."

# 1. Ensure server.js exists
if [ ! -f "$SERVER" ]; then
  echo "❌ server.js not found at $SERVER"
  exit 1
fi

# 2. Backup
cp "$SERVER" "$SERVER.bak.ingestion"
echo "📁 Backup created: server.js.bak.ingestion"

# 3. Check if ingestion block already exists
if grep -q "fetchAllRSS" "$SERVER"; then
  echo "✔️ Ingestion block already present. No changes made."
  exit 0
fi

echo "🔧 Injecting ingestion pipeline..."

cat >> "$SERVER" << 'EOP'

/* --- NIA‑EVO INGESTION PIPELINE (AUTO‑PATCHED) --- */
async function ingestDeals() {
  try {
    console.log("📡 Fetching RSS deals...");
    const rssDeals = await fetchAllRSS();

    console.log("🧮 Applying scoring...");
    const scored = rssDeals.map(d => scoreDeal(d));

    return scored;
  } catch (err) {
    console.error("Ingestion error:", err);
    return [];
  }
}
EOP

echo "✅ Ingestion pipeline added."

echo "🎉 Patch complete. Restart with:"
echo "   cd ~/nia-capital-os && node server.js"
