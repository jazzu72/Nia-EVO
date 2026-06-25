module.exports = function specSynthesizer(tech) {
  return {
    mode: "spec_synthesizer",
    integrationPlan: {
      modules: tech.capabilities.map(c => `module_${c}`),
      dependencies: tech.requirements,
      difficulty: tech.integrationDifficulty,
      estimatedSteps: Math.ceil(tech.capabilities.length * 1.5)
    }
  };
};
