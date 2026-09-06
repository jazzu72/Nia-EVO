const council = require("./council/council-fusion");
const fusion = require("./predictive-fusion");
const patterns = require("./pattern-engine");
const reinforce = require("./reinforcement-loop");
const correct = require("./self-correction");

module.exports = function niaWarRoom(context) {
  const councilDecision = council(context);
  const f = fusion(context);
  const p = patterns();
  const r = reinforce();
  const c = correct();

  let directive = councilDecision.consensus;

  return {
    directive,
    council: councilDecision,
    fusion: f,
    patterns: p,
    reinforcement: r,
    correction: c
  };
};
