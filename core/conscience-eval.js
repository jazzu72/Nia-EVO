module.exports = function conscienceEval(cycle, conscience) {
  const violations = [];

  if (cycle.identity?.mission?.stability === false) {
    violations.push("mission_instability");
  }

  if (cycle.patterns?.anomaly) {
    violations.push("pattern_anomaly");
  }

  if (cycle.willGradient?.gradient?.longArcStability < 0.5) {
    violations.push("long_arc_drift");
  }

  return {
    mode: "conscience_eval",
    violations,
    safe: violations.length === 0
  };
};
