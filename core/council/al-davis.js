module.exports = function alDavis(context) {
  const aggression = context.ourSpeed * 0.8;
  const opening = context.trendMomentum * 0.5;

  let directive = "Just win, baby.";
  if (aggression > 0.7 && opening > 0.5) directive = "Attack now.";
  if (opening < 0.3) directive = "Hold and wait.";

  return {
    agent: "Al Davis",
    directive,
    aggression,
    opening,
    confidence: aggression * opening
  };
};
