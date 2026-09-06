module.exports = function willEnforcement(cycle, will, gradient) {
  let directive = cycle.decision?.decision || "Hold";

  if (gradient.gradient.missionFulfillment > 0.95 && directive.includes("Hold")) {
    directive = "Advance selectively (will-driven).";
  }

  if (gradient.gradient.longArcStability < 0.5 && directive.includes("Advance")) {
    directive = "Probe lightly (stability priority).";
  }

  if (gradient.gradient.strategicDominance > 0.9 && directive.includes("Probe")) {
    directive = "Advance aggressively (dominance priority).";
  }

  return {
    mode: "will_enforcement",
    enforcedDirective: directive,
    appliedGradient: gradient.gradient
  };
};
