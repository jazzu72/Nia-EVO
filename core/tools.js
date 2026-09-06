const fs = require("fs");
const { exec } = require("child_process");

module.exports = {
  list: {
    "read_file": {
      description: "Read a file from disk",
      run: async ({ path }) => {
        try {
          const data = fs.readFileSync(path, "utf8");
          return { ok: true, result: data };
        } catch (e) {
          return { ok: false, error: e.message };
        }
      }
    },

    "write_file": {
      description: "Write content to a file",
      run: async ({ path, content }) => {
        try {
          fs.writeFileSync(path, content);
          return { ok: true, result: "written" };
        } catch (e) {
          return { ok: false, error: e.message };
        }
      }
    },

    "shell": {
      description: "Execute a shell command",
      run: async ({ command }) => {
        return new Promise(resolve => {
          exec(command, (err, stdout, stderr) => {
            if (err) return resolve({ ok: false, error: stderr });
            resolve({ ok: true, result: stdout });
          });
        });
      }
    }
  },

  async use(tool, payload) {
    const t = this.list[tool];
    if (!t) return { ok: false, error: "Unknown tool: " + tool };
    return t.run(payload);
  }
};
