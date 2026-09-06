const memory = require("../memory/memory-engine");

module.exports = function niaExecutiveDecisionEngine(options) {
  const { directive, context, strategy } = options;

  const decision = {
    decision: directive,
    context,
    strategy,
    approvedBy: "NIA (CEO)",
    timestamp: new Date().toISOString(),
    final: true
  };

  memory.append("decisions.log", decision);
  return decision;
};
