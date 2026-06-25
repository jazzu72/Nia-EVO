const fs = require("fs");
const { exec } = require("child_process");

module.exports = {
  async execute(action, payload = {}) {
    switch (action) {

      case "log":
        return this.log(payload.message);

      case "shell":
        return this.shell(payload.command);

      case "write_file":
        return this.writeFile(payload.path, payload.content);

      case "read_file":
        return this.readFile(payload.path);

      default:
        return { ok: false, error: "Unknown action: " + action };
    }
  },

  async log(message) {
    console.log("[AGENT ACTION] LOG:", message);
    return { ok: true, result: "logged" };
  },

  async shell(command) {
    return new Promise(resolve => {
      exec(command, (err, stdout, stderr) => {
        if (err) return resolve({ ok: false, error: stderr });
        resolve({ ok: true, result: stdout });
      });
    });
  },

  async writeFile(path, content) {
    try {
      fs.writeFileSync(path, content);
      return { ok: true, result: "written" };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  },

  async readFile(path) {
    try {
      const data = fs.readFileSync(path, "utf8");
      return { ok: true, result: data };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }
};
