/*
  WARHOL IDENTITY METRICS
  Additive, read-only brand and communication quality layer for Nia.
  Evaluates supplied artifacts only. No scraping, no publishing, no external changes.
*/

const NL = String.fromCharCode(10);

const METRIC_DEFINITIONS = {
  recognizability: {
    label: "Recognizability",
    question: "Would someone know this is House of Jazzu without being told repeatedly?",
    signals: [
      "House of Jazzu name or approved product name is present",
      "Clear institutional identity language is present",
      "Core mission or category is stated",
    ],
  },
  consistency: {
    label: "Consistency",
    question: "Do message, value proposition, audience, and call-to-action agree?",
    signals: [
      "One primary audience is identifiable",
      "One primary offer or outcome is identifiable",
      "Message avoids conflicting promises",
    ],
  },
  repeatability: {
    label: "Repeatability",
    question: "Can this become a reusable card, brief, proposal, or campaign template?",
    signals: [
      "Stable headline or title pattern",
      "Structured summary or repeatable content format",
      "Reusable proof, metric, or evidence pattern",
    ],
  },
  shareability: {
    label: "Shareability",
    question: "Can a recipient understand and pass this on quickly?",
    signals: [
      "Clear one-sentence value statement",
      "Specific audience benefit",
      "Concrete next step or call-to-action",
    ],
  },
  trust: {
    label: "Trust",
    question: "Does it distinguish facts, estimates, evidence, and uncertainty?",
    signals: [
      "No unsupported superlatives or guarantees",
      "Evidence or source basis is named when claims are made",
      "Uncertainty and assumptions are visible when relevant",
    ],
  },
  distinctiveness: {
    label: "Distinctiveness",
    question: "Does the communication have a specific House of Jazzu point of view?",
    signals: [
      "Specific product, process, or audience language",
      "Avoids generic AI or consulting filler",
      "Shows a memorable and relevant strategic angle",
    ],
  },
};

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

function clamp(value, min, max) {
  min = typeof min === "number" ? min : 0;
  max = typeof max === "number" ? max : 100;
  return Math.max(min, Math.min(max, Math.round(value)));
}

function normalize(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function countMatches(text, patterns) {
  const lower = text.toLowerCase();
  return patterns.reduce(function (count, pattern) {
    return count + (lower.indexOf(pattern) !== -1 ? 1 : 0);
  }, 0);
}

function metricScore(base, hits, possible) {
  if (!possible) return clamp(base);
  return clamp(base + (hits / possible) * 40);
}

function evaluateIdentityArtifact(input) {
  input = input || {};
  const title = normalize(input.title);
  const text = normalize(input.text);
  const audience = normalize(input.audience);
  const offer = normalize(input.offer);
  const callToAction = normalize(input.callToAction);
  const evidence = Array.isArray(input.evidence) ? input.evidence.map(normalize).filter(Boolean) : [];

  const combined = [title, text, audience, offer, callToAction].concat(evidence).filter(Boolean).join(" ");

  const hasHouseIdentity = /house of jazzu|nia(?:[-s]?evo)?|money munchkins|quantum quest/i.test(combined);
  const hasAudience = audience.length >= 3;
  const hasOffer = offer.length >= 5;
  const hasCta = callToAction.length >= 3;
  const hasEvidence = evidence.length > 0;
  const hasUncertainty = /\b(estimate|estimated|assumption|uncertain|confidence|subject to|verify|verification)\b/i.test(combined);
  const genericMatches = countMatches(combined, GENERIC_PHRASES);

  const scores = {
    recognizability: metricScore(hasHouseIdentity ? 60 : 20, [hasHouseIdentity, title.length >= 8, offer.length >= 5].filter(Boolean).length, 3),
    consistency: metricScore(hasAudience && hasOffer ? 55 : 25, [hasAudience, hasOffer, hasCta].filter(Boolean).length, 3),
    repeatability: metricScore(title.length >= 8 ? 45 : 20, [title.length >= 8, text.length >= 80, hasOffer, hasEvidence].filter(Boolean).length, 4),
    shareability: metricScore(hasOffer ? 45 : 20, [title.length >= 8, hasAudience, hasOffer, hasCta].filter(Boolean).length, 4),
    trust: clamp(metricScore(hasEvidence ? 55 : 25, [hasEvidence, hasUncertainty, genericMatches === 0].filter(Boolean).length, 3) - genericMatches * 7),
    distinctiveness: clamp(metricScore(hasHouseIdentity ? 50 : 20, [hasHouseIdentity, /capital|real estate|financial literacy|grant|housing|deal flow/i.test(combined), genericMatches === 0].filter(Boolean).length, 3) - genericMatches * 6),
  };

  const overall = clamp(Object.keys(scores).reduce(function (sum, k) { return sum + scores[k]; }, 0) / Object.keys(scores).length);

  const strengths = [];
  const gaps = [];

  if (scores.recognizability >= 70) strengths.push("The artifact carries identifiable House of Jazzu or product identity.");
  else gaps.push("Name the House of Jazzu product or specific identity earlier and more clearly.");

  if (scores.shareability >= 70) strengths.push("The audience, offer, and next step are easy to pass along.");
  else gaps.push("Add one specific audience benefit and one explicit next step.");

  if (scores.trust >= 70) strengths.push("Claims are grounded with evidence, assumptions, or uncertainty cues.");
  else gaps.push("Separate verified facts from estimates and name the evidence behind material claims.");

  if (scores.repeatability >= 70) strengths.push("The structure can be reused as a branded brief, card, or campaign template.");
  else gaps.push("Use a repeatable structure: headline, audience, outcome, proof, and call-to-action.");

  if (scores.distinctiveness < 70) gaps.push("Replace generic AI or consulting language with a concrete House of Jazzu point of view.");

  if (genericMatches > 0) {
    const found = GENERIC_PHRASES.filter(function (p) { return combined.toLowerCase().indexOf(p) !== -1; });
    gaps.push("Reduce generic language: " + found.join(", ") + ".");
  }

  return {
    framework: "WARHOL_IDENTITY_METRICS_V1",
    overall: overall,
    scores: scores,
    strengths: strengths.slice(0, 3),
    gaps: gaps.slice(0, 5),
    inputsUsed: {
      hasTitle: Boolean(title),
      hasAudience: hasAudience,
      hasOffer: hasOffer,
      hasCallToAction: hasCta,
      evidenceCount: evidence.length,
    },
  };
}

function summarizeForChat(metrics) {
  if (!metrics) return "Warhol identity metrics: unavailable.";
  const scoreLine = Object.keys(metrics.scores).map(function (k) { return k + ": " + metrics.scores[k] + "/100"; }).join(", ");
  const strengths = metrics.strengths.length ? metrics.strengths.map(function (x) { return "- " + x; }).join(NL) : "- No validated strengths available.";
  const gaps = metrics.gaps.length ? metrics.gaps.map(function (x) { return "- " + x; }).join(NL) : "- No critical gaps detected from the supplied material.";
  return [
    "Warhol identity score: " + metrics.overall + "/100.",
    "Dimension scores: " + scoreLine + ".",
    "Strengths:",
    strengths,
    "Priority improvements:",
    gaps,
    "Interpret these as a review of supplied content, not as live public-market or social-media metrics.",
  ].join(NL);
}

module.exports = {
  METRIC_DEFINITIONS: METRIC_DEFINITIONS,
  evaluateIdentityArtifact: evaluateIdentityArtifact,
  summarizeForChat: summarizeForChat,
};