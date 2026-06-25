#!/data/data/com.termux/files/usr/bin/bash
set -e

SERVER="$HOME/nia-capital-os/server.js"

echo "🔧 Patching NIA‑EVO Pipeline Orchestrator into server.js..."

# 1. Ensure server.js exists
if [ ! -f "$SERVER" ]; then
  echo "❌ server.js not found at $SERVER"
  exit 1
fi

# 2. Backup
cp "$SERVER" "$SERVER.bak.orchestrator"
echo "📁 Backup created: server.js.bak.orchestrator"

# 3. Add orchestrator only if missing
if ! grep -q "runNIAEvoPipeline" "$SERVER"; then
  echo "🔧 Injecting pipeline orchestrator..."

  cat >> "$SERVER" << 'EOP'

/* --- NIA‑EVO FULL PIPELINE ORCHESTRATOR (AUTO‑PATCHED) --- */
async function runNIAEvoPipeline(ledger) {
  try {
    console.log("🚀 Starting NIA‑EVO Autonomous Pipeline...");

    // 1. Ingest RSS
    console.log("📡 Step 1: Ingesting RSS feeds...");
    let deals = await fetchAllRSS();

    // 2. Dedupe
    if (typeof applyDedupe === "function") {
      console.log("🧹 Step 2: Deduping deals...");
      deals = await applyDedupe(deals);
    }

    // 3. Valuation
    if (typeof runValuationPipeline === "function") {
      console.log("🏷️ Step 3: Applying Estated valuations...");
      deals = await runValuationPipeline(deals);
    }

    // 4. Scoring
    if (typeof applyDealScoring === "function") {
      console.log("🧮 Step 4: Scoring deals...");
      deals = await applyDealScoring(deals);
    }

    // 5. Governess deployment
    let deploymentResults = [];
    if (typeof runGovernessDeployment === "function") {
      console.log("👑 Step 5: Running Governess deployment...");
      deploymentResults = await runGovernessDeployment(deals, ledger);
    }

    // 6. Daily summary
    let summary = "";
    if (typeof runDailySummary === "function") {
      console.log("🗒️ Step 6: Generating daily summary...");
      summary = await runDailySummary(deals);
    }

    console.log("🎯 NIA‑EVO Pipeline Complete.");
    return {
      deals,
      deploymentResults,
      summary
    };

  } catch (err) {
    console.error("❌ Pipeline error:", err);
    return { error: err.message };
  }
}
EOP

  echo "✅ Pipeline orchestrator added."
else
  echo "✔️ Pipeline orchestrator already present."
fi

echo "🎉 Orchestrator patch complete."
echo "   Restart with: cd ~/nia-capital-os && node server.js"
