const memory = require("./memory");

function zscore(value, mean, std) {
  if (std === 0) return 0;
  return (value - mean) / std;
}

module.exports = {
  detect() {
    const env = memory.read("environment");
    if (!env || env.length < 5) return { status: "INSUFFICIENT_DATA" };

    const last = env[env.length - 1];
    const prev = env.slice(-20); // last 20 samples

    const anomalies = {};

    // CPU anomaly
    const cpuLoads = prev
      .map(e => parseFloat((e.cpu.split("load average:")[1] || "0").split(",")[0]))
      .filter(n => !is0(n));

    const cpuMean = cpuLoads.reduce((a,b)=>a+b,0) / cpuLoads.length;
    const cpuStd = Math.sqrt(cpuLoads.map(x => Math.pow(x - cpuMean, 2)).reduce((a,b)=>a+b,0) / cpuLoads.length);

    const lastCpu = parseFloat((last.cpu.split("load average:")[1] || "0").split(",")[0]);
    const cpuZ = zscore(lastCpu, cpuMean, cpuStd);

    if (cpuZ > 3) anomalies.cpu = "SPIKE";
    if (cpuZ < -3) anomalies.cpu = "DROP";

    // Process anomaly
    const procCounts = prev.map(e => parseInt(e.processes)).filter(n => !is0(n));
    const procMean = procCounts.reduce((a,b)=>a+b,0) / procCounts.length;
    const procStd = Math.sqrt(procCounts.map(x => Math.pow(x - procMean, 2)).reduce((a,b)=>a+b,0) / procCounts.length);

    const lastProc = parseInt(last.processes);
    const procZ = zscore(lastProc, procMean, procStd);

    if (procZ > 3) anomalies.processes = "SURGE";
    if (procZ < -3) anomalies.processes = "DROP";

    // Network anomaly
    if (!last.net.includes("inet")) anomalies.network = "OFFLINE";

    // Battery anomaly
    if (last.battery.includes("percentage")) {
      const pct = parseInt(last.battery.match(/"percentage":\s*(\d+)/)[1]);
      if (pct < 5) anomalies.battery = "CRITICAL_LOW";
    }

    memory.append("anomalies", { timestamp: Date.now(), anomalies });
    return anomalies;
  }
};
