const GENERIC_PHRASES = [
  "cutting edge",
  "game changing",
  "revolutionary",
  "best in class",
  "world class",
  "seamless solution",
  "unlock your potential",
  "leverage ai",
  "innovative solutions",
  "next generation",
];

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function normalize(value) {
  return String(value || "").replace(/s+/g, " ").trim();
}

function evaluateIdentityArtifact(input = {}) {
  const title = normalize(input.title);
  const text = normalize(input.text);
  const audience = normalize(input.audience);
  const offer = normalize(input.offer);
  const callToAction = normalize(input.callToAction);

  const evidence = Array.isArray(input.evidence)
    ? input.evidence.map(normalize).filter(Boolean).slice(0, 12)
    : [];

  const combined = [
    title,
    text,
    audience,
    offer,
    callToAction,
    ...evidence,
  ]
    .filter(Boolean)
    .join(" ");

  const hasHouseIdentity =
    /house of jazzu|nia(?:[-s]?evo)?|money munchkins|quantum quest/i.test(
      combined,
    );

  const hasAudience = audience.length >= 3;
  const hasOffer = offer.length >= 5;
  const hasCallToAction = callToAction.length >= 3;
  const hasEvidence = evidence.length > 0;

  const hasHonestyLanguage =
    /\b(estimate|estimated|assumption|uncertain|confidence|verify|verified|owner-approved|human approval|required)\b/i.test(
      combined,
    );

  const genericMatches = GENERIC_PHRASES.filter((phrase) =>
    combined.toLowerCase().includes(phrase),
  );

  const recognizability = clamp(
    20 +
      (hasHouseIdentity ? 45 : 0) +
      (title.length >= 8 ? 15 : 0) +
      (hasOffer ? 20 : 0),
  );

  const consistency = clamp(
    20 +
      (hasAudience ? 25 : 0) +
      (hasOffer ? 35 : 0) +
      (hasCallToAction ? 20 : 0),
  );

  const repeatability = clamp(
    20 +
      (title.length >= 8 ? 20 : 0) +
      (text.length >= 80 ? 25 : 0) +
      (hasOffer ? 15 : 0) +
      (hasEvidence ? 20 : 0),
  );

  const shareability = clamp(
    20 +
      (title.length >= 8 ? 20 : 0) +
      (hasAudience ? 20 : 0) +
      (hasOffer ? 25 : 0) +
      (hasCallToAction ? 15 : 0),
  );

  const trust = clamp(
    20 +
      (hasEvidence ? 35 : 0) +
      (hasHonestyLanguage ? 25 : 0) +
      (genericMatches.length === 0 ? 20 : 0) -
      genericMatches.length * 8,
  );

  const distinctiveness = clamp(
    20 +
      (hasHouseIdentity ? 35 : 0) +
      (/capital|grant|housing|real estate|financial literacy|deal flow/i.test(
        combined,
      )
        ? 25
        : 0) +
      (genericMatches.length === 0 ? 20 : 0) -
      genericMatches.length * 8,
  );

  const scores = {
    recognizability,
    consistency,
    repeatability,
    shareability,
    trust,
    distinctiveness,
  };

  const overall = clamp(
    Object.values(scores).reduce((total, value) => total + value, 0) /
      Object.keys(scores).length,
  );

  const strengths = [];
  const gaps = [];

  if (recognizability >= 70) {
    strengths.push("The artifact carries identifiable House of Jazzu or Nia identity.");
  } else {
    gaps.push("Name House of Jazzu or the specific Nia product in the headline or opening sentence.");
  }

  if (shareability >= 70) {
    strengths.push("The audience, offer, and next step are easy to understand and forward.");
  } else {
    gaps.push("Add one specific audience benefit and one explicit call to action.");
  }

  if (trust >= 70) {
    strengths.push("The pitch includes evidence, limits, or owner-control language that supports trust.");
  } else {
    gaps.push("Separate verified facts from estimates and state the evidence or operational boundary behind major claims.");
  }

  if (repeatability < 70) {
    gaps.push("Use a reusable structure: headline, audience, outcome, proof, and next step.");
  }

  if (distinctiveness < 70) {
    gaps.push("Replace generic AI language with a concrete House of Jazzu capability and target user.");
  }

  if (genericMatches.length) {
    gaps.push(`Reduce generic phrases: ${genericMatches.join(", ")}.`);
  }

  return {
    framework: "WARHOL_IDENTITY_METRICS_V1",
    overall,
    scores,
    strengths: strengths.slice(0, 3),
    gaps: gaps.slice(0, 5),
  };
}

function summarizeForPrompt(metrics) {
  const scores = Object.entries(metrics.scores)
    .map(([name, score]) => `${name}: ${score}/100`)
    .join(", ");

  return [
    `Warhol identity overall score: ${metrics.overall}/100.`,
    `Dimension scores: ${scores}.`,
    "Strengths:",
    ...(metrics.strengths.length
      ? metrics.strengths.map((item) => `- ${item}`)
      : ["- No validated strengths available."]),
    "Priority gaps:",
    ...(metrics.gaps.length
      ? metrics.gaps.map((item) => `- ${item}`)
      : ["- No critical gaps identified from supplied content."]),
    "These scores evaluate only owner-supplied copy. They are not audience, conversion, social, or market-performance metrics.",
    ].join(String.fromCharCode(10));
}

module.exports = {
  evaluateIdentityArtifact,
  summarizeForPrompt,
};
