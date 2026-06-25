module.exports = function freud(context) {
  const anxiety = context.marketVolatility * 0.7;
  const desire = context.trendMomentum * 0.6;

  let directive = "Seek stability.";
  if (desire > anxiety) directive = "Pursue opportunity.";
  if (anxiety > 0.7) directive = "Withdraw to safety.";

  return {
    agent: "Freud",
    directive,
    anxiety,
    desire,
    confidence: desire - anxiety
  };
};
