const predict = require("./predictive-engine");
const planner = require("./long-arc-planner");
const memory = require("../memory/memory-engine");

module.exports = function predictiveFusion(context) {
  const p = predict();
  const arc = planner();

  const founderHistory = memory.read("founder.log");
  const founderBias = founderHistory.length > 20
    ? founderHistory.slice(-20).filter(x =>
        (x.instruction || "").toLowerCase().includes("advance")
      ).length / 20
    : 0.5;

  const fusedTerrain =
    (context.marketVolatility * 0.4) +
    (p.terrain * 0.3) +
    (arc.bias === "defensive" ? 0.1 : 0);

  const fusedTiming =
    (context.trendMomentum * 0.4) +
    (p.timing * 0.3) +
    (arc.horizon === "7d" ? 0.1 : 0);

  const fusedForces =
    (context.ourIntel * 0.4) +
    (p.forces * 0.3) +
    (founderBias * 0.2);

  return {
    terrain: fusedTerrain,
    timing: fusedTiming,
    forces: fusedForces,
    predictive: p,
    longArc: arc,
    founderBias
  };
};
