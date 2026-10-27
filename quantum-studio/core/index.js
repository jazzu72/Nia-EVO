"use strict";

const path = require("node:path");

const modules = [
  "project-engine",
  "studio",
  "world-runtime",
  "experience-runtime",
  "world-conformance",
  "state-store",
  "event-journal",
  "event-engine",
  "event-replay",
  "condition-engine",
  "progression-engine",
  "adapter-registry",
  "player-session",
  "conformance-runner",
  "timeline-engine",
  "replay-director",
  "cinematic-sequencer",
  "render-queue",
  "ffmpeg-renderer"
];

function inspect() {
  const results = {};

  for (const name of modules) {
    try {
      results[name] = {
        status: "READY",
        exports: Object.keys(require(path.join(__dirname, name)))
      };
    } catch (error) {
      results[name] = {
        status: "ERROR",
        error: error.message
      };
    }
  }

  const errors = Object.entries(results)
    .filter(([, result]) => result.status !== "READY");

  return {
    name: "Quantum Studio",
    status: errors.length ? "DEGRADED" : "READY",
    modules: results,
    errors: errors.map(([name, result]) => ({ name, ...result }))
  };
}

function getModule(name) {
  if (!modules.includes(name)) {
    throw new Error(`UNKNOWN_CORE_MODULE:${name}`);
  }

  return require(path.join(__dirname, name));
}

module.exports = { modules: [...modules], inspect, getModule };
