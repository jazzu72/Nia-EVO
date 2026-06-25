#!/data/data/com.termux/files/usr/bin/bash
set -e

SERVER="$HOME/nia-capital-os/server.js"

echo "🔧 Patching Autonomous Scheduler into server.js..."

# 1. Ensure server.js exists
if [ ! -f "$SERVER" ]; then
  echo "❌ server.js not found at $SERVER"
  exit 1
fi

# 2. Backup
cp "$SERVER" "$SERVER.bak.scheduler"
echo "📁 Backup created: server.js.bak.scheduler"

# 3. Add scheduler only if missing
if ! grep -q "startNIAEvoScheduler" "$SERVER"; then
  echo "🔧 Injecting scheduler..."

  cat >> "$SERVER" << 'EOP'

/* --- NIA‑EVO AUTONOMOUS SCHEDULER (AUTO‑PATCHED) --- */
function startNIAEvoScheduler(ledger, intervalMinutes = 60) {
  console.log(`⏱️ NIA‑EVO Autonomous Scheduler Active — every ${intervalMinutes} minutes`);

  const intervalMs = intervalMinutes * 60 * 1000;

  async function runCycle() {
    try {
      console.log("🚀 Scheduler Trigger: Running full NIA‑EVO pipeline...");
      const result = await runNIAEvoPipeline(ledger);

      console.log("📦 Pipeline result:");
      console.log(JSON.stringify(result, null, 2));
    } catch (err) {
      console.error("❌ Scheduler pipeline error:", err);
    }
  }

  // Run immediately on startup
  runCycle();

  // Run on interval
  setInterval(runCycle, intervalMs);
}
EOP

  echo "✅ Scheduler added."
else
  echo "✔️ Scheduler already present."
fi

echo "🎉 Scheduler patch complete."
echo "   Restart with: cd ~/nia-capital-os && node server.js"
