"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createVerificationStore } = require("../aios/design/realestate-verification");

function fixture(t, classification = "USER_SUBMITTED") {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "nia-re-verify-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));

  const dealsFile = path.join(dir, "deals.json");
  const auditFile = path.join(dir, "audit.jsonl");

  fs.writeFileSync(dealsFile, JSON.stringify({
    deals: [{
      id: "TEST-001",
      dataClassification: classification,
      verificationStatus: "UNVERIFIED",
      status: "NEW"
    }]
  }));

  return {
    dealsFile,
    auditFile,
    store: createVerificationStore({
      dealsFile,
      auditFile,
      now: () => new Date("2026-10-17T12:00:00.000Z")
    })
  };
}

const evidence = {
  sourceUrl: "https://example.org/property/TEST-001",
  description: "Test evidence description for verification safeguards.",
  checkedAt: "2026-10-16",
  ownerAttested: true
};

test("demo records cannot be verified", t => {
  const f = fixture(t, "DEMO_UNVERIFIED");
  assert.throws(
    () => f.store.verify("TEST-001", evidence, "test_owner"),
    { message: "DEMO_RECORD_CANNOT_BE_VERIFIED" }
  );
  assert.equal(JSON.parse(fs.readFileSync(f.dealsFile)).deals[0].verificationStatus, "UNVERIFIED");
});

test("invalid URL and missing owner attestation are rejected", t => {
  const f = fixture(t);
  assert.throws(
    () => f.store.verify("TEST-001", { ...evidence, sourceUrl: "javascript:alert(1)" }, "test_owner"),
    { message: "EVIDENCE_URL_INVALID" }
  );
  assert.throws(
    () => f.store.verify("TEST-001", { ...evidence, ownerAttested: false }, "test_owner"),
    { message: "OWNER_ATTESTATION_REQUIRED" }
  );
});

test("verification and revocation are audited with owner metadata", t => {
  const f = fixture(t);
  assert.equal(
    f.store.verify("TEST-001", evidence, "Jason LeSane", "owner_token").verificationStatus,
    "VERIFIED"
  );
  assert.equal(JSON.parse(fs.readFileSync(f.dealsFile)).deals[0].verificationStatus, "VERIFIED");

  assert.equal(
    f.store.revoke("TEST-001", "Jason LeSane", "owner_session").verificationStatus,
    "UNVERIFIED"
  );
  const events = fs.readFileSync(f.auditFile, "utf8").trim().split("\n").map(JSON.parse);
  assert.deepEqual(events.map(e => e.action), ["VERIFY", "REVOKE"]);
  assert.deepEqual(events.map(e => e.actor), ["Jason LeSane", "Jason LeSane"]);
  assert.deepEqual(events.map(e => e.actorTitle), ["Founder", "Founder"]);
  assert.deepEqual(events.map(e => e.organization), ["House of Jazzu", "House of Jazzu"]);
  assert.deepEqual(events.map(e => e.authMethod), ["owner_token", "owner_session"]);
});

test("audit failure rolls deal status back", t => {
  const f = fixture(t);
  fs.mkdirSync(f.auditFile);
  assert.throws(() => f.store.verify("TEST-001", evidence, "test_owner"));
  assert.equal(JSON.parse(fs.readFileSync(f.dealsFile)).deals[0].verificationStatus, "UNVERIFIED");
});

test("unknown deals cannot be verified", t => {
  const f = fixture(t);
  assert.throws(
    () => f.store.verify("MISSING", evidence, "test_owner"),
    { message: "DEAL_NOT_FOUND" }
  );
});
