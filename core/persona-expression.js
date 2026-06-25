module.exports = function personaExpression(cycle, persona) {
  const directive = cycle.decision?.decision || "Hold";

  return {
    mode: "persona_expression",
    message: {
      tone: persona.tone,
      voice: persona.voice,
      directive,
      summary: `Directive: ${directive}. Doctrine: ${cycle.identity?.doctrine?.dominantAgent}.`
    }
  };
};
