"use strict";

const { createRuntime } = require("./world-runtime");
const journal = require("./event-journal");

function replay(playerId) {
  const events = journal.load(playerId);

  const runtime = createRuntime(undefined, `replay-${playerId}`, false);

  for (const event of events) {
    if (event.type === "DECISION_MADE") {
      runtime.choose(event.nodeId, event.optionId);
    } else if (event.type === "MISSION_COMPLETED") {
      runtime.completeMission(event.missionId);
    }
  }

  return {
    playerId,
    eventCount: events.length,
    state: runtime.getState()
  };
}

module.exports = { replay };
