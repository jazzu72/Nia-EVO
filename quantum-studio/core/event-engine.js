"use strict";

const { evaluate } = require("./condition-engine");

function processEvents(events, state) {
  const triggered = [];

  for (const event of events || []) {
    if (!evaluate(event.trigger, state)) continue;

    triggered.push(event);

    const effect = event.effect;

    switch (effect.type) {
      case "UNLOCK_LOCATION":
        state.unlockedLocations ||= [];
        if (!state.unlockedLocations.includes(effect.locationId)) {
          state.unlockedLocations.push(effect.locationId);
        }
        break;

      default:
        throw new Error(`UNSUPPORTED_EVENT_EFFECT:${effect.type}`);
    }
  }

  return triggered;
}

module.exports = { processEvents };
