const memory = require("./memory");

module.exports = {
  scale(tasks, status) {
    const scaled = {};

    for (const t of tasks) {
      let interval = t.interval_ms;

      // CPU scaling
      if (status.cpu === "CRITICAL") interval *= 2;
      else if (status.cpu === "WARN") interval *= 1.25;

      // Battery scaling
      if (status.battery === "CRITICAL") interval *= 3;
      else if (status.battery === "WARN") interval *= 1.5;

      // Network scaling
      if (status.net === "CRITICAL" && t.name.includes("network")) {
        interval *= 4;
      }

      // Process scaling
      if (status.processes === "CRITICAL") interval *= 2;

      // Disk scaling
      if (status.disk === "CRITICAL") interval *= 2;

      scaled[t.name] = Math.floor(interval);
    }

    memory.append("task_scaling", scaled);
    return scaled;
  }
};
