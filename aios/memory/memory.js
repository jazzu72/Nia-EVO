'use strict';

const fs = require('fs');
const path = require('path');

const FILE = path.join(
  process.cwd(),
  'data',
  'aios-memory.json'
);

function ensure() {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });

  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, '[]');
  }
}

function read() {
  ensure();

  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch {
    return [];
  }
}

function remember(entry) {
  const memory = read();

  memory.push({
    id: `mem_${Date.now()}`,
    ...entry,
    timestamp: new Date().toISOString()
  });

  fs.writeFileSync(
    FILE,
    JSON.stringify(memory.slice(-5000), null, 2)
  );

  return memory[memory.length - 1];
}

function recent(limit = 20) {
  return read().slice(-limit);
}

module.exports = {
  remember,
  recent
};
