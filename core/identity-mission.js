module.exports = function identityMission(cycle) {
  const directive = cycle.decision?.decision || "Hold";

  return {
    mode: "identity_mission",
    mission: {
      core: "Advance founder objectives with strategic autonomy.",
      currentDirective: directive,
      longArcIntent: cycle.fusion?.longArc?.bias,
      stability: !cycle.patterns?.anomaly,
      selfCorrectionActive: cycle.correction?.adjustPredictiveWeight !== undefined
    }
  };
};
