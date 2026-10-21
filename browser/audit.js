'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const AUDIT_FILE = path.join(ROOT, 'runtime', 'browser-audit.jsonl');

function ensureFile() {
  fs.mkdirSync(path.dirname(AUDIT_FILE), { recursive: true });
  if (!fs.existsSync(AUDIT_FILE)) fs.writeFileSync(AUDIT_FILE, '');
}

// Records BEFORE and AFTER every transport action. Append-only — no update
// or delete API. Chain of SHA-256 hashes so any tampering is detectable.
function record(event) {
  ensureFile();
  const prevHash = lastHash();
  const entry = {
    at: new Date().toISOString(),
    prevHash,
    ...event
  };
  entry.hash = crypto.createHash('sha256').update(JSON.stringify(entry)).digest('hex');
  fs.appendFileSync(AUDIT_FILE, JSON.stringify(entry) + '\n');
  return entry;
}

function lastHash() {
  try {
    const lines = fs.readFileSync(AUDIT_FILE, 'utf8').trim().split('\n');
    const last = lines[lines.length - 1];
    if (!last) return null;
    return JSON.parse(last).hash || null;
  } catch { return null; }
}

function verifyChain() {
  ensureFile();
  const lines = fs.readFileSync(AUDIT_FILE, 'utf8').trim().split('\n').filter(Boolean);
  let prev = null;
  for (let i = 0; i < lines.length; i++) {
    const e = JSON.parse(lines[i]);
    if (e.prevHash !== prev) {
      return { ok: false, at: i, expected: prev, found: e.prevHash };
    }
    const check = { ...e };
    delete check.hash;
    const computed = crypto.createHash('sha256').update(JSON.stringify(check)).digest('hex');
    if (computed !== e.hash) return { ok: false, at: i, reason: 'hash mismatch' };
    prev = e.hash;
  }
  return { ok: true, entries: lines.length };
}

module.exports = { record, verifyChain, AUDIT_FILE };
