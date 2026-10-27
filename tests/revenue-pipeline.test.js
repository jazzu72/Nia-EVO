"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const cli = path.resolve("tools/revenue-pipeline.js");

function withTempDb(fn) {
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "nia-revenue-test-"));
const db = path.join(dir, "ledger.json");

function run(args) {
return spawnSync(process.execPath, [cli, ...args], {
encoding: "utf8",
env: { ...process.env, NIA_REVENUE_PIPELINE_DB: db }
});
}

try {
fn({ run, db });
} finally {
fs.rmSync(dir, { recursive: true, force: true });
}
}

function addProspect(run) {
const result = run([
"add", "Regression Test School", "school",
"Norfolk, VA", "Test Contact", "https://example.org"
]);
assert.equal(result.status, 0, result.stderr || result.stdout);
const match = result.stdout.match(/Saved prospect:\s+([a-f0-9]+)/i);
assert.ok(match, "Expected the CLI to return the new prospect ID");
return match[1];
}

function summary(run) {
const result = run(["summary"]);
assert.equal(result.status, 0, result.stderr || result.stdout);
return JSON.parse(result.stdout);
}

test("prospect value is reported separately from recorded payments", () => {
withTempDb(({ run, db }) => {
const id = addProspect(run);
const data = summary(run);

assert.equal(data.prospects, 1);
assert.equal(data.proposed_pipeline_value, 99);
assert.equal(data.owner_confirmed_payments, 0);
assert.equal(data.payment_records, 0);

const ledger = JSON.parse(fs.readFileSync(db, "utf8"));
assert.equal(ledger.prospects[0].id, id);
assert.equal(ledger.payments.length, 0);

});
});

test("recorded payment changes the stage and summary totals", () => {
withTempDb(({ run }) => {
const id = addProspect(run);
const result = run(["payment", id, "12.50", "Receipt-ABC"]);

assert.equal(result.status, 0, result.stderr || result.stdout);
assert.match(result.stdout, /after verifying receipt/i);

const data = summary(run);
assert.equal(data.stages.won, 1);
assert.equal(data.proposed_pipeline_value, 0);
assert.equal(data.owner_confirmed_payments, 12.5);
assert.equal(data.payment_records, 1);
assert.match(data.note, /not revenue/i);
assert.equal("independently_verified_revenue" in data, false);

});
});

test("payment reference deduplication ignores letter case", () => {
withTempDb(({ run }) => {
const id = addProspect(run);
assert.equal(run(["payment", id, "12.50", "Receipt-ABC"]).status, 0);

const duplicate = run(["payment", id, "12.50", "receipt-abc"]);
assert.notEqual(duplicate.status, 0);
assert.match(duplicate.stderr, /already recorded/i);

const data = summary(run);
assert.equal(data.payment_records, 1);
assert.equal(data.owner_confirmed_payments, 12.5);

});
});
