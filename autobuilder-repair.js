const fs = require("fs");
const path = require("path");
const cp = require("child_process");

const ROOT = process.cwd();
const REPORT = path.join(ROOT, "reports/autobuilder-repair-report.json");
const BACKUP = path.join(
  ROOT,
  "audit-backups",
  `autobuilder-repair-${new Date().toISOString().replace(/[:.]/g,"-")}`
);

const repair = {
  startedAt: new Date().toISOString(),
  root: ROOT,
  backup: BACKUP,
  repairs: [],
  tests: [],
  failures: [],
  status: "RUNNING"
};

function log(msg) {
  console.log(`[AUTO-BUILDER] ${msg}`);
}

function record(type, data) {
  repair.repairs.push({
    type,
    ...data,
    at: new Date().toISOString()
  });
}

function fail(type, data) {
  repair.failures.push({
    type,
    ...data,
    at: new Date().toISOString()
  });
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function backup(file) {
  const rel = path.relative(ROOT, file);
  const dest = path.join(BACKUP, rel);
  ensureDir(path.dirname(dest));
  fs.copyFileSync(file, dest);
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function write(file, text) {
  backup(file);
  fs.writeFileSync(file, text);
}

function test(name, fn) {
  try {
    fn();
    repair.tests.push({ name, status: "PASS" });
    log(`PASS ${name}`);
    return true;
  } catch (e) {
    repair.tests.push({
      name,
      status: "FAIL",
      error: e.message
    });
    fail("TEST_FAILURE", {
      test: name,
      error: e.message
    });
    log(`FAIL ${name}: ${e.message}`);
    return false;
  }
}

ensureDir(BACKUP);
ensureDir(path.dirname(REPORT));

log("Starting canonical repair controller");
log(`Recovery snapshot: ${BACKUP}`);

/*
 * ============================================================
 * 1. ACQUISITION ENGINE COMPATIBILITY
 * ============================================================
 */

const acquisitionApi =
  path.join(ROOT, "acquisition", "acquisition-api.js");

const acquisitionEngine =
  path.join(ROOT, "acquisition", "lead-acquisition-engine.js");

if (fs.existsSync(acquisitionApi) && fs.existsSync(acquisitionEngine)) {

  let api = read(acquisitionApi);
  let engine = read(acquisitionEngine);

  /*
   * The API currently expects:
   *   stats()
   *   topProspects()
   *
   * while the canonical engine exposes:
   *   acquire()
   *   generateTargets()
   *
   * We add compatibility at the engine boundary instead of
   * creating a second engine.
   */

  if (!/function\s+stats\s*\(/.test(engine) &&
      !/stats\s*:/.test(engine)) {

    engine = engine.replace(
      /module\.exports\s*=\s*\{([\s\S]*?)\};\s*$/,
      (match, body) => {
        return `
// Canonical compatibility methods.
// These preserve the existing API contract without creating
// another acquisition engine.

function stats() {
    const targets = generateTargets();
    return {
        ok: true,
        total: Array.isArray(targets) ? targets.length : 0,
        targets: Array.isArray(targets) ? targets : []
    };
}

function topProspects() {
    const targets = generateTargets();

    if (!Array.isArray(targets)) {
        return [];
    }

    return targets
        .slice()
        .sort((a, b) => {
            const as = Number(a.score || a.priorityScore || 0);
            const bs = Number(b.score || b.priorityScore || 0);
            return bs - as;
        });
}

module.exports = {${body}
    stats,
    topProspects
};`;
      }
    );

    write(acquisitionEngine, engine);

    record(
      "ENGINE_COMPATIBILITY",
      {
        engine: "acquisition/lead-acquisition-engine.js",
        added: ["stats", "topProspects"]
      }
    );

    log("Repaired acquisition engine compatibility");
  }
}

/*
 * ============================================================
 * 2. FUNDING ENGINE COMPATIBILITY
 * ============================================================
 */

const fundingEngine =
  path.join(
    ROOT,
    "funding-engine",
    "funding-review-decision-engine.js"
  );

if (fs.existsSync(fundingEngine)) {

  let engine = read(fundingEngine);

  /*
   * server-watson expects discover()/analyze().
   * Canonical engine exposes decide()/buildDecisionQueue().
   *
   * Provide a single compatibility boundary.
   */

  if (!/function\s+discover\s*\(/.test(engine) &&
      !/discover\s*:/.test(engine)) {

    engine = engine.replace(
      /module\.exports\s*=\s*\{([\s\S]*?)\};\s*$/,
      (match, body) => {
        return `
// Canonical compatibility layer.

function discover(input) {
    if (typeof buildDecisionQueue === "function") {
        return buildDecisionQueue(input);
    }

    if (typeof decide === "function") {
        return decide(input);
    }

    throw new Error(
        "Funding engine has no canonical decision implementation"
    );
}

function analyze(input) {
    if (typeof decide === "function") {
        return decide(input);
    }

    if (typeof buildDecisionQueue === "function") {
        return buildDecisionQueue(input);
    }

    throw new Error(
        "Funding engine has no canonical decision implementation"
    );
}

module.exports = {${body}
    discover,
    analyze
};`;
      }
    );

    write(fundingEngine, engine);

    record(
      "ENGINE_COMPATIBILITY",
      {
        engine:
          "funding-engine/funding-review-decision-engine.js",
        added: ["discover", "analyze"]
      }
    );

    log("Repaired funding engine compatibility");
  }
}

/*
 * ============================================================
 * 3. FOLLOW-UP ENGINE
 * ============================================================
 */

const followupEngine =
  path.join(
    ROOT,
    "revenue",
    "followup",
    "followup-engine.js"
  );

if (fs.existsSync(followupEngine)) {

  let engine = read(followupEngine);

  /*
   * API expects addFollowup().
   * Existing engine has create().
   *
   * Canonicalize at engine boundary.
   */

  if (!/function\s+addFollowup\s*\(/.test(engine)) {

    engine = engine.replace(
      /module\.exports\s*=\s*\{([\s\S]*?)\};\s*$/,
      (match, body) => {
        return `
function addFollowup(task) {
    return create(task);
}

module.exports = {${body}
    addFollowup
};`;
      }
    );

    write(followupEngine, engine);

    record(
      "ENGINE_COMPATIBILITY",
      {
        engine: "revenue/followup/followup-engine.js",
        added: ["addFollowup"]
      }
    );

    log("Repaired follow-up API/engine mismatch");
  }
}

/*
 * ============================================================
 * 4. VERIFY CRITICAL ENGINES LOAD
 * ============================================================
 */

test(
  "Acquisition engine loads",
  () => {
    const e = require(acquisitionEngine);

    if (typeof e.acquire !== "function")
      throw new Error("acquire missing");

    if (typeof e.generateTargets !== "function")
      throw new Error("generateTargets missing");

    if (typeof e.stats !== "function")
      throw new Error("stats missing");

    if (typeof e.topProspects !== "function")
      throw new Error("topProspects missing");
  }
);

test(
  "Funding engine loads",
  () => {
    const e = require(fundingEngine);

    if (typeof e.decide !== "function")
      throw new Error("decide missing");

    if (typeof e.buildDecisionQueue !== "function")
      throw new Error("buildDecisionQueue missing");

    if (typeof e.discover !== "function")
      throw new Error("discover missing");

    if (typeof e.analyze !== "function")
      throw new Error("analyze missing");
  }
);

test(
  "Follow-up engine loads",
  () => {
    const e = require(followupEngine);

    if (typeof e.create !== "function")
      throw new Error("create missing");

    if (typeof e.queue !== "function")
      throw new Error("queue missing");

    if (typeof e.addFollowup !== "function")
      throw new Error("addFollowup missing");
  }
);

/*
 * ============================================================
 * 5. OUTREACH ENGINE CONTRACT
 * ============================================================
 */

const outreachEngine =
  path.join(
    ROOT,
    "outreach",
    "outreach-engine.js"
  );

test(
  "Outreach engine contract",
  () => {

    const e = require(outreachEngine);

    for (const method of [
      "createDraft",
      "queue",
      "pendingApproval",
      "approveDraft"
    ]) {
      if (typeof e[method] !== "function") {
        throw new Error(
          `outreach method missing: ${method}`
        );
      }
    }
  }
);

/*
 * ============================================================
 * 6. EXECUTION ENGINE CONTRACT
 * ============================================================
 */

const executionEngine =
  path.join(
    ROOT,
    "outreach",
    "outreach-execution-engine.js"
  );

test(
  "Outreach execution engine contract",
  () => {

    const e = require(executionEngine);

    for (const method of [
      "prepare",
      "queue",
      "ready",
      "markDryRunSent"
    ]) {
      if (typeof e[method] !== "function") {
        throw new Error(
          `execution method missing: ${method}`
        );
      }
    }
  }
);

/*
 * ============================================================
 * 7. SYNTAX CHECK LIVE JS
 * ============================================================
 */

test(
  "Critical live modules compile",
  () => {

    const modules = [
      acquisitionEngine,
      fundingEngine,
      followupEngine,
      outreachEngine,
      executionEngine,
      path.join(ROOT, "server-watson.js")
    ];

    for (const file of modules) {
      const result = cp.spawnSync(
        process.execPath,
        ["--check", file],
        { encoding: "utf8" }
      );

      if (result.status !== 0) {
        throw new Error(
          `${path.relative(ROOT, file)}: ${
            result.stderr || "syntax failure"
          }`
        );
      }
    }
  }
);

/*
 * ============================================================
 * 8. WRITE REPORT
 * ============================================================
 */

repair.finishedAt = new Date().toISOString();

repair.status =
  repair.failures.length === 0
    ? "REPAIRED"
    : "REPAIR_FAILED";

fs.writeFileSync(
  REPORT,
  JSON.stringify(repair, null, 2)
);

console.log("");
console.log("==========================================");
console.log(" NIA AUTO BUILDER — REPAIR COMPLETE");
console.log("==========================================");
console.log("STATUS:   ", repair.status);
console.log("REPAIRS:  ", repair.repairs.length);
console.log("TESTS:    ", repair.tests.length);
console.log("FAILURES: ", repair.failures.length);
console.log("BACKUP:   ", BACKUP);
console.log("REPORT:   ", REPORT);
console.log("==========================================");

if (repair.failures.length) {
  process.exit(1);
}
