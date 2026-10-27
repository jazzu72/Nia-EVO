"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { createTimeline } = require("./timeline-engine");

const DEFAULT_FONT =
  "/data/data/com.termux/files/usr/share/fonts/TTF/DejaVuSans.ttf";
const PALETTE = [
  "0B1F33", "123C45", "28304A", "3B2855",
  "174A3A", "5A3825", "243B64", "303030"
];

function run(command, args) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    maxBuffer: 4 * 1024 * 1024
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      "FFMPEG_FAILED: " +
      String(result.stderr || result.stdout || "unknown error").slice(-3000)
    );
  }
  return result;
}

function checkPrerequisites(ffmpeg, font) {
  if (!fs.existsSync(font)) throw new Error("RENDER_FONT_NOT_FOUND");
  for (const args of [["-version"], ["-hide_banner", "-encoders"], ["-hide_banner", "-filters"]]) {
    const r = spawnSync(ffmpeg, args, { encoding: "utf8", maxBuffer: 4 * 1024 * 1024 });
    if (r.error || r.status !== 0) throw new Error(args[0] === "-version" ? "FFMPEG_NOT_AVAILABLE" : "FFMPEG_CAPABILITY_CHECK_FAILED");
    if (args.includes("-encoders") && !/\blibx264\b/.test(r.stdout || "")) throw new Error("FFMPEG_H264_ENCODER_UNAVAILABLE");
    if (args.includes("-filters") && !/\bdrawtext\b/.test(r.stdout || "")) throw new Error("FFMPEG_DRAWTEXT_FILTER_UNAVAILABLE");
  }
}

function renderJob(job, options = {}) {
  if (!job || !job.specification || !job.id) {
    throw new Error("INVALID_RENDER_JOB");
  }

  const timeline = createTimeline(job.specification);
  const target = job.specification.target || "web";
  if (!["web", "film", "animation"].includes(target)) {
    throw new Error("UNSUPPORTED_RENDER_TARGET");
  }
  if (!timeline.shots.length) throw new Error("RENDER_TIMELINE_EMPTY");

  const ffmpeg = options.ffmpeg || "ffmpeg";
  const font = options.font || DEFAULT_FONT;
  const width = options.width || 1280;
  const height = options.height || 720;
  const fps = options.fps || 24;
  const fontSize = options.fontSize || 42;

  checkPrerequisites(ffmpeg, font);
  if (width < 320 || height < 240 || fps < 1 || fps > 60) {
    throw new Error("INVALID_RENDER_SETTINGS");
  }

  const outputRoot = path.resolve(
    options.outputDir ||
    path.join(__dirname, "..", "worlds", "money-munchkins", "renders")
  );
  const targetDir = path.join(outputRoot, target);
  fs.mkdirSync(targetDir, { recursive: true });

  const outputPath = path.join(targetDir, `${job.id}.mp4`);
  if (fs.existsSync(outputPath)) {
    throw new Error("RENDER_OUTPUT_ALREADY_EXISTS");
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "quantum-render-"));
  const segments = [];
  let cursorMs = 0;

  function makeSegment(durationMs, label, index) {
    if (durationMs <= 0) return;

    const duration = (durationMs / 1000).toFixed(3);
    const segmentPath = path.join(
      tempDir, `segment-${String(index).padStart(4, "0")}.mp4`
    );
    const args = [
      "-hide_banner", "-loglevel", "error", "-y",
      "-f", "lavfi", "-i",
      `color=c=${PALETTE[index % PALETTE.length]}:s=${width}x${height}:r=${fps}:d=${duration}`
    ];

    if (label !== null) {
      const textPath = path.join(tempDir, `title-${index}.txt`);
      fs.writeFileSync(textPath, String(label).slice(0, 500), "utf8");
      args.push(
        "-vf",
        `drawtext=fontfile=${font}:textfile=${textPath}:fontcolor=white:fontsize=${fontSize}:x=(w-text_w)/2:y=(h-text_h)/2:box=1:boxcolor=black@0.45:boxborderw=24`
      );
    }

    args.push(
      "-an", "-c:v", "libx264", "-preset", "ultrafast",
      "-pix_fmt", "yuv420p", "-t", duration,
      "-movflags", "+faststart", segmentPath
    );

    run(ffmpeg, args);
    segments.push(segmentPath);
  }

  try {
    let index = 0;

    for (const shot of timeline.shots) {
      if (shot.startMs < cursorMs) {
        throw new Error(`OVERLAPPING_SHOTS_UNSUPPORTED:${shot.id}`);
      }

      if (shot.startMs > cursorMs) {
        makeSegment(shot.startMs - cursorMs, null, index++);
      }

      makeSegment(
        shot.durationMs,
        shot.title || shot.label || shot.id,
        index++
      );
      cursorMs = shot.startMs + shot.durationMs;
    }

    if (!segments.length) throw new Error("NO_RENDER_SEGMENTS");

    const listPath = path.join(tempDir, "concat.txt");
    const concatText = segments
      .map(file => `file '${file.replace(/'/g, "'\\''")}'`)
      .join("\n") + "\n";
    fs.writeFileSync(listPath, concatText, "utf8");

    run(ffmpeg, [
      "-hide_banner", "-loglevel", "error",
      "-f", "concat", "-safe", "0", "-i", listPath,
      "-c", "copy", "-movflags", "+faststart", outputPath
    ]);

    const stat = fs.statSync(outputPath);
    if (!stat.size) throw new Error("RENDER_OUTPUT_EMPTY");

    return {
      outputPath,
      sizeBytes: stat.size,
      durationMs: cursorMs,
      format: "mp4",
      videoCodec: "h264"
    };
  } catch (error) {
    try {
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    } catch {}
    throw error;
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

function processNext(queue, options = {}) {
  const job = queue.list({ state: "pending" })[0];
  if (!job) return { processed: false, reason: "QUEUE_EMPTY" };

  queue.transition(job.id, "running");

  try {
    const result = renderJob(job, options);
    const completed = queue.transition(job.id, "completed", { result });
    return { processed: true, job: completed };
  } catch (error) {
    const failed = queue.transition(job.id, "failed", {
      error: error.message
    });
    return { processed: true, job: failed };
  }
}

module.exports = { renderJob, processNext, DEFAULT_FONT };
