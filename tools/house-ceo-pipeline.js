"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DB = path.resolve(
  process.env.NIA_HOUSE_CEO_DB ||
  path.join(__dirname, "../runtime/house-ceo-pipeline.json")
);

const STAGES = [
  "identified",
  "researching",
  "contacted",
  "in_conversation",
  "proposal_sent",
  "won",
  "lost",
  "paused"
];

const TYPES = [
  "service",
  "grant",
  "real_estate",
  "partnership",
  "money_munchkins"
];

function today() {
  return new Date().toLocaleDateString("en-CA");
}

function load() {
  if (!fs.existsSync(DB)) {
    save({ version: 1, records: [], payments: [] });
  }
  return JSON.parse(fs.readFileSync(DB, "utf8"));
}

function save(data) {
  fs.mkdirSync(path.dirname(DB), { recursive: true });
  const temp = DB + ".tmp";
  fs.writeFileSync(temp, JSON.stringify(data, null, 2), { mode: 0o600 });
  fs.renameSync(temp, DB);
}

function find(data, id) {
  const record = data.records.find(r => r.id === id);
  if (!record) throw new Error("Record not found: " + id);
  return record;
}

function priorityScore(record) {
  let score = 0;

  if (record.type === "service") score += 40;
  if (record.type === "grant") score += 30;
  if (record.type === "real_estate") score += 20;
  if (record.type === "partnership") score += 25;
  if (record.type === "money_munchkins") score += 15;

  if (record.stage === "proposal_sent") score += 30;
  if (record.stage === "in_conversation") score += 25;
  if (record.stage === "contacted") score += 15;
  if (record.stage === "researching") score += 10;

  if (record.followup && record.followup <= today()) score += 25;

  const amount = Number(record.amount || 0);
  if (amount > 0) score += Math.min(30, Math.round(amount / 1000));

  return score;
}

function nextAction(record) {
  if (record.type === "money_munchkins") {
    return "Advance the playable vertical slice; do not sell an unfinished product.";
  }

  if (record.stage === "identified") return "Research fit, decision maker, and realistic next step.";
  if (record.stage === "researching") return "Prepare owner-review draft or qualification notes.";
  if (record.stage === "contacted") return "Wait for response or schedule follow-up.";
  if (record.stage === "in_conversation") return "Prepare scoped proposal for owner review.";
  if (record.stage === "proposal_sent") return "Follow up on the sent proposal.";
  if (record.stage === "won") return "Deliver scope and document completion evidence.";
  if (record.stage === "lost") return "Capture the reason and revisit only if circumstances change.";
  return "Review record and define the next owner-approved action.";
}

function run() {
  const [command, ...args] = process.argv.slice(2);
  const data = load();

  if (command === "add") {
    const [type, title, amount, contact, notes] = args;

    if (!TYPES.includes(type)) {
      throw new Error("Type must be one of: " + TYPES.join(", "));
    }
    if (!title) throw new Error("Title is required.");

    const record = {
      id: crypto.randomUUID().slice(0, 8),
      type,
      title: title.trim(),
      amount: Number(amount) || 0,
      contact: contact || "",
      notes: notes || "",
      stage: "identified",
      followup: null,
      ownerApprovalRequired: true,
      externalExecutionAllowed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    data.records.push(record);
    save(data);

    console.log("Saved record:", record.id);
    console.log("Title:", record.title);
    console.log("Next action:", nextAction(record));
    return;
  }

  if (command === "list") {
    const rows = data.records.map(r => ({
      id: r.id,
      type: r.type,
      title: r.title,
      stage: r.stage,
      amount: r.amount,
      followup: r.followup || "",
      priority: priorityScore(r)
    }));

    rows.sort((a, b) => b.priority - a.priority);
    console.table(rows);
    return;
  }

  if (command === "stage") {
    const [id, stage, ...notes] = args;
    const record = find(data, id);

    if (!STAGES.includes(stage)) {
      throw new Error("Stage must be one of: " + STAGES.join(", "));
    }

    record.stage = stage;
    record.notes = notes.join(" ") || record.notes;
    record.updated_at = new Date().toISOString();
    save(data);

    console.log("Updated:", record.title, "->", record.stage);
    console.log("Next action:", nextAction(record));
    return;
  }

  if (command === "followup") {
    const [id, date] = args;
    const record = find(data, id);

    if (!/^d{4}-d{2}-d{2}$/.test(date || "")) {
      throw new Error("Use a valid date: YYYY-MM-DD");
    }

    record.followup = date;
    record.updated_at = new Date().toISOString();
    save(data);

    console.log("Follow-up scheduled:", record.title, date);
    return;
  }

  if (command === "due") {
    const due = data.records.filter(
      r => r.followup && r.followup <= today() && !["won", "lost"].includes(r.stage)
    );

    console.table(due.map(r => ({
      id: r.id,
      type: r.type,
      title: r.title,
      stage: r.stage,
      followup: r.followup,
      priority: priorityScore(r)
    })));
    return;
  }

  if (command === "briefing") {
    const open = data.records.filter(r => !["won", "lost"].includes(r.stage));
    const ranked = open
      .map(r => ({ ...r, priority: priorityScore(r), recommendedAction: nextAction(r) }))
      .sort((a, b) => b.priority - a.priority);

    const pipelineValue = open.reduce((sum, r) => sum + Number(r.amount || 0), 0);

    console.log("HOUSE OF JAZZU — NIA PRIVATE CEO BRIEFING");
    console.log("Date:", today());
    console.log("Open records:", open.length);
    console.log("Open pipeline value:", pipelineValue);
    console.log("Note: Pipeline value is opportunity value, not collected revenue.");
    console.log("");

    ranked.slice(0, 5).forEach((r, index) => {
      console.log((index + 1) + ". [" + r.type.toUpperCase() + "] " + r.title);
      console.log("   Stage: " + r.stage);
      console.log("   Value: $" + Number(r.amount || 0));
      console.log("   Priority: " + r.priority);
      console.log("   Next action: " + r.recommendedAction);
      console.log("   Owner approval required: " + r.ownerApprovalRequired);
      console.log("");
    });

    if (!ranked.length) {
      console.log("No open records. Add real service, grant, real-estate, or partnership opportunities.");
    }

    return;
  }

  if (command === "summary") {
    const byStage = {};
    const byType = {};

    data.records.forEach(r => {
      byStage[r.stage] = (byStage[r.stage] || 0) + 1;
      byType[r.type] = (byType[r.type] || 0) + 1;
    });

    const open = data.records.filter(r => !["won", "lost"].includes(r.stage));

    console.log(JSON.stringify({
      totalRecords: data.records.length,
      openRecords: open.length,
      pipelineValue: open.reduce((s, r) => s + Number(r.amount || 0), 0),
      stages: byStage,
      types: byType,
      note: "Pipeline value is not collected revenue."
    }, null, 2));

    return;
  }

  console.log("HOUSE OF JAZZU CEO PIPELINE");
  console.log("Commands:");
  console.log('  node tools/house-ceo-pipeline.js add service "AI dashboard for client" 1500 "contact" "notes"');
  console.log('  node tools/house-ceo-pipeline.js add grant "Grant opportunity" 25000 "" "notes"');
  console.log('  node tools/house-ceo-pipeline.js add real_estate "Property lead" 0 "" "notes"');
  console.log('  node tools/house-ceo-pipeline.js add money_munchkins "Build playable vertical slice" 0 "" "notes"');
  console.log("  node tools/house-ceo-pipeline.js list");
  console.log("  node tools/house-ceo-pipeline.js stage ID contacted");
  console.log("  node tools/house-ceo-pipeline.js followup ID YYYY-MM-DD");
  console.log("  node tools/house-ceo-pipeline.js due");
  console.log("  node tools/house-ceo-pipeline.js briefing");
  console.log("  node tools/house-ceo-pipeline.js summary");
}

try {
  run();
} catch (error) {
  console.error("ERROR:", error.message);
  process.exitCode = 1;
}
