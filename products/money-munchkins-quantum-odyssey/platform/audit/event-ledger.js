const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const FILE = path.join(__dirname, "../../data/audit-ledger.jsonl");

function append(type, payload) {
  if (!type || !payload) throw new Error("INVALID_AUDIT_EVENT");

  const previous = fs.existsSync(FILE)
    ? fs.readFileSync(FILE, "utf8").trim().split("\n").filter(Boolean).pop()
    : "";

  const previousHash = previous
    ? JSON.parse(previous).hash
    : "GENESIS";

  const event = {
    id: crypto.randomUUID(),
    type,
    timestamp: new Date().toISOString(),
    payload,
    previousHash
  };

  event.hash = crypto
    .createHash("sha256")
    .update(JSON.stringify(event))
    .digest("hex");

  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.appendFileSync(FILE, JSON.stringify(event) + "\n");

  return event;
}

function verify() {
  if (!fs.existsSync(FILE)) {
    return { valid: true, events: 0 };
  }

  const lines = fs.readFileSync(FILE, "utf8")
    .trim()
    .split("\n")
    .filter(Boolean);

  let previousHash = "GENESIS";

  for (const line of lines) {
    const event = JSON.parse(line);

    if (event.previousHash !== previousHash) {
      return { valid: false, events: lines.length, error: "CHAIN_BROKEN" };
    }

    const { hash, ...unsigned } = event;

    const expected = crypto
      .createHash("sha256")
      .update(JSON.stringify(unsigned))
      .digest("hex");

    if (hash !== expected) {
      return { valid: false, events: lines.length, error: "HASH_MISMATCH" };
    }

    previousHash = hash;
  }

  return { valid: true, events: lines.length };
}

module.exports = { append, verify };
