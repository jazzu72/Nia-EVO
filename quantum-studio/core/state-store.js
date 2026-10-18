"use strict";

const fs = require("fs");
const path = require("path");
const { migrate, CURRENT_SCHEMA_VERSION } = require("../migrations/state-migrator");

const STORE_DIR = path.join(__dirname, "..", "worlds", "money-munchkins", "states");

function ensureStore() {
  fs.mkdirSync(STORE_DIR, { recursive: true });
}

function statePath(playerId) {
  if (!/^[a-zA-Z0-9_-]+$/.test(playerId)) {
    throw new Error("INVALID_PLAYER_ID");
  }
  return path.join(STORE_DIR, `${playerId}.json`);
}

function save(playerId, state) {
  ensureStore();

  const migrated = migrate(state);

  const record = {
    playerId,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    savedAt: new Date().toISOString(),
    state: migrated
  };

  const target = statePath(playerId);
  const temp = `${target}.tmp`;

  fs.writeFileSync(temp, JSON.stringify(record, null, 2));
  fs.renameSync(temp, target);

  return record;
}

function load(playerId) {
  const target = statePath(playerId);

  if (!fs.existsSync(target)) {
    return null;
  }

  const record = JSON.parse(fs.readFileSync(target, "utf8"));

  record.state = migrate(record.state);
  record.schemaVersion = CURRENT_SCHEMA_VERSION;

  return record;
}

function remove(playerId) {
  const target = statePath(playerId);

  if (fs.existsSync(target)) {
    fs.unlinkSync(target);
  }
}

module.exports = {
  save,
  load,
  remove,
  STORE_DIR
};
