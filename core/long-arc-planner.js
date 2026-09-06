const memory = require("../memory/memory-engine");

module.exports = function longArcPlanner() {
  const decisions = memory.read("decisions.log");
  if (!decisions || decisions.length < 10) {
    return {
      mode: "short_term",
      horizon: "24h",
      bias: "neutral",
      note: "Insufficient history for long-arc planning."
    };
  }

  const recent = decisions.slice(-50);

  const countDirective = (substr) =>
    recent.filter(d =>
      (d.decision || "").toLowerCase().includes(substr)
    ).length;

  const aggressive = countDirective("advance aggressively");
  const selective = countDirective("advance selectively");
  const probe = countDirective("probe");
  const retreat = countDirective("retreat");

  let bias = "neutral";
  if (aggressive > selective && aggressive > retreat) bias = "offensive";
  else if (retreat > aggressive && retreat > selective) bias = "defensive";
  else if (probe > aggressive && probe > retreat) bias = "exploratory";

  const horizon =
    bias === "offensive" ? "7d" :
    bias === "defensive" ? "3d" :
    bias === "exploratory" ? "14d" : "24h";

  return {
    mode: "long_arc",
    horizon,
    bias,
    stats: { aggressive, selective, probe, retreat }
  };
};
