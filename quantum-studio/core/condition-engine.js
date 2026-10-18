"use strict";

function evaluate(condition, state) {
  if (!condition || !condition.type) return false;

  switch (condition.type) {
    case "SKILL_AT_LEAST":
      return (state.skills?.[condition.key] || 0) >= condition.amount;

    case "RESOURCE_AT_LEAST":
      return (state.playerResources?.[condition.key] || 0) >= condition.amount;

    case "MISSION_COMPLETE":
      return (state.completedMissions || []).includes(condition.missionId);

    case "LOCATION_UNLOCKED":
      return (state.unlockedLocations || []).includes(condition.locationId);

    default:
      throw new Error(`UNSUPPORTED_CONDITION:${condition.type}`);
  }
}

function evaluateAll(conditions, state) {
  return Object.fromEntries(
    (conditions || []).map(condition => [
      condition.id,
      evaluate(condition, state)
    ])
  );
}

module.exports = { evaluate, evaluateAll };
