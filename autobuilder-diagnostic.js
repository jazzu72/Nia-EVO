const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const OUT = path.join(ROOT, "reports", "autobuilder-system-scan.json");

const IGNORE = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build"
]);

const report = {
  startedAt: new Date().toISOString(),
  root: ROOT,
  findings: [],
  files: [],
  routes: [],
  requires: [],
  engines: [],
  summary: {}
};

function walk(dir) {
  let out = [];

  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE.has(e.name)) continue;

    const full = path.join(dir, e.name);

    if (e.isDirectory()) {
      out.push(...walk(full));
    } else {
      out.push(full);
    }
  }

  return out;
}

function rel(file) {
  return path.relative(ROOT, file);
}

const files = walk(ROOT);

report.files = files.map(f => ({
  path: rel(f),
  size: fs.statSync(f).size
}));

for (const file of files) {

  if (!/\.(js|cjs|mjs)$/.test(file)) continue;

  let text;

  try {
    text = fs.readFileSync(file, "utf8");
  } catch (e) {
    report.findings.push({
      severity: "HIGH",
      type: "READ_ERROR",
      file: rel(file),
      error: e.message
    });
    continue;
  }

  for (const m of text.matchAll(
    /require\(\s*["']([^"']+)["']\s*\)/g
  )) {
    report.requires.push({
      file: rel(file),
      target: m[1]
    });
  }

  for (const m of text.matchAll(
    /(?:router|app)\.(get|post|put|patch|delete)\(\s*["']([^"']+)["']/g
  )) {
    report.routes.push({
      file: rel(file),
      method: m[1].toUpperCase(),
      route: m[2]
    });
  }

  if (path.basename(file).includes("engine")) {
    report.engines.push(rel(file));
  }

  /*
   * Detect engine.method() calls.
   */
  const calls = [
    ...text.matchAll(
      /\bengine\.([A-Za-z_$][\w$]*)\s*\(/g
    )
  ];

  if (!calls.length) continue;

  /*
   * Find the engine require.
   */
  const engineRequire = text.match(
    /require\(\s*["']([^"']*engine[^"']*)["']\s*\)/
  );

  if (!engineRequire) continue;

  const target = engineRequire[1];

  if (!target.startsWith(".")) continue;

  let resolved;

  try {
    resolved = require.resolve(
      path.resolve(
        path.dirname(file),
        target
      )
    );
  } catch (e) {
    report.findings.push({
      severity: "HIGH",
      type: "ENGINE_RESOLUTION_FAILURE",
      api: rel(file),
      target,
      error: e.message
    });

    continue;
  }

  try {

    delete require.cache[resolved];

    const mod = require(resolved);

    for (const call of calls) {

      const method = call[1];

      if (typeof mod[method] !== "function") {

        report.findings.push({
          severity: "CRITICAL",
          type: "ENGINE_METHOD_MISMATCH",
          api: rel(file),
          engine: rel(resolved),
          method,
          availableExports: Object.keys(mod)
        });

      }

    }

  } catch (e) {

    report.findings.push({
      severity: "HIGH",
      type: "ENGINE_LOAD_FAILURE",
      api: rel(file),
      engine: rel(resolved),
      error: e.message
    });

  }

}

/*
 * Duplicate engine detection.
 */
const duplicateGroups = {};

for (const engine of report.engines) {

  const name = path.basename(engine);

  if (!duplicateGroups[name]) {
    duplicateGroups[name] = [];
  }

  duplicateGroups[name].push(engine);
}

for (const [name, group] of Object.entries(duplicateGroups)) {

  if (group.length > 1) {

    report.findings.push({
      severity: "HIGH",
      type: "DUPLICATE_ENGINE",
      engine: name,
      files: group
    });

  }

}

report.summary = {
  totalFiles: report.files.length,
  javascriptFiles: files.filter(
    f => /\.(js|cjs|mjs)$/.test(f)
  ).length,
  routes: report.routes.length,
  requires: report.requires.length,
  engines: report.engines.length,
  findings: report.findings.length,
  critical: report.findings.filter(
    f => f.severity === "CRITICAL"
  ).length,
  high: report.findings.filter(
    f => f.severity === "HIGH"
  ).length
};

report.finishedAt = new Date().toISOString();

fs.mkdirSync(
  path.dirname(OUT),
  { recursive: true }
);

fs.writeFileSync(
  OUT,
  JSON.stringify(report, null, 2)
);

console.log("");
console.log("==========================================");
console.log(" NIA AUTO BUILDER SYSTEM SCAN");
console.log("==========================================");
console.log("Files:       ", report.summary.totalFiles);
console.log("JS files:    ", report.summary.javascriptFiles);
console.log("Routes:      ", report.summary.routes);
console.log("Requires:    ", report.summary.requires);
console.log("Engines:     ", report.summary.engines);
console.log("Findings:    ", report.summary.findings);
console.log("CRITICAL:    ", report.summary.critical);
console.log("HIGH:        ", report.summary.high);
console.log("");
console.log("REPORT:");
console.log(OUT);
console.log("==========================================");
