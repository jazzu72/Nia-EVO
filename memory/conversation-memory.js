const fs = require("fs");
const path = require("path");

const MEM_PATH = path.join(process.env.HOME, ".nia-complete", "conversation.json");

function ensureMemory() {
  if (!fs.existsSync(MEM_PATH)) {
    fs.mkdirSync(path.dirname(MEM_PATH), { recursive: true });
    fs.writeFileSync(MEM_PATH, JSON.stringify({ history: [] }, null, 2));
  }
}

function load() {
  ensureMemory();
  return JSON.parse(fs.readFileSync(MEM_PATH, "utf8"));
}

function save(data) {
  fs.writeFileSync(MEM_PATH, JSON.stringify(data, null, 2));
}

module.exports = {
  append(role, content) {
    const mem = load();
    mem.history.push({
      role,
      content,
      timestamp: new Date().toISOString()
    });
    mem.history = mem.history.slice(-50);
    save(mem);
  },

  getHistory() {
    return load().history;
  }
};
