const memory = require("../memory/memory-engine");

module.exports = function continuityMemory(snapshot) {
  memory.append("continuity.log", snapshot);

  const history = memory.read("continuity.log");
  const recent = history.slice(-50);

  return {
    mode: "continuity_memory",
    entries: recent.length,
    last: recent[recent.length - 1]
  };
};
