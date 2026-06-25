module.exports = function metaReasoning(cycle) {
  const { fusion, patterns, reinforcement, correction, council } = cycle;

  return {
    mode: "meta_reasoning",
    reasoningSummary: {
      predictiveFactors: {
        terrain: fusion?.terrain,
        timing: fusion?.timing,
        forces: fusion?.forces
      },
      councilConsensus: council?.consensus,
      dominantAgent: council?.advisors?.sort((a,b)=>b.confidence-a.confidence)[0]?.agent,
      anomalyDetected: patterns?.anomaly || false,
      reinforcementBias: reinforcement?.weights,
      correctionApplied: correction?.adjustPredictiveWeight
    }
  };
};
