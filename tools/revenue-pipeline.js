"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DB = path.resolve(process.env.NIA_REVENUE_PIPELINE_DB || path.join(__dirname, "../runtime/revenue-pipeline.json"));
const stages = ["prospect","contacted","interested","pilot_offered","won","lost"];

function today() {
  return new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD, local
}

function isValidDate(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s || "")) return false;
  const [y,m,dd] = s.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m-1, dd));
  return dt.getUTCFullYear()===y && dt.getUTCMonth()===m-1 && dt.getUTCDate()===dd;
}

function load() {
  if (!fs.existsSync(DB)) save({version:1, prospects:[], payments:[]});
  let d;
  try {
    d = JSON.parse(fs.readFileSync(DB,"utf8"));
  } catch (e) {
    throw Error(`Cannot read ${DB}: ${e.message}. Back up and repair the file before continuing.`);
  }
  d.prospects ||= [];
  d.payments ||= [];
  return d;
}

function save(d) {
  fs.mkdirSync(path.dirname(DB), {recursive:true});
  const tmp = DB + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(d,null,2), {mode:0o600});
  fs.renameSync(tmp, DB);
}

function find(d, id) {
  if (!id || typeof id !== "string") return null;
  const exact = d.prospects.find(p => p.id === id);
  if (exact) return exact;
  const matches = d.prospects.filter(p => p.id.startsWith(id));
  if (matches.length > 1)
    throw Error("Ambiguous ID prefix: matches " + matches.map(p=>p.id).join(", "));
  return matches[0];
}

function run() {
  const [cmd, ...a] = process.argv.slice(2);
  const d = load();

  if (cmd === "add") {
    if (!a[0]) throw Error('Usage: add "Organization" "type" "location" "contact" "website"');
    const name = a[0].trim(), location = a[2] || "unspecified";
    if (d.prospects.some(p => p.name.toLowerCase()===name.toLowerCase() && p.location.toLowerCase()===location.toLowerCase()))
      throw Error("Possible duplicate organization.");
    const p = {
      id: crypto.randomUUID().slice(0,8),
      name, type: a[1] || "organization",
      location, contact: a[3] || "", website: a[4] || "",
      product: "Money Munchkins: Quantum Odyssey",
      proposed_price: 99,
      stage: "prospect",
      followup: null,
      notes: "",
      created_at: new Date().toISOString()
    };
    d.prospects.push(p); save(d);
    console.log("Saved prospect:", p.id, p.name);
    return;
  }

  if (cmd === "remove") {
    const p = find(d, a[0]);
    if (!p) throw Error("Prospect ID not found.");
    if (d.payments.some(x => x.prospect_id === p.id))
      throw Error("Cannot remove a prospect with recorded payments.");
    d.prospects = d.prospects.filter(x => x.id !== p.id);
    save(d);
    console.log("Removed prospect:", p.id, p.name);
    return;
  }

  if (cmd === "list") {
    console.table(d.prospects.map(({id,name,type,location,stage,proposed_price}) =>
      ({id,name,type,location,stage,proposed_price})));
    return;
  }

  if (cmd === "draft") {
    const p = find(d, a[0]); if (!p) throw Error("Prospect ID not found.");
    console.log(`DRAFT ONLY — REVIEW BEFORE SENDING
                                              To: ${p.contact||"Find an authorized contact"}
Organization: ${p.name}
Website: ${p.website||"Not recorded"}

Hello${p.contact?" "+p.contact:""},

I'm reaching out from House of Jazzu about Money Munchkins: Quantum Odyssey, an educational game concept that helps children practice money basics, needs versus wants, and budgeting.

We're exploring a small, parent- or educator-supervised founding pilot and would value a brief conversation about whether it could serve your community.

The proposed pilot price is $99, subject to agreed scope, suitability, safeguarding, and timing. This is a proposal, not a claim that a pilot is already available.

Would you be open to a short introductory conversation?

Best,
House of Jazzu`);
    return;
  }

  if (cmd === "stage") {
    const p = find(d, a[0]); if (!p) throw Error("Prospect ID not found.");
    if (!stages.includes(a[1]) || a[1] === "won")
      throw Error("Use a valid stage: " + stages.filter(s=>s!=="won").join(", ") + "; record won only through payment.");
    if (p.stage === "won")
      throw Error("Stage is locked to won once payment is recorded.");
    p.stage = a[1]; p.notes = a.slice(2).join(" ");
    save(d); console.log("Updated:", p.id, p.stage); return;
  }

  if (cmd === "followup") {
    const p = find(d, a[0]);
    if (!p || !isValidDate(a[1]))
      throw Error("Usage: followup ID YYYY-MM-DD (valid calendar date)");
    p.followup = a[1]; save(d);
    console.log("Follow-up scheduled:", p.name, a[1]); return;
  }

  if (cmd === "due") {
    const t = today();
    const rows = d.prospects.filter(p => p.followup && p.followup <= t && !["won","lost"].includes(p.stage));
    console.table(rows.map(p => ({id:p.id, name:p.name, due:p.followup, stage:p.stage})));
    return;
  }

  if (cmd === "payment") {
    const p = find(d, a[0]), amount = Number(a[1]), reference = a.slice(2).join(" ").trim();
    if (!p || !Number.isFinite(amount) || amount <= 0 || !reference)
      throw Error('Usage: payment ID AMOUNT "verified receipt reference"');
    const refNorm = reference.toLowerCase();
    if (d.payments.some(x => (x.reference||"").toLowerCase() === refNorm))
      throw Error("Payment reference already recorded.");
    const t = today();
    if (d.payments.some(x => x.prospect_id===p.id && x.amount===amount && (x.recorded_date||x.recorded_at.slice(0,10))===t))
      throw Error("Possible duplicate: same prospect, amount, and day already recorded. Use a distinct reference if this is a second payment.");
    d.payments.push({
      id: crypto.randomUUID().slice(0,8),
      prospect_id: p.id,
      organization: p.name,
      amount,
      reference,
      status: "owner_confirmed",
      recorded_date: t,
      recorded_at: new Date().toISOString()
    });
    p.stage = "won"; save(d);
    console.log("Payment recorded. Use only after verifying receipt."); return;
  }

  if (cmd === "summary") {
    const byStage = {};
    d.prospects.forEach(p => byStage[p.stage] = (byStage[p.stage]||0) + 1);
    console.log(JSON.stringify({
      prospects: d.prospects.length,
      stages: byStage,
      proposed_pipeline_value: d.prospects.filter(p=>!["won","lost"].includes(p.stage)).reduce((s,p)=>s+p.proposed_price,0),
      owner_confirmed_payments: d.payments.reduce((s,p)=>s+p.amount,0),
      payment_records: d.payments.length,
      note: "Proposed pipeline value is not revenue; verify receipts before recording."
    }, null, 2)); return;
  }

  console.log(`NIA REVENUE PIPELINE
Commands:
  node tools/revenue-pipeline.js add "Organization" "school" "Norfolk, VA" "Contact" "https://example.org"
  node tools/revenue-pipeline.js list
  node tools/revenue-pipeline.js draft ID
  node tools/revenue-pipeline.js stage ID contacted "Draft reviewed"
  node tools/revenue-pipeline.js followup ID 2026-10-13
  node tools/revenue-pipeline.js due
  node tools/revenue-pipeline.js payment ID 99 "verified receipt reference"
  node tools/revenue-pipeline.js summary

No automatic outreach or payment processing.`);
}

try { run(); } catch(e) { console.error("ERROR:", e.message); process.exitCode = 1; }
