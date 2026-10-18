"use strict";

class ExperienceRuntime {
  constructor(definition = {}) {
    this.definition = definition;
    this.state = {
      playerResources: {},
      skills: {},
      relationships: {},
      completedMissions: [],
      unlockedLocations: [],
      decisions: [],
      currentPath: []
    };
  }

  getState() {
    return structuredClone(this.state);
  }

  setState(patch = {}) {
    this.state = {
      ...this.state,
      ...patch
    };
    return this.getState();
  }

  applyEffects(effects = []) {
    for (const effect of effects) {
      if (!effect || !effect.type) continue;

      if (effect.type === "RESOURCE") {
        const key = String(effect.key);
        this.state.playerResources[key] =
          Number(this.state.playerResources[key] || 0) +
          Number(effect.amount || 0);
      }

      if (effect.type === "SKILL") {
        const key = String(effect.key);
        this.state.skills[key] =
          Number(this.state.skills[key] || 0) +
          Number(effect.amount || 0);
      }

      if (effect.type === "RELATIONSHIP") {
        const key = String(effect.key);
        this.state.relationships[key] =
          Number(this.state.relationships[key] || 0) +
          Number(effect.amount || 0);
      }

      if (effect.type === "UNLOCK_LOCATION") {
        if (!this.state.unlockedLocations.includes(effect.location)) {
          this.state.unlockedLocations.push(effect.location);
        }
      }

      if (effect.type === "COMPLETE_MISSION") {
        if (!this.state.completedMissions.includes(effect.missionId)) {
          this.state.completedMissions.push(effect.missionId);
        }
      }
    }

    return this.getState();
  }

  evaluateCondition(condition = {}) {
    if (!condition.type) return true;

    if (condition.type === "RESOURCE_AT_LEAST") {
      return Number(
        this.state.playerResources[condition.key] || 0
      ) >= Number(condition.value || 0);
    }

    if (condition.type === "SKILL_AT_LEAST") {
      return Number(
        this.state.skills[condition.key] || 0
      ) >= Number(condition.value || 0);
    }

    if (condition.type === "MISSION_COMPLETE") {
      return this.state.completedMissions.includes(condition.missionId);
    }

    if (condition.type === "LOCATION_UNLOCKED") {
      return this.state.unlockedLocations.includes(condition.location);
    }

    return false;
  }

  canChoose(option = {}) {
    const conditions = Array.isArray(option.conditions)
      ? option.conditions
      : [];

    return conditions.every(condition =>
      this.evaluateCondition(condition)
    );
  }

  choose(nodeId, optionId) {
    const nodes = this.definition.decisionNodes || [];
    const node = nodes.find(item => item.id === nodeId);

    if (!node) {
      throw new Error("DECISION_NODE_NOT_FOUND");
    }

    const option = (node.options || []).find(
      item => item.id === optionId
    );

    if (!option) {
      throw new Error("DECISION_OPTION_NOT_FOUND");
    }

    if (!this.canChoose(option)) {
      throw new Error("DECISION_OPTION_LOCKED");
    }

    this.applyEffects(option.effects || []);

    this.state.decisions.push({
      nodeId,
      optionId,
      timestamp: new Date().toISOString()
    });

    this.state.currentPath.push(nodeId);

    return {
      nodeId,
      optionId,
      nextNodeId: option.nextNodeId || null,
      reflectionPrompt: node.reflectionPrompt || null,
      state: this.getState()
    };
  }

  snapshot() {
    return {
      runtime: "QUANTUM_EXPERIENCE_RUNTIME",
      version: "0.1.0",
      state: this.getState(),
      definition: this.definition
    };
  }
}

function createRuntime(definition) {
  return new ExperienceRuntime(definition);
}

module.exports = {
  ExperienceRuntime,
  createRuntime
};
