module.exports = function sunTzu(context) {
  const terrain = (context.marketVolatility * 0.6) -
                  (context.liquidity * 0.4);

  const timing = (context.trendMomentum * 0.7) +
                 (context.newsHeat * 0.3);

  let directive = "Observe quietly.";
  if (terrain < 0.4 && timing > 0.6) directive = "Strike indirectly.";
  if (terrain > 0.7) directive = "Avoid battle.";

  return {
    agent: "Sun Tzu",
    directive,
    terrain,
    timing,
    confidence: (1 - terrain) * timing
  };
};
