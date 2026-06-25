module.exports = function biasMapping(cycle) {
  const { fusion, reinforcement, council } = cycle;

  return {
    mode: "bias_mapping",
    biases: {
      predictiveBias: fusion?.founderBias,
      reinforcementBias: reinforcement?.weights,
      councilBias: council?.advisors?.reduce((acc, a) => {
        acc[a.agent] = a.confidence;
        return acc;
      }, {})
    }
  };
};
