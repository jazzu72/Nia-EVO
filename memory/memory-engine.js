const fs = require("fs");
const path = require("path");
const MEMORY_DIR = __dirname;

function safeRead(file) {
  const full = path.join(MEMORY_DIR, file);
  if (!fs.existsSync(full)) return [];
  try {
    return JSON.parse(fs.readFileSync(full, "utf8"));
  } catch {
    return [];
  }
}

function safeWrite(file, data) {
  const full = path.join(MEMORY_DIR, file);
  fs.writeFileSync(full, JSON.stringify(data, null, 2));
}

function append(file, entry) {
  const existing = safeRead(file);
  existing.push({ ts: new Date().toISOString(), ...entry });
  safeWrite(file, existing);
}

module.exports = {
  append,
  read: safeRead
};
