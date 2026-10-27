"use strict";

const { createRuntime } = require("./world-runtime");
const stateStore = require("./state-store");
const journal = require("./event-journal");

function createSession(playerId) {
  if (!/^[a-zA-Z0-9_-]+$/.test(playerId))
    throw new Error("INVALID_PLAYER_ID");

  const saved = stateStore.load(playerId);
  const runtime = createRuntime(saved?.state, playerId, true);

  return {
    playerId,

    state() {
      return runtime.getState();
    },

    choose(nodeId, optionId) {
      const result = runtime.choose(nodeId, optionId);
      stateStore.save(playerId, runtime.getState());
      return result;
    },

    completeMission(missionId) {
      const result = runtime.completeMission(missionId);
      stateStore.save(playerId, runtime.getState());
      return result;
    },

    events() {
      return journal.load(playerId);
    }
  };
}

module.exports = { createSession };
