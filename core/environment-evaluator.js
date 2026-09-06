const memory = require("./memory");

module.exports = {
  evaluate(snapshot) {
    const status = {
      cpu: "OK",
      mem: "OK",
      disk: "OK",
      battery: "OK",
      net: "OK",
      processes: "OK"
    };

    // CPU load check
    if (snapshot.cpu.includes("load average:")) {
      const load = parseFloat(snapshot.cpu.split("load average:")[1].split(",")[0]);
      if (load > 6) status.cpu = "CRITICAL";
      else if (load > 3) status.cpu = "WARN";
    }

    // Memory check
    if (snapshot.mem.includes("Mem:")) {
      const parts = snapshot.mem.split(/\s+/);
      const used = parseFloat(parts[8].replace("G",""));
      const total = parseFloat(parts[7].replace("G",""));
      const pct = used / total;
      if (pct > 0.9) status.mem = "CRITICAL";
      else if (pct > 0.75) status.mem = "WARN";
    }

    // Disk check
    if (snapshot.disk.includes("%")) {
      const pct = parseInt(snapshot.disk.split("%")[0].slice(-2));
      if (pct > 90) status.disk = "CRITICAL";
      else if (pct > 75) status.disk = "WARN";
    }

    // Battery check
    if (snapshot.battery.includes("percentage")) {
      const pct = parseInt(snapshot.battery.match(/"percentage":\s*(\d+)/)[1]);
      if (pct < 10) status.battery = "CRITICAL";
      else if (pct < 25) status.battery = "WARN";
    }

    // Network check
    if (!snapshot.net.includes("inet")) {
      status.net = "CRITICAL";
    }

    // Process count
    const proc = parseInt(snapshot.processes);
    if (proc > 500) status.processes = "CRITICAL";
    else if (proc > 300) status.processes = "WARN";

    memory.append("environment_eval", { snapshot, status });
    return status;
  }
};
