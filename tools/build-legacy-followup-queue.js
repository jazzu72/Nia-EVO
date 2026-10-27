"use strict";

const fs = require("fs");
const path = require("path");

const source = path.join(
  __dirname, "../data/revenue/live-deals.json"
);
const output = path.join(
  __dirname, "../runtime/revenue-ops/legacy-followup-queue.json"
);

if (!fs.existsSync(source)) {
  throw new Error("Legacy outreach source not found; nothing changed.");
}

const records = JSON.parse(fs.readFileSync(source, "utf8"));
if (!Array.isArray(records)) {
  throw new Error("Expected an array; nothing changed.");
}

const today = new Date().toISOString().slice(0, 10);
const previous = fs.existsSync(output)
  ? JSON.parse(fs.readFileSync(output, "utf8"))
  : { version: 1, items: [] };

if (!Array.isArray(previous.items)) {
  throw new Error("Existing queue has an unexpected format; nothing changed.");
}

const key = r => `${r.org || ""}|${r.sent || ""}`;
const existing = new Map(previous.items.map(item => [key(item), item]));
let added = 0;

for (const r of records) {
  if (!r.org || !r.sent) continue;

  const id = key(r);
  const day5 = r.followup_day5 || null;
  const day10 = r.followup_day10 || null;
  const overdue = r.status === "awaiting" &&
    Boolean(day10) && day10 <= today;

  if (existing.has(id)) {
    // Preserve review decisions already made by the owner.
    const item = existing.get(id);
    item.source_status = r.status || "unknown";
    item.followup_day5 = day5;
    item.followup_day10 = day10;
    item.overdue = overdue;
    continue;
  }

  const item = {
    org: r.org,
    original_sent: r.sent,
    source_status: r.status || "unknown",
    followup_day5: day5,
    followup_day10: day10,
    overdue,
    queue_status: "needs_owner_review",
    priority: overdue ? "high" : "normal",
    category: "legacy_outreach",
    next_action:
      "Review original message, purpose, recipient and relevance before drafting.",
    draft_only:
      "Hello, I'm following up on our previous message sent " +
      r.sent.slice(0, 10) +
      ". Could you let me know whether this is best directed to your team " +
      "and whether there is an appropriate next step? Thank you.",
    sent_automatically: false,
    created_at: new Date().toISOString()
  };

  previous.items.push(item);
  existing.set(id, item);
  added++;
}

previous.version = 1;
previous.updated_at = new Date().toISOString();

const tmp = output + ".tmp";
fs.writeFileSync(tmp, JSON.stringify(previous, null, 2), {
  mode: 0o600
});
fs.renameSync(tmp, output);

console.log("Legacy follow-up queue updated.");
console.log("Source records:", records.length);
console.log("New queue entries:", added);
console.log("Total queue entries:", previous.items.length);
console.log("Overdue awaiting records:",
  previous.items.filter(x => x.overdue).length);
console.log("Awaiting owner review:",
  previous.items.filter(x => x.queue_status === "needs_owner_review").length);
console.log("Automatic messages sent: 0");
console.log("Sales prospects or payments created: 0");
console.log("Queue:", output);
