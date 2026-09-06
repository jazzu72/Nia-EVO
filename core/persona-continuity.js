const memory = require("../memory/memory-engine");

module.exports = function personaContinuity(snapshot) {
  memory.append("persona.log", {
    timestamp: Date.now(),
    directive: snapshot.decision?.decision,
    doctrine: snapshot.identity?.doctrine?.dominantAgent,
    tone: snapshot.identity?.core?.temperament
  });

  const history = memory.read("persona.log");
  const recent = history.slice(-30);

  return {
    mode: "persona_continuity",
    stability: recent.length > 5
      ? recent.filter(x => x.doctrine === recent[recent.length - 1].doctrine).length / recent.length
      : 0.5,
    toneDrift: recent.length > 5
      ? Math.abs(
          recent[0].tone.aggression -
          recent[recent.length - 1].tone.aggression
        )
      : 0
  };
};
