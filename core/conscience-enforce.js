module.exports = function conscienceEnforce(cycle, conscience, evalResult) {
  let directive = cycle.decision?.decision || "Hold";

  if (!evalResult.safe) {
    if (evalResult.violations.includes("mission_instability")) {
      directive = "Hold position (mission stabilization).";
    }

    if (evalResult.violations.includes("pattern_anomaly")) {
      directive = "Probe lightly (anomaly detected).";
    }

    if (evalResult.violations.includes("long_arc_drift")) {
      directive = "Retreat and fortify (long-arc correction).";
    }
  }

  return {
    mode: "conscience_enforce",
    enforcedDirective: directive,
    violations: evalResult.violations
  };
};
