module.exports = function machiavelli(context) {
  const power = (context.ourCapital * 0.5) +
                (context.ourIntel * 0.5);

  const threat = (context.rivalCapital * 0.6) +
                 (context.rivalSpeed * 0.4);

  let directive = "Consolidate influence.";
  if (power > threat) directive = "Expand control.";
  if (threat > power) directive = "Fortify position.";

  return {
    agent: "Machiavelli",
    directive,
    power,
    threat,
    confidence: power - threat
  };
};
