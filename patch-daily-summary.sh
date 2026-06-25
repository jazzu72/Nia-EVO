#!/data/data/com.termux/files/usr/bin/bash
set -e

SERVER="$HOME/nia-capital-os/server.js"

echo "🔧 Patching Daily Summary Engine into server.js..."

# 1. Ensure server.js exists
if [ ! -f "$SERVER" ]; then
  echo "❌ server.js not found at $SERVER"
  exit 1
fi

# 2. Backup
cp "$SERVER" "$SERVER.bak.daily"
echo "📁 Backup created: server.js.bak.daily"

# 3. Add daily summary function if missing
if ! grep -q "generateDailySummary" "$SERVER"; then
  echo "🔧 Injecting daily summary generator..."

  cat >> "$SERVER" << 'EOP'

/* --- NIA‑EVO DAILY SUMMARY ENGINE (AUTO‑PATCHED) --- */
function generateDailySummary(deals) {
  try {
    const total = deals.length;
    const highScore = deals.filter(d => d.score >= 80).length;
    const distressed = deals.filter(d => d.tags?.includes("distressed")).length;
    const underMarket = deals.filter(d => d.tags?.includes("under_market")).length;

    const summary = `
📊 DAILY DEAL SUMMARY — NIA‑EVO
---------------------------------------
Total Deals: ${total}
High‑Score Deals (80+): ${highScore}
Distressed Deals: ${distressed}
Under‑Market Deals: ${underMarket}

Top Opportunities:
${deals
  .sort((a, b) => b.score - a.score)
  .slice(0, 5)
  .map(d => `• ${d.title} — Score ${d.score}`)
  .join("\n")}
---------------------------------------
Generated: ${new Date().toLocaleString()}
`;

    return summary;
  } catch (err) {
    console.error("Daily summary error:", err);
    return "Summary unavailable.";
  }
}
EOP

  echo "✅ Daily summary function added."
else
  echo "✔️ Daily summary function already present."
fi

# 4. Add pipeline hook if missing
if ! grep -q "runDailySummary" "$SERVER"; then
  echo "🔧 Injecting daily summary pipeline hook..."

  cat >> "$SERVER" << 'EOP'

/* --- NIA‑EVO DAILY SUMMARY PIPELINE (AUTO‑PATCHED) --- */
async function runDailySummary(deals) {
  console.log("🗒️ Generating daily summary...");
  const summary = generateDailySummary(deals);
  console.log(summary);
  return summary;
}
EOP

  echo "✅ Daily summary pipeline hook added."
else
  echo "✔️ Daily summary pipeline hook already present."
fi

echo "🎉 Daily summary patch complete."
echo "   Restart with: cd ~/nia-capital-os && node server.js"
