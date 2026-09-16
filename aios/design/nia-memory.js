/*
  NIA MEMORY — persistent conversation + decision journal
  Additive only. No safety changes.
*/

const fs = require("fs");
const path = require("path");

const MEMORY_DIR = "runtime/memory";
const CONV_FILE = path.join(MEMORY_DIR, "conversations.jsonl");
const DECISION_FILE = path.join(MEMORY_DIR, "decisions.jsonl");

function ensure() {
  if (!fs.existsSync(MEMORY_DIR)) fs.mkdirSync(MEMORY_DIR, { recursive: true });
}

function appendJSONL(file, entry) {
  ensure();
  fs.appendFileSync(file, JSON.stringify(entry) + "\n");
}

function recordTurn(role, message, meta) {
  appendJSONL(CONV_FILE, {
    ts: new Date().toISOString(),
    role: role,
    message: String(message || "").slice(0, 2000),
    meta: meta || null,
  });
}

function recordDecision(kind, description, context) {
  appendJSONL(DECISION_FILE, {
    ts: new Date().toISOString(),
    kind: kind,
    description: String(description || "").slice(0, 500),
    context: context || {},
  });
}

function readRecent(file, days) {
  ensure();
  if (!fs.existsSync(file)) return [];
  const cutoff = Date.now() - (days || 90) * 86400000;
  const lines = fs.readFileSync(file, "utf8").split("\n").filter(Boolean);
  return lines
    .map(function (l) { try { return JSON.parse(l); } catch (e) { return null; } })
    .filter(function (e) { return e && new Date(e.ts).getTime() >= cutoff; });
}

function buildMemoryBlock(days) {
  const convos = readRecent(CONV_FILE, days || 90);
  const decisions = readRecent(DECISION_FILE, days || 90);
  if (!convos.length && !decisions.length) return "";

  const recentChats = convos.slice(-10).map(function (c) {
    return "- [" + c.ts.slice(0, 10) + "] " + c.role + ": " + c.message.slice(0, 120);
  }).join("\n");

  const recentDecisions = decisions.slice(-15).map(function (d) {
    return "- [" + d.ts.slice(0, 10) + "] " + d.kind + ": " + d.description;
  }).join("\n");

  return [
    "RECENT CONVERSATION (last 10 turns):",
    recentChats || "(none)",
    "",
    "RECENT DECISIONS (" + decisions.length + " in last " + (days || 90) + " days):",
    recentDecisions || "(none)",
  ].join("\n");
}

module.exports = { recordTurn, recordDecision, buildMemoryBlock, readRecent };
