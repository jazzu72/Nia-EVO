"use strict";

const fs = require("fs");
const path = require("path");
const { migrate, CURRENT_SCHEMA_VERSION } = require("../migrations/state-migrator");
const journal = require("./event-journal");

const WORLD_PATH = path.join(
  __dirname,
  "..",
  "worlds",
  "money-munchkins",
  "world.json"
);

function loadWorld() {
  const world = JSON.parse(fs.readFileSync(WORLD_PATH, "utf8"));

  if (world.schemaVersion !== CURRENT_SCHEMA_VERSION) {
    throw new Error(
      `WORLD_SCHEMA_MISMATCH:${world.schemaVersion}:${CURRENT_SCHEMA_VERSION}`
    );
  }

  return world;
}

function createRuntime(initialState, playerId = "local-player", journaling = true) {
  const world = loadWorld();

  let state = migrate(
    initialState || world.startingState
  );

  function getValue(group, key) {
    return Number(
      state[group] &&
      state[group][key] !== undefined
        ? state[group][key]
        : 0
    );
  }

  function applyEffect(effect) {
    switch (effect.type) {
      case "RESOURCE":
        if (!state.playerResources) state.playerResources = {};
        state.playerResources[effect.key] =
          getValue("playerResources", effect.key) +
          Number(effect.amount || 0);
        break;

      case "SKILL":
        if (!state.skills) state.skills = {};
        state.skills[effect.key] =
          getValue("skills", effect.key) +
          Number(effect.amount || 0);
        break;

      case "RELATIONSHIP":
        if (!state.relationships) state.relationships = {};
        state.relationships[effect.key] =
          getValue("relationships", effect.key) +
          Number(effect.amount || 0);
        break;

      case "UNLOCK_LOCATION":
        if (!state.unlockedLocations.includes(effect.locationId)) {
          state.unlockedLocations.push(effect.locationId);
        }
        break;

      case "COMPLETE_MISSION":
        if (!state.completedMissions.includes(effect.missionId)) {
          state.completedMissions.push(effect.missionId);
        }
        break;

      default:
        throw new Error(`UNKNOWN_EFFECT:${effect.type}`);
    }
  }

  function conditionMet(condition) {
    switch (condition.type) {
      case "SKILL_AT_LEAST":
        return getValue("skills", condition.key) >= Number(condition.amount);

      case "RESOURCE_AT_LEAST":
        return getValue("playerResources", condition.key) >= Number(condition.amount);

      case "MISSION_COMPLETE":
        return state.completedMissions.includes(condition.missionId);

      case "LOCATION_UNLOCKED":
        return state.unlockedLocations.includes(condition.locationId);

      default:
        throw new Error(`UNKNOWN_CONDITION:${condition.type}`);
    }
  }

  function processEvents() {
    const triggered = [];

    for (const event of world.events || []) {
      if (conditionMet(event.trigger)) {
        applyEffect(event.effect);
        triggered.push(event.id);
      }
    }

    return triggered;
  }

  function choose(nodeId, optionId) {
    const node = world.decisionNodes.find(
      n => n.id === nodeId
    );

    if (!node) {
      throw new Error(`DECISION_NODE_NOT_FOUND:${nodeId}`);
    }

    const option = node.options.find(
      o => o.id === optionId
    );

    if (!option) {
      throw new Error(`DECISION_OPTION_NOT_FOUND:${optionId}`);
    }

    for (const effect of option.effects || []) {
      applyEffect(effect);
    }

    state.decisions.push({
      nodeId,
      optionId
    });

    if (!state.currentPath.length) {
      state.currentPath.push("MMQ-003");
    }

    state.currentPath.push(nodeId);
    state.currentPath.push(option.nextNodeId);

    const triggeredEvents = processEvents();

    if (journaling) {
      journal.append(playerId, {
        type: "DECISION_MADE",
        nodeId,
        optionId,
        nextNodeId: option.nextNodeId,
        triggeredEvents
      });
    }

    return {
      nodeId,
      optionId,
      nextNodeId: option.nextNodeId,
      reflectionPrompt: node.reflectionPrompt || null,
      triggeredEvents,
      state: getState()
    };
  }

  function completeMission(missionId) {
    const mission = world.missions.find(
      m => m.id === missionId
    );

    if (!mission) {
      throw new Error(`MISSION_NOT_FOUND:${missionId}`);
    }

    applyEffect({
      type: "COMPLETE_MISSION",
      missionId
    });

    for (const [key, amount] of Object.entries(
      mission.reward || {}
    )) {
      if (key === "spark_coins") {
        applyEffect({
          type: "RESOURCE",
          key,
          amount
        });
      }
    }

    const triggeredEvents = processEvents();

    if (journaling) {
      journal.append(playerId, {
        type: "MISSION_COMPLETED",
        missionId,
        triggeredEvents
      });
    }

    return {
      missionId,
      completed: true,
      triggeredEvents,
      state: getState()
    };
  }

  function getState() {
    return JSON.parse(JSON.stringify(state));
  }

  return {
    world,
    getState,
    choose,
    completeMission,
    processEvents
  };
}

module.exports = {
  loadWorld,
  createRuntime
};
