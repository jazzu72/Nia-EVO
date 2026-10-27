"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const gatePath = path.resolve("tools/autonomy-gate.js");

function runGate(config, action) {
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "nia-gate-test-"));
try {
const configPath = path.join(dir, "autonomy.json");
fs.writeFileSync(configPath, JSON.stringify(config));

const script =
  'const g = require(process.env.NIA_GATE_PATH);' +
  'console.log(JSON.stringify(g.isAllowed(process.env.NIA_TEST_ACTION)));';

const result = spawnSync(process.execPath, ["-e", script], {
  encoding: "utf8",
  env: {
    ...process.env,
    AUTONOMY_CONFIG: configPath,
    NIA_GATE_PATH: gatePath,
    NIA_TEST_ACTION: action
  }
});

assert.equal(result.status, 0, result.stderr || "Gate process failed");
return JSON.parse(result.stdout.trim());

} finally {
fs.rmSync(dir, { recursive: true, force: true });
}
}

const config = {
mode: "TEST_ONLY",
kill_switch: { active: false },
tiers: {
T1: { enabled: true, actions: ["draft_proposal"] },
T2: {
enabled: true,
actions: ["queue_outbound_for_owner_review"],
requires_owner_click_to_send: true
},
T3: { enabled: false, actions: ["auto_send"] },
T4: { enabled: false, blocked_actions: ["move_money"] }
}
};

test("active kill switch denies actions", () => {
const result = runGate(
{ ...config, kill_switch: { active: true } },
"draft_proposal"
);
assert.equal(result.allowed, false);
assert.equal(result.reason, "KILL_SWITCH_ACTIVE");
});

test("enabled T1 permits internal drafting", () => {
const result = runGate(config, "draft_proposal");
assert.equal(result.allowed, true);
assert.equal(result.tier, "T1");
});

test("T2 queueing requires owner approval", () => {
const result = runGate(config, "queue_outbound_for_owner_review");
assert.equal(result.allowed, true);
assert.equal(result.requiresOwnerClick, true);
});

test("disabled T3 action is denied", () => {
assert.equal(runGate(config, "auto_send").allowed, false);
});

test("blocked T4 financial action is denied", () => {
const result = runGate(config, "move_money");
assert.equal(result.allowed, false);
assert.equal(result.reason, "blocked by policy");
});

test("unknown action is denied", () => {
const result = runGate(config, "unknown_test_action");
assert.equal(result.allowed, false);
assert.equal(result.reason, "action not recognized");
});
