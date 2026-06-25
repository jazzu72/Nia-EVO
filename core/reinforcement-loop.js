const memory = require("../memory/memory-engine");

module.exports = function reinforcementLoop() {
  const decisions = memory.read("decisions.log");
  if (!decisions || decisions.length < 15) {
    return { mode: "insufficient_data" };
  }

  const recent = decisions.slice(-30);

  const score = recent.reduce((acc, d) => {
    if (d.decision.includes("Advance aggressively")) acc.offense++;
    if (d.decision.includes("Retreat")) acc.defense++;
    if (d.decision.includes("Probe")) acc.explore++;
    return acc;
  }, { offense: 0, defense: 0, explore: 0 });

  const total = score.offense + score.defense + score.explore;

  return {
    mode: "reinforcement",
    weights: {
      offense: score.offense / total,
      defense: score.defense / total,
      explore: score.explore / total
    }
  };
};
