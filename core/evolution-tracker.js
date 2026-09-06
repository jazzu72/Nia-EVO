module.exports = function evolutionTracker(snapshot) {
  const { identity, councilDynamics, meta } = snapshot;

  return {
    mode: "evolution_tracker",
    evolution: {
      dominantDoctrine: identity?.doctrine?.dominantAgent,
      councilTrend: councilDynamics?.trend,
      predictiveAdjustment: meta?.reasoningSummary?.correctionApplied,
      stability: identity?.mission?.stability
    }
  };
};
