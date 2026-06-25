const memory = require("../../memory/memory-engine");

module.exports = function councilDynamics(cycle) {
  const history = memory.read("council.log");
  const current = cycle.council;

  memory.append("council.log", current);

  if (history.length < 5) {
    return { mode: "insufficient_data" };
  }

  const recent = history.slice(-10);

  const trend = recent.reduce((acc, entry) => {
    entry.advisors.forEach(a => {
      acc[a.agent] = (acc[a.agent] || 0) + a.confidence;
    });
    return acc;
  }, {});

  return {
    mode: "council_dynamics",
    trend,
    dominantAgent: Object.entries(trend).sort((a,b)=>b[1]-a[1])[0][0]
  };
};
