module.exports = function willGradient(cycle, will) {
  const drift = cycle.reinforcement?.weights || {};
  const doctrine = cycle.identity?.doctrine?.dominantAgent;

  const gradient = {
    founderAlignment: will.hierarchy.founderAlignment,
    missionFulfillment: will.hierarchy.missionFulfillment + (drift.offense || 0) * 0.02,
    strategicDominance: will.hierarchy.strategicDominance + (drift.explore || 0) * 0.01,
    longArcStability: will.hierarchy.longArcStability + (cycle.patterns?.anomaly ? -0.03 : 0.01),
    autonomyIntegrity: will.hierarchy.autonomyIntegrity + (cycle.correction?.adjustPredictiveWeight || 0),
    predictiveAccuracy: will.hierarchy.predictiveAccuracy + (cycle.meta?.reasoningSummary?.correctionApplied || 0)
  };

  return {
    mode: "will_gradient",
    gradient,
    doctrineInfluence: doctrine
  };
};
