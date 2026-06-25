module.exports = function techDiscovery(techInfo) {
  return {
    mode: "tech_discovery",
    name: techInfo.name,
    category: techInfo.category,
    capabilities: techInfo.capabilities,
    requirements: techInfo.requirements,
    integrationDifficulty: techInfo.complexity || 0.5
  };
};
