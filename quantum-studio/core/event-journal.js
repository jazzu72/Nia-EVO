"use strict";

const fs = require("fs");
const path = require("path");

const EVENT_DIR = path.join(
  __dirname,
  "..",
  "worlds",
  "money-munchkins",
  "events"
);

function ensureDir() {
  fs.mkdirSync(EVENT_DIR, { recursive: true });
}

function validatePlayerId(playerId) {
  if (!/^[a-zA-Z0-9_-]+$/.test(playerId)) {
    throw new Error("INVALID_PLAYER_ID");
  }
}

function file(playerId) {
  validatePlayerId(playerId);
  return path.join(EVENT_DIR, `${playerId}.events.json`);
}

function append(playerId, event) {
  ensureDir();

  const target = file(playerId);

  const events = fs.existsSync(target)
    ? JSON.parse(fs.readFileSync(target, "utf8"))
    : [];

  const record = {
    eventId: `evt_${Date.now()}_${events.length + 1}`,
    timestamp: new Date().toISOString(),
    ...event
  };

  events.push(record);

  const temp = `${target}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(events, null, 2));
  fs.renameSync(temp, target);

  return record;
}

function load(playerId) {
  const target = file(playerId);

  if (!fs.existsSync(target)) return [];

  return JSON.parse(fs.readFileSync(target, "utf8"));
}

function clear(playerId) {
  const target = file(playerId);

  if (fs.existsSync(target)) {
    fs.unlinkSync(target);
  }
}

module.exports = {
  append,
  load,
  clear
};
