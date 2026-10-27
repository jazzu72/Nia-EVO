"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

const STUDIO = {
  name: "Quantum Studio",
  version: "0.1.0",
  owner: "House of Jazzu",
  executive: "Nia",
  mission: "Create, build, restore, modernize, and evolve House of Jazzu intellectual property across media and technology.",
  capabilities: [
    "software",
    "games",
    "film",
    "animation",
    "manga",
    "interactive-worlds",
    "artifact-recovery",
    "creative-archive",
    "technology-evolution"
  ],
  execution: {
    autonomousResearch: true,
    autonomousGeneration: true,
    autonomousTesting: true,
    externalExecution: false,
    productionRelease: "OWNER_AUTHORIZATION_REQUIRED"
  },
  adapters: [
    "flutter",
    "unity",
    "web",
    "film",
    "animation",
    "manga",
    "game"
  ]
};

function listAdapters() {
  return STUDIO.adapters.map(name => ({
    name,
    path: path.join(ROOT, "adapters", name),
    status: fs.existsSync(path.join(ROOT, "adapters", name))
      ? "READY"
      : "PLANNED"
  }));
}

function status() {
  return {
    ok: true,
    system: "QUANTUM_STUDIO",
    studio: STUDIO.name,
    version: STUDIO.version,
    executive: STUDIO.executive,
    capabilities: STUDIO.capabilities,
    adapters: listAdapters(),
    execution: STUDIO.execution
  };
}

module.exports = { STUDIO, listAdapters, status };
