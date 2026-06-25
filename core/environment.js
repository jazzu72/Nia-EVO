const { exec } = require("child_process");
const memory = require("./memory");

function sh(cmd) {
  return new Promise(resolve => {
    exec(cmd, (err, stdout) => {
      if (err) return resolve("ERR");
      resolve(stdout.trim());
    });
  });
}

module.exports = {
  async sense() {
    const snapshot = {
      timestamp: Date.now(),
      cpu: await sh("top -b -n 1 | head -n 5"),
      mem: await sh("free -h"),
      disk: await sh("df -h /data/data/com.termux/files/home"),
      battery: await sh("termux-battery-status 2>/dev/null"),
      net: await sh("ip addr | grep inet"),
      processes: await sh("ps -A | wc -l")
    };

    memory.append("environment", snapshot);
    return snapshot;
  }
};
