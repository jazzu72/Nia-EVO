"use strict";

const timelineEngine = require("./timeline-engine");
const replayDirector = require("./replay-director");

const DEFAULT_STEP_MS = 1000;
const MAX_PLAN_FRAMES = 10000;

function normalizeTimeline(input) {
  if (!input || typeof input !== "object") {
    throw new Error("CINEMATIC_TIMELINE_REQUIRED");
  }
  return timelineEngine.createTimeline({
    ...input,
    source: input.source || "cinematic-sequencer"
  });
}

function compose(input) {
  return normalizeTimeline(input);
}

function fromEvents(events, options = {}) {
  return replayDirector.direct(events, {
    ...options,
    source: options.source || "cinematic-replay"
  });
}

function fromPlayer(playerId, options = {}) {
  return replayDirector.directPlayer(playerId, {
    ...options,
    source: options.source || "cinematic-replay"
  });
}

function frameAt(input, atMs) {
  const timeline = normalizeTimeline(input);

  if (!Number.isFinite(atMs) || atMs < 0 ||
      atMs > timeline.durationMs) {
    throw new Error("INVALID_PLAYBACK_POSITION");
  }

  const shot = timeline.shots.find(item =>
    atMs >= item.startMs &&
    atMs < item.startMs + item.durationMs
  );

  return {
    timelineTitle: timeline.title,
    atMs,
    ended: atMs === timeline.durationMs,
    shot: shot || null,
    shotLocalMs: shot ? atMs - shot.startMs : null,
    progress: timeline.durationMs === 0
      ? 1
      : atMs / timeline.durationMs
  };
}

function createPlaybackPlan(input, options = {}) {
  const timeline = normalizeTimeline(input);
  const stepMs = options.stepMs ?? DEFAULT_STEP_MS;

  if (!Number.isFinite(stepMs) || stepMs <= 0) {
    throw new Error("INVALID_PLAYBACK_STEP");
  }

  const frameCount = Math.floor(timeline.durationMs / stepMs) + 1;
  if (frameCount + 1 > MAX_PLAN_FRAMES) {
    throw new Error("PLAYBACK_PLAN_TOO_LARGE");
  }

  const frames = [];
  for (let atMs = 0; atMs <= timeline.durationMs; atMs += stepMs) {
    frames.push(frameAt(timeline, atMs));
  }

  if (frames.length === 0 ||
      frames[frames.length - 1].atMs !== timeline.durationMs) {
    frames.push(frameAt(timeline, timeline.durationMs));
  }

  return {
    schemaVersion: "1.0.0",
    title: timeline.title,
    durationMs: timeline.durationMs,
    shotCount: timeline.shots.length,
    frameCount: frames.length,
    frames
  };
}

module.exports = {
  compose,
  fromEvents,
  fromPlayer,
  frameAt,
  createPlaybackPlan,
  DEFAULT_STEP_MS,
  MAX_PLAN_FRAMES
};
