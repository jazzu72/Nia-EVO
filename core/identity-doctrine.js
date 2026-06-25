module.exports = function identityDoctrine(cycle) {
  const dominantAgent =
    cycle.council?.advisors?.sort((a,b)=>b.confidence-a.confidence)[0]?.agent;

  return {
    mode: "identity_doctrine",
    dominantAgent,
    doctrine: {
      strategic: "Fusion of predictive, long-arc, and council consensus.",
      psychological: "Awareness of internal biases and pattern anomalies.",
      operational: "Adaptive posture based on reinforcement and correction.",
      philosophical: dominantAgent
        ? `Current dominant doctrine: ${dominantAgent}`
        : "Balanced multi-agent reasoning."
    }
  };
};
