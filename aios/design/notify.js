/*
  NIA NOTIFICATIONS — owner gets an email whenever Nia acts
  Every executive action is logged + reported.
*/

const fs = require("fs");
const path = require("path");

const LOG_FILE = "runtime/executive-actions.log";
const OWNER_EMAIL = process.env.OWNER_EMAIL || "lesane1972@gmail.com";

function readLog(limit) {
  try {
    const lines = fs.readFileSync(LOG_FILE, "utf8").split("\n").filter(Boolean);
    return lines.slice(-(limit || 50)).map(function (l) { try { return JSON.parse(l); } catch (e) { return null; } }).filter(Boolean);
  } catch (e) { return []; }
}

async function sendDailySummary() {
  const today = new Date().toISOString().slice(0, 10);
  const todayActions = readLog(200).filter(function (e) { return (e.ts || "").slice(0, 10) === today; });

  const emails = todayActions.filter(function (e) { return e.event === "send_email" || e.event === "send_email_gmail"; });
  const failures = todayActions.filter(function (e) { return (e.event || "").indexOf("failed") !== -1; });

  const body = [
    "Nia Daily Report — " + today,
    "",
    "Actions today: " + todayActions.length,
    "Emails sent:   " + emails.length,
    "Failures:      " + failures.length,
    "",
    "Emails:",
    emails.length ? emails.map(function (e) { return "  - " + (e.subject || "(no subject)") + " → " + JSON.stringify(e.to); }).join("\n") : "  (none)",
    "",
    failures.length ? "Failures:\n" + failures.map(function (e) { return "  - " + e.event + ": " + (e.error || "") }).join("\n") : "",
    "",
    "— Nia"
  ].filter(Boolean).join("\n");

  const exec = require("./executive-actions");
  return exec.sendViaGmail({
    to: [OWNER_EMAIL],
    subject: "Nia Daily Report — " + today,
    body: body
  });
}

async function notifyOwner(subject, body) {
  const exec = require("./executive-actions");
  return exec.sendViaGmail({
    to: [OWNER_EMAIL],
    subject: "[NIA] " + subject,
    body: body
  });
}

module.exports = { sendDailySummary, notifyOwner, readLog };
