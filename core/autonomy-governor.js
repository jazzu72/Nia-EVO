module.exports = function autonomyGovernor(cycle) {
  const alerts = [];

  if (cycle.willGradient?.gradient?.strategicDominance > 1.2)
    alerts.push("will_drift");

  if (cycle.refactor?.synth?.targets?.length > 5)
    alerts.push("excessive_refactor");

  if (cycle.autoBuilder?.generated?.generatedModules?.length > 10)
    alerts.push("excessive_generation");

  if (cycle.councilDynamics?.dominantAgent === "Al Davis" &&
      cycle.willGradient?.gradient?.aggression > 0.9)
    alerts.push("aggression_spike");

  return {
    mode: "autonomy_governor",
    alerts,
    safe: alerts.length === 0
  };
};
