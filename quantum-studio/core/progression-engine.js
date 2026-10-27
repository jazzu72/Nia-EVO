"use strict";

const { processEvents } = require("./event-engine");

function completeMission(mission, state, events = []) {
  if (!mission || !mission.id) throw new Error("INVALID_MISSION");

  state.completedMissions ||= [];
  state.playerResources ||= {};
  state.skills ||= {};

  if (state.completedMissions.includes(mission.id)) {
    return { completed: false, alreadyCompleted: true, triggeredEvents: [] };
  }

  state.completedMissions.push(mission.id);

  const reward = mission.reward || {};

  if (typeof reward.spark_coins === "number") {
    state.playerResources.spark_coins =
      (state.playerResources.spark_coins || 0) + reward.spark_coins;
  }

  if (typeof reward.xp === "number") {
    state.playerResources.xp =
      (state.playerResources.xp || 0) + reward.xp;
  }

  if (typeof mission.skill === "string") {
    state.skills[mission.skill] =
      (state.skills[mission.skill] || 0) + 1;
  }

  const triggeredEvents = processEvents(events, state);

  return {
    completed: true,
    alreadyCompleted: false,
    missionId: mission.id,
    reward,
    triggeredEvents
  };
}

function getProgress(missions, state) {
  const completed = state.completedMissions || [];

  return {
    total: missions.length,
    completed: missions.filter(m => completed.includes(m.id)).length,
    remaining: missions.filter(m => !completed.includes(m.id)).map(m => m.id)
  };
}

module.exports = { completeMission, getProgress };
