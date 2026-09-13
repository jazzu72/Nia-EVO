const fs = require("fs");
const path = require("path");
const cp = require("child_process");

const ROOT = process.cwd();
const REGISTRY = path.join(ROOT, "autobuilder-canonical.json");

const registry = JSON.parse(
  fs.readFileSync(REGISTRY, "utf8")
);

const report = {
  startedAt: new Date().toISOString(),
  engines: [],
  failures: [],
  warnings: []
};

function absolute(file) {
  return path.resolve(ROOT, file);
}

function exists(file) {
  return fs.existsSync(absolute(file));
}

function loadEngine(file) {
  const full = absolute(file);

  try {
    delete require.cache[require.resolve(full)];
    return require(full);
  } catch (e) {
    return {
      __loadError: e.message
    };
  }
}

console.log("");
console.log("==========================================");
console.log(" NIA AUTO BUILDER — CANONICAL ENGINE CHECK");
console.log("==========================================");
console.log("");

for (const [name, config] of Object.entries(registry.engines)) {

  const file = config.canonical;

  console.log(`🔎 ${name}`);
  console.log(`   CANONICAL: ${file}`);

  if (!exists(file)) {
    report.failures.push({
      engine: name,
      type: "CANONICAL_MISSING",
      file
    });

    console.log("   ❌ CANONICAL FILE MISSING");
    continue;
  }

  const syntax = cp.spawnSync(
    process.execPath,
    ["--check", absolute(file)],
    { encoding: "utf8" }
  );

  if (syntax.status !== 0) {
    report.failures.push({
      engine: name,
      type: "CANONICAL_SYNTAX_ERROR",
      file,
      error: syntax.stderr
    });

    console.log("   ❌ SYNTAX FAILURE");
    continue;
  }

  const mod = loadEngine(file);

  if (mod.__loadError) {
    report.failures.push({
      engine: name,
      type: "CANONICAL_LOAD_FAILURE",
      file,
      error: mod.__loadError
    });

    console.log("   ❌ LOAD FAILURE");
    continue;
  }

  const exports = Object.keys(mod);

  console.log(
    "   EXPORTS:",
    exports.join(", ")
  );

  if (config.contract) {

    for (const method of config.contract) {

      if (typeof mod[method] !== "function") {

        report.failures.push({
          engine: name,
          type: "CANONICAL_CONTRACT_FAILURE",
          file,
          method,
          exports
        });

        console.log(
          `   ❌ missing method: ${method}`
        );

      } else {

        console.log(
          `   ✅ ${method}`
        );

      }
    }
  }

  report.engines.push({
    name,
    canonical: file,
    exports
  });

  console.log("");
}

report.finishedAt = new Date().toISOString();

const out = path.join(
  ROOT,
  "reports/autobuilder-canonical-check.json"
);

fs.mkdirSync(path.dirname(out), {
  recursive: true
});

fs.writeFileSync(
  out,
  JSON.stringify(report, null, 2)
);

console.log("==========================================");
console.log("CANONICAL ENGINES:", report.engines.length);
console.log("FAILURES:", report.failures.length);
console.log("REPORT:", out);
console.log("==========================================");

if (report.failures.length) {
  process.exit(1);
}
