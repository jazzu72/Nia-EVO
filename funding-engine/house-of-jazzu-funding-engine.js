const fs = require("fs");
const path = require("path");

const PROFILE_PATH = path.join(
  __dirname,
  "..",
  "data",
  "funding",
  "house-of-jazzu-profile.json"
);

function loadProfile() {
  if (!fs.existsSync(PROFILE_PATH)) {
    throw new Error("HOUSE_OF_JAZZU_PROFILE_MISSING");
  }
  return JSON.parse(fs.readFileSync(PROFILE_PATH, "utf8"));
}

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

function scoreOpportunity(opportunity, profile) {
  const text = normalize([
    opportunity.name,
    opportunity.title,
    opportunity.description,
    opportunity.category,
    ...(opportunity.keywords || [])
  ].join(" "));

  let score = 0;
  const reasons = [];

  for (const keyword of profile.targetSponsors.corporateProgramKeywords) {
    if (text.includes(normalize(keyword))) {
      score += 8;
      reasons.push(`keyword:${keyword}`);
    }
  }

  for (const theme of profile.impactThemes) {
    if (text.includes(normalize(theme))) {
      score += 6;
      reasons.push(`impact:${theme}`);
    }
  }

  for (const industry of profile.targetSponsors.industries) {
    if (text.includes(normalize(industry))) {
      score += 5;
      reasons.push(`industry:${industry}`);
    }
  }

  if (profile.targetSponsors.geographyPriority.some(
    x => text.includes(normalize(x))
  )) {
    score += 10;
    reasons.push("geographic_priority");
  }

  if (opportunity.verifiedSource === true) {
    score += 10;
    reasons.push("verified_source");
  }

  if (opportunity.eligibilityVerified === true) {
    score += 10;
    reasons.push("eligibility_verified");
  }

  if (opportunity.deadlineVerified === true) {
    score += 10;
    reasons.push("deadline_verified");
  }

  if (opportunity.amountVerified === true) {
    score += 10;
    reasons.push("funding_amount_verified");
  }

  return {
    score: Math.min(score, 100),
    reasons,
    eligibleForOwnerReview:
      score >= profile.matchingRules.minimumRelevanceScore &&
      profile.matchingRules.requireVerifiedSource === true &&
      opportunity.verifiedSource === true &&
      profile.matchingRules.requireEligibilityEvidence === true &&
      opportunity.eligibilityVerified === true &&
      profile.matchingRules.requireDeadlineEvidence === true &&
      opportunity.deadlineVerified === true &&
      profile.matchingRules.requireFundingAmountEvidence === true &&
      opportunity.amountVerified === true
  };
}

function analyze(opportunity) {
  const profile = loadProfile();
  const result = scoreOpportunity(opportunity, profile);

  return {
    organization: profile.organization.name,
    role: profile.niaInstructions.role,
    opportunity: opportunity.name || opportunity.title || null,
    relevanceScore: result.score,
    reasons: result.reasons,
    eligibleForOwnerReview: result.eligibleForOwnerReview,
    mode: profile.ownerControls.mode,
    submissionAllowed: false,
    signingAllowed: false,
    financialExecutionAllowed: false,
    moneyMovementAllowed: false,
    automaticApprovalAllowed: false,
    ownerApprovalRequired: true,
    ownerSignatureRequired: true
  };
}

module.exports = {
  loadProfile,
  scoreOpportunity,
  analyze
};
