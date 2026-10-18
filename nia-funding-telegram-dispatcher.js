const fs = require("fs");
const path = require("path");
const { sendTelegram } = require("./communication/telegram-alert");

const QUEUE = path.join(__dirname, "nia-funding-alert-queue.json");
const LEDGER = path.join(__dirname, "data/funding/telegram-alert-ledger.json");

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

async function runOnce() {
  if (!fs.existsSync(QUEUE)) {
    console.error("FUNDING_QUEUE_MISSING");
    return;
  }

  const queue = readJson(QUEUE, {});
  const ledger = readJson(LEDGER, { sent: {} });
  const alerts = Array.isArray(queue.alerts) ? queue.alerts : [];
  const pending = [];

  for (const alert of alerts) {
    if (!alert.grant || !alert.type || !alert.action) continue;

    const key = [alert.grant, alert.type, alert.action].join("|");
    if (ledger.sent[key]) continue;

    const message = [
      "🔔 NIA FUNDING OWNER REVIEW",
      `Grant: ${alert.grant}`,
      `Alert: ${alert.type}`,
      `Required action: ${alert.action}`,
      alert.type === "SUBMISSION_PENDING"
        ? "Status: Awaiting owner confirmation. Submission is NOT verified."
        : "Status: Review/monitoring required.",
      "No application has been submitted by this alert."
    ].join("\n");

    pending.push({ key, message, grant: alert.grant, action: alert.action });
  }

  console.log("FUNDING ALERTS IN QUEUE:", alerts.length);
  console.log("NEW OWNER ALERTS:", pending.length);
  console.log("MODE:", process.env.NIA_FUNDING_TELEGRAM_ENABLED === "true"
    ? "LIVE"
    : "DRY RUN");

  for (const item of pending) {
    console.log(`\n[${item.grant}] ${item.action}`);
    if (process.env.NIA_FUNDING_TELEGRAM_ENABLED !== "true") continue;

    const result = await sendTelegram(item.message);
    if (result && result.sent) {
      ledger.sent[item.key] = {
        sentAt: new Date().toISOString()
      };
      fs.mkdirSync(path.dirname(LEDGER), { recursive: true });
      fs.writeFileSync(LEDGER, JSON.stringify(ledger, null, 2) + "\n");
    } else {
      console.error("ALERT_NOT_RECORDED_AS_SENT:", item.grant);
    }
  }
}

if (require.main === module) {
  runOnce().catch(err => {
    console.error("FUNDING_DISPATCH_FAILED:", err.message);
    process.exitCode = 1;
  });
}

module.exports = { runOnce };
