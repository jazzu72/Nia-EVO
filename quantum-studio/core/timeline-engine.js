"use strict";

const DEFAULT_SHOT_MS = 4000;
const MAX_TIMELINE_MS = 30 * 60 * 1000;

function finiteNumber(value, name) {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`INVALID_${name.toUpperCase()}`);
  }
  return value;
}

function validateShot(shot, index) {
  if (!shot || typeof shot !== "object") {
    throw new Error(`INVALID_SHOT:${index}`);
  }

  if (typeof shot.id !== "string" || !shot.id.trim()) {
    throw new Error(`INVALID_SHOT_ID:${index}`);
  }

  const startMs = finiteNumber(shot.startMs, "start_ms");
  const durationMs = finiteNumber(shot.durationMs, "duration_ms");

  if (durationMs <= 0) {
    throw new Error(`INVALID_SHOT_DURATION:${shot.id}`);
  }

  if (startMs + durationMs > MAX_TIMELINE_MS) {
    throw new Error(`TIMELINE_LIMIT_EXCEEDED:${shot.id}`);
  }

  const keyframes = shot.keyframes || [];
  if (!Array.isArray(keyframes)) {
    throw new Error(`INVALID_KEYFRAMES:${shot.id}`);
  }

  for (const frame of keyframes) {
    if (!frame || typeof frame !== "object") {
      throw new Error(`INVALID_KEYFRAME:${shot.id}`);
    }

    finiteNumber(frame.atMs, "keyframe_time");

    if (frame.atMs > durationMs) {
      throw new Error(`KEYFRAME_OUTSIDE_SHOT:${shot.id}`);
    }
  }

  return {
    ...shot,
    startMs,
    durationMs,
    keyframes: keyframes.map(frame => ({ ...frame }))
  };
}

function createTimeline(input = {}) {
  if (!Array.isArray(input.shots)) {
    throw new Error("TIMELINE_SHOTS_REQUIRED");
  }

  const ids = new Set();
  const shots = input.shots
    .map(validateShot)
    .sort((a, b) => a.startMs - b.startMs);

  for (const shot of shots) {
    if (ids.has(shot.id)) {
      throw new Error(`DUPLICATE_SHOT_ID:${shot.id}`);
    }
    ids.add(shot.id);
  }

  const durationMs = shots.reduce(
    (end, shot) => Math.max(end, shot.startMs + shot.durationMs),
    0
  );

  return {
    schemaVersion: "1.0.0",
    title: input.title || "Untitled Timeline",
    source: input.source || "manual",
    durationMs,
    shots
  };
}

function validateTimeline(timeline) {
  try {
    const normalized = createTimeline(timeline);
    return {
      valid: true,
      errors: [],
      durationMs: normalized.durationMs,
      shotCount: normalized.shots.length
    };
  } catch (error) {
    return {
      valid: false,
      errors: [error.message],
      durationMs: null,
      shotCount: 0
    };
  }
}

module.exports = {
  createTimeline,
  validateTimeline,
  DEFAULT_SHOT_MS,
  MAX_TIMELINE_MS
};
