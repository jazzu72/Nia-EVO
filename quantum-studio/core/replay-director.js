"use strict";

const journal = require("./event-journal");
const {
  createTimeline,
  DEFAULT_SHOT_MS
} = require("./timeline-engine");

function describeEvent(event) {
  switch (event.type) {
    case "DECISION_MADE":
      return {
        kind: "decision",
        scene: "decision-moment",
        title: "A Choice Was Made",
        detail: {
          nodeId: event.nodeId || null,
          optionId: event.optionId || null
        }
      };

    case "MISSION_COMPLETED":
      return {
        kind: "mission-complete",
        scene: "mission-finale",
        title: "Mission Completed",
        detail: {
          missionId: event.missionId || null
        }
      };

    default:
      return null;
  }
}

function direct(events, options = {}) {
  if (!Array.isArray(events)) {
    throw new Error("REPLAY_EVENTS_MUST_BE_ARRAY");
  }

  const shotDurationMs = options.shotDurationMs ?? DEFAULT_SHOT_MS;

  if (!Number.isFinite(shotDurationMs) ||
      shotDurationMs <= 0 ||
      shotDurationMs > 30 * 60 * 1000) {
    throw new Error("INVALID_SHOT_DURATION");
  }

  const shots = [];
  let cursorMs = 0;

  for (const event of events) {
    if (!event || typeof event !== "object") continue;

    const description = describeEvent(event);
    if (!description) continue;

    shots.push({
      id: String(event.eventId || `replay-shot-${shots.length + 1}`),
      sourceEventId: event.eventId || null,
      sourceTimestamp: event.timestamp || null,
      kind: description.kind,
      scene: description.scene,
      title: description.title,
      detail: description.detail,
      startMs: cursorMs,
      durationMs: shotDurationMs,
      camera: {
        movement: description.kind === "mission-complete"
          ? "slow-push-in"
          : "gentle-dolly",
        framing: description.kind === "mission-complete"
          ? "wide-to-medium"
          : "medium"
      },
      keyframes: [
        { atMs: 0, property: "opacity", value: 0 },
        { atMs: 500, property: "opacity", value: 1 }
      ]
    });

    cursorMs += shotDurationMs;
  }

  return createTimeline({
    title: options.title || "Event Replay",
    source: options.source || "event-journal",
    shots
  });
}

function directPlayer(playerId, options = {}) {
  if (typeof playerId !== "string" ||
      !/^[a-zA-Z0-9_-]+$/.test(playerId)) {
    throw new Error("INVALID_PLAYER_ID");
  }

  const events = journal.load(playerId);
  return direct(events, {
    ...options,
    title: options.title || `Replay: ${playerId}`
  });
}

module.exports = {
  direct,
  directPlayer,
  describeEvent
};
