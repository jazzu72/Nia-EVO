"use strict";

const fs = require("fs");
const path = require("path");
const registry = require("../../core/adapter-registry");

const ADAPTER = "unity";
const WORLD_PATH = path.join(__dirname, "..", "..", "worlds", "money-munchkins", "world.json");

function loadWorld() {
  const world = JSON.parse(fs.readFileSync(WORLD_PATH, "utf8"));
  const compatibility = registry.validate(ADAPTER);

  if (!compatibility.compatible) throw new Error("UNITY_ADAPTER_SCHEMA_INCOMPATIBLE");
  if (!world.schemaVersion || !world.worldVersion || !world.contentVersion)
    throw new Error("WORLD_VERSION_METADATA_MISSING");

  return {
    adapter: ADAPTER,
    schemaVersion: world.schemaVersion,
    worldVersion: world.worldVersion,
    contentVersion: world.contentVersion,
    world
  };
}

function manifest() {
  const adapter = registry.get(ADAPTER);
  return {
    id: adapter.id,
    name: adapter.name,
    platform: adapter.platform,
    engine: "UNITY",
    schemaVersions: adapter.supportedSchema,
    capabilities: adapter.capabilities,
    sourceOfTruth: "quantum-studio/worlds/money-munchkins/world.json"
  };
}

module.exports = { loadWorld, manifest };
