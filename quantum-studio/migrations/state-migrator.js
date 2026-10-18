"use strict";

const CURRENT_SCHEMA_VERSION = "2.0.0";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function migrateV1ToV2(input) {
  const state = clone(input);

  state.schemaVersion = "2.0.0";

  if (!state.playerResources) state.playerResources = {};
  if (!state.skills) state.skills = {};
  if (!state.relationships) state.relationships = {};
  if (!Array.isArray(state.completedMissions)) state.completedMissions = [];
  if (!Array.isArray(state.unlockedLocations)) state.unlockedLocations = [];
  if (!Array.isArray(state.decisions)) state.decisions = [];
  if (!Array.isArray(state.currentPath)) state.currentPath = [];

  if (!state.playerResources.spark_coins) {
    state.playerResources.spark_coins = 0;
  }

  state.migrationHistory = Array.isArray(state.migrationHistory)
    ? state.migrationHistory
    : [];

  state.migrationHistory.push({
    from: "1.0.0",
    to: "2.0.0",
    migration: "STATE_V1_TO_V2",
    deterministic: true
  });

  return state;
}

function migrate(state) {
  if (!state || typeof state !== "object") {
    throw new Error("STATE_OBJECT_REQUIRED");
  }

  const version = state.schemaVersion || "1.0.0";

  if (version === CURRENT_SCHEMA_VERSION) {
    return clone(state);
  }

  if (version === "1.0.0") {
    return migrateV1ToV2(state);
  }

  throw new Error(`UNSUPPORTED_STATE_SCHEMA:${version}`);
}

module.exports = {
  CURRENT_SCHEMA_VERSION,
  migrate,
  migrateV1ToV2
};
