const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const OUTPUT = path.join(ROOT, "nia-production-readiness.json");

console.log("NIA PRODUCTION READINESS CHECK");

execFile("pm2", ["jlist"], { timeout: 15000, maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
  let services = [];
  let pm2Error = null;

  if (err) {
    pm2Error = (stderr || err.message || "PM2 unavailable").trim();
    console.error("PM2 CHECK FAILED:", pm2Error);
  } else {
    try {
      services = JSON.parse(stdout);
      if (!Array.isArray(services)) {
        throw new Error("PM2 returned data that is not an array");
      }
    } catch (e) {
      pm2Error = "Could not parse PM2 JSON: " + e.message;
      console.error(pm2Error);
      console.error(stdout.slice(0, 1000));
    }
  }

  const online = services.filter(s => s?.pm2_env?.status === "online").length;
  const failed = services
    .filter(s => s?.pm2_env?.status !== "online")
    .map(s => s.name || "unknown");

  const exists = name => fs.existsSync(path.join(ROOT, name));

  const report = {
    system: "NIA-CAPITAL-OS",
    mode: "PRODUCTION_READINESS",
    pm2Check: pm2Error ? "ERROR" : "OK",
    pm2Error,
    servicesOnline: online,
    servicesDetected: services.length,
    failedServices: failed,
    files: {
      missionControl: exists("NIA-CEO/mission-control.js"),
      dashboardApi: exists("dashboard/dashboard-api.js"),
      audit: exists("nia-audit-ledger.json"),
      pipeline: exists("nia-deal-pipeline.json"),
      investors: exists("nia-investor-packages.json")
    },
    timestamp: new Date().toISOString()
  };

  try {
    fs.writeFileSync(OUTPUT, JSON.stringify(report, null, 2) + "\n");
    console.log(JSON.stringify(report, null, 2));
  } catch (e) {
    console.error("Could not write readiness report:", e.message);
    process.exitCode = 1;
  }

  if (pm2Error) process.exitCode = 1;
});
