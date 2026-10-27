"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { createTimeline } = require("./timeline-engine");

const VALID_TARGETS = new Set(["web", "film", "animation"]);
const VALID_STATES = new Set(["pending", "running", "completed", "failed"]);
const DEFAULT_STORE = path.join(
  __dirname, "..", "worlds", "money-munchkins",
  "render-queue", "jobs.json"
);

function stableId(value) {
  return "render-" + crypto.createHash("sha256")
    .update(JSON.stringify(value)).digest("hex").slice(0, 20);
}

function prepareJob(input) {
  if (!input || typeof input !== "object") {
    throw new Error("RENDER_JOB_REQUIRED");
  }

  const target = input.target || "web";
  if (!VALID_TARGETS.has(target)) {
    throw new Error("UNSUPPORTED_RENDER_TARGET");
  }

  const timeline = createTimeline(input.timeline || {});
  if (!timeline.shots.length) throw new Error("RENDER_TIMELINE_EMPTY");

  const specification = {
    schemaVersion: "1.0.0",
    target,
    title: timeline.title,
    source: timeline.source,
    durationMs: timeline.durationMs,
    shots: timeline.shots
  };

  return {
    id: stableId(specification),
    state: "pending",
    createdAt: input.createdAt || null,
    specification,
    result: null,
    error: null
  };
}

function createQueue(options = {}) {
  const filePath = options.filePath || DEFAULT_STORE;
  const jobs = new Map();

  function persist() {
    const directory = path.dirname(filePath);
    fs.mkdirSync(directory, { recursive: true });

    const record = {
      schemaVersion: "1.0.0",
      updatedAt: new Date().toISOString(),
      jobs: Array.from(jobs.values())
    };

    const temp = filePath + "." + process.pid + ".tmp";
    try {
      fs.writeFileSync(temp, JSON.stringify(record, null, 2), {
        encoding: "utf8",
        flag: "w"
      });
      fs.renameSync(temp, filePath);
    } catch (error) {
      try { if (fs.existsSync(temp)) fs.unlinkSync(temp); } catch {}
      throw error;
    }
  }

  if (fs.existsSync(filePath)) {
    let record;
    try {
      record = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch {
      throw new Error("INVALID_RENDER_QUEUE_STORE_JSON");
    }

    if (!record || record.schemaVersion !== "1.0.0" ||
        !Array.isArray(record.jobs)) {
      throw new Error("INVALID_RENDER_QUEUE_STORE_SCHEMA");
    }

    let recovered = false;
    for (const job of record.jobs) {
      if (!job || typeof job.id !== "string" ||
          !VALID_STATES.has(job.state) || !job.specification ||
          jobs.has(job.id)) {
        throw new Error("INVALID_RENDER_QUEUE_STORE_JOB");
      }

      const restored = { ...job };
      if (restored.state === "running") {
        restored.state = "pending";
        restored.error = null;
        recovered = true;
      }
      jobs.set(restored.id, restored);
    }

    if (recovered) persist();
  }

  function enqueue(input) {
    const job = prepareJob(input);
    const existing = jobs.get(job.id);
    if (existing) return { ...existing, duplicate: true };

    jobs.set(job.id, job);
    try {
      persist();
    } catch (error) {
      jobs.delete(job.id);
      throw error;
    }
    return { ...job, duplicate: false };
  }

  function transition(id, nextState, details = {}) {
    const current = jobs.get(id);
    if (!current) throw new Error("RENDER_JOB_NOT_FOUND");
    if (!VALID_STATES.has(nextState)) throw new Error("INVALID_RENDER_STATE");

    const allowed = {
      pending: ["running", "failed"],
      running: ["completed", "failed"],
      completed: [],
      failed: []
    };

    if (!allowed[current.state].includes(nextState)) {
      throw new Error("INVALID_RENDER_TRANSITION:" +
        current.state + "->" + nextState);
    }

    const updated = {
      ...current,
      state: nextState,
      result: nextState === "completed"
        ? (details.result || null) : current.result,
      error: nextState === "failed"
        ? String(details.error || "RENDER_FAILED") : null
    };

    jobs.set(id, updated);
    try {
      persist();
    } catch (error) {
      jobs.set(id, current);
      throw error;
    }
    return { ...updated };
  }

  function get(id) {
    const job = jobs.get(id);
    return job ? { ...job } : null;
  }

  function list(filter = {}) {
    return Array.from(jobs.values())
      .filter(job => !filter.state || job.state === filter.state)
      .map(job => ({ ...job }));
  }

  function counts() {
    const result = {
      pending: 0, running: 0, completed: 0, failed: 0,
      total: jobs.size
    };
    for (const job of jobs.values()) result[job.state]++;
    return result;
  }

  return { enqueue, transition, get, list, counts };
}

module.exports = {
  createQueue, prepareJob, VALID_TARGETS, VALID_STATES, DEFAULT_STORE
};
