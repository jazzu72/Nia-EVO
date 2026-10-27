"use strict";

const { createRuntime } = require("../../../core/world-runtime");

let runtime = createRuntime();

function snapshot() {
  return runtime.getState();
}

function choose(nodeId, optionId) {
  const result = runtime.choose(nodeId, optionId);
  return { result, state: snapshot() };
}

function completeMission(missionId) {
  const result = runtime.completeMission(missionId);
  return { result, state: snapshot() };
}

module.exports = { snapshot, choose, completeMission };
