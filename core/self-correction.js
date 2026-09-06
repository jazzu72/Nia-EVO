const memory = require("../memory/memory-engine");

module.exports = function selfCorrection() {
  const decisions = memory.read("decisions.log");
  const contexts = memory.read("context.log");

  if (!decisions.length || !contexts.length) {
    return { mode: "insufficient_data" };
  }

  const lastDecision = decisions[decisions.length - 1];
  const lastContext = contexts[contexts.length - 1];

  const predictionError =
    Math.abs((lastDecision.strategy?.timing || 0.5) -
             (lastContext.trendMomentum || 0.5));

  const correction = {
    mode: "self_correction",
    predictionError,
    adjustPredictiveWeight: predictionError > 0.25 ? -0.05 : 0.02,
    adjustLongArcWeight: predictionError > 0.25 ? 0.03 : -0.01,
    adjustReinforcementWeight: predictionError > 0.25 ? 0.04 : -0.02
  };

  memory.append("corrections.log", correction);
  return correction;
};
