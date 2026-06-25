#!/data/data/com.termux/files/usr/bin/bash
set -e

SERVER="$HOME/nia-capital-os/server.js"

echo "🔧 Patching Governess integration into server.js..."

# 1. Ensure server.js exists
if [ ! -f "$SERVER" ]; then
  echo "❌ server.js not found at $SERVER"
  exit 1
fi

# 2. Backup
cp "$SERVER" "$SERVER.bak.governess"
echo "📁 Backup created: server.js.bak.governess"

# 3. Add import if missing
if ! grep -q "GovernessDeployment" "$SERVER"; then
  echo "🔧 Adding Governess import..."
  echo "import GovernessDeployment from './governess-deployment.js';" | cat - "$SERVER" > "$SERVER.tmp" && mv "$SERVER.tmp" "$SERVER"
  echo "✅ Governess import added."
else
  echo "✔️ Governess import already present."
fi

# 4. Add deployment wrapper if missing
if ! grep -q "runGovernessDeployment" "$SERVER"; then
  echo "🔧 Injecting Governess deployment wrapper..."

  cat >> "$SERVER" << 'EOP'

/* --- NIA‑EVO GOVERNESS DEPLOYMENT (AUTO‑PATCHED) --- */
async function runGovernessDeployment(deals, ledger) {
  try {
    console.log("👑 Running Governess deployment engine...");

    const governess = new GovernessDeployment(ledger, deals);
    const decisions = [];

    for (const deal of deals) {
      const result = governess.deploy({
        address: deal.title || "Unknown",
        purchasePrice: deal.price || 0,
        monthlyRent: deal.estimatedRent || 0,
        downPayment: deal.downPayment || 0,
        neighborhood: deal.neighborhood || "Unknown"
      });
      decisions.push(result);
    }

    return decisions;
  } catch (err) {
    console.error("Governess error:", err);
    return [];
  }
}
EOP

  echo "✅ Governess deployment wrapper added."
else
  echo "✔️ Governess deployment wrapper already present."
fi

echo "🎉 Governess patch complete."
echo "   Restart with: cd ~/nia-capital-os && node server.js"
