const sunTzu = require("./sun-tzu");
const machiavelli = require("./machiavelli");
const freud = require("./freud");
const alDavis = require("./al-davis");

module.exports = function councilFusion(context) {
  const advisors = [
    sunTzu(context),
    machiavelli(context),
    freud(context),
    alDavis(context)
  ];

  const weighted = advisors.map(a => ({
    agent: a.agent,
    directive: a.directive,
    confidence: Math.max(0.01, a.confidence)
  }));

  const total = weighted.reduce((s, a) => s + a.confidence, 0);

  const consensus = weighted.reduce((acc, a) => {
    acc[a.directive] = (acc[a.directive] || 0) + a.confidence;
    return acc;
  }, {});

  const finalDirective = Object.entries(consensus)
    .sort((a, b) => b[1] - a[1])[0][0];

  return {
    mode: "inner_council",
    advisors: weighted,
    consensus: finalDirective,
    totalConfidence: total
  };
};
