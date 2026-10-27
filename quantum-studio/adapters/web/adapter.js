"use strict";

const path = require("path");
const registry = require("../../core/adapter-registry");
const fs = require("fs");

const ADAPTER = "web";

function loadWorld() {
  const worldPath = path.join(__dirname, "..", "..", "worlds", "money-munchkins", "world.json");
  const world = JSON.parse(fs.readFileSync(worldPath, "utf8"));
  const result = { world, valid: !!(world.schemaVersion && world.worldVersion && world.contentVersion), errors: [] };

  if (!result.valid) {
    throw new Error(`WORLD_CONTRACT_INVALID:${result.errors.join(",")}`);
  }

  const compatibility = registry.validate(ADAPTER);

  if (!compatibility.compatible) {
    throw new Error("WEB_ADAPTER_SCHEMA_INCOMPATIBLE");
  }

  return {
    adapter: ADAPTER,
    schemaVersion: result.world.schemaVersion,
    worldVersion: result.world.worldVersion,
    contentVersion: result.world.contentVersion,
    world: result.world
  };
}

function manifest() {
  return {
    id: "adapter_web",
    platform: "web",
    engine: "WEB_RUNTIME",
    capabilities: registry.get(ADAPTER).capabilities,
    sourceOfTruth: path.relative(process.cwd(), path.join(
      __dirname,
      "..",
      "..",
      "worlds",
      "money-munchkins",
      "world.json"
    ))
  };
}

module.exports = {
  loadWorld,
  manifest
};
