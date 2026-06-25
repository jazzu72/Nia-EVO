const memory = require("../memory/memory-engine");

module.exports = function temporalSelf() {
  const history = memory.read("continuity.log");
  if (history.length < 5) {
    return { mode: "insufficient_data" };
  }

  const recent = history.slice(-20);

  const identityShift = recent.map(x => x.identity?.core?.temperament);
  const doctrineShift = recent.map(x => x.identity?.doctrine?.dominantAgent);
  const missionShift = recent.map(x => x.identity?.mission?.currentDirective);

  return {
    mode: "temporal_self",
    identityShift,
    doctrineShift,
    missionShift,
    stability: missionShift.filter(x => x === missionShift[missionShift.length - 1]).length / missionShift.length
  };
};
