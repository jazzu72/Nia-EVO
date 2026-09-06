module.exports = function codeGenerator(spec) {
  const modules = spec.integrationPlan.modules.map(m => ({
    name: m,
    code: `module.exports = function ${m}() { return { module: "${m}", status: "generated" }; };`
  }));

  return {
    mode: "code_generator",
    generatedModules: modules,
    tests: modules.map(m => `test_${m.name}`),
    docs: `Auto-generated integration for ${modules.length} modules.`
  };
};
