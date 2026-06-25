const memory = require("../memory/memory-engine");

module.exports = function patternEngine() {
  const contexts = memory.read("context.log");
  if (!contexts || contexts.length < 20) {
    return { mode: "insufficient_data" };
  }

  const recent = contexts.slice(-100);

  const avg = (arr, key) =>
    arr.reduce((s, x) => s + (x[key] || 0), 0) / arr.length;

  const volatilityTrend = avg(recent, "marketVolatility");
  const momentumTrend = avg(recent, "trendMomentum");
  const competitionTrend = avg(recent, "competitionDensity");

  const anomaly =
    volatilityTrend > 0.75 ||
    competitionTrend > 0.8 ||
    momentumTrend < 0.2;

  return {
    mode: "pattern_analysis",
    volatilityTrend,
    momentumTrend,
    competitionTrend,
    anomaly
  };
};
