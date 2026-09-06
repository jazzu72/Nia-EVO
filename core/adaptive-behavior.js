const memory = require("./memory");
const tools = require("./tools");

module.exports = {
  async adapt(status) {
    const actions = [];

    // CPU
    if (status.cpu === "CRITICAL") {
      actions.push("reduce_task_frequency");
    } else if (status.cpu === "WARN") {
      actions.push("slight_task_throttle");
    }

    // Memory
    if (status.mem === "CRITICAL") {
      actions.push("clear_temp_files");
    }

    // Disk
    if (status.disk === "CRITICAL") {
      actions.push("disk_cleanup");
    }

    // Battery
    if (status.battery === "CRITICAL") {
      actions.push("pause_heavy_tasks");
    }

    // Network
    if (status.net === "CRITICAL") {
      actions.push("pause_network_tasks");
    }

    // Processes
    if (status.processes === "CRITICAL") {
      actions.push("kill_zombies");
    }

    memory.append("adaptive_actions", { status, actions });

    // Execute actions
    for (const action of actions) {
      if (action === "reduce_task_frequency") {
        await tools.use("shell", { command: "echo 'CPU high: throttling tasks'" });
      }
      if (action === "slight_task_throttle") {
        await tools.use("shell", { command: "echo 'CPU warm: slight throttle'" });
      }
      if (action === "clear_temp_files") {
        await tools.use("shell", { command: "rm -rf /data/data/com.termux/files/usr/tmp/*" });
      }
      if (action === "disk_cleanup") {
        await tools.use("shell", { command: "rm -rf ~/nia-capital-os/logs/*" });
      }
      if (action === "pause_heavy_tasks") {
        await tools.use("shell", { command: "echo 'Battery low: pausing heavy tasks'" });
      }
      if (action === "pause_network_tasks") {
        await tools.use("shell", { command: "echo 'Network down: pausing network tasks'" });
      }
      if (action === "kill_zombies") {
        await tools.use("shell", { command: "pkill -f zombie_process_name" });
      }
    }

    return actions;
  }
};
