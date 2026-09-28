'use strict';

const fs = require('fs');
const path = require('path');

const PROFILE_PATH = path.join(__dirname, 'funding-profile.json');
const INTAKE_PATH = path.join(
  __dirname, '..', 'data', 'funding', 'verified-funding-intake.json'
);

function loadProfile() {
  if (!fs.existsSync(PROFILE_PATH)) {
    return {
      organization: { name: 'House of Jazzu' },
      ownerControls: { mode: 'OWNER_REVIEW_ONLY' }
    };
  }
  return JSON.parse(fs.readFileSync(PROFILE_PATH, 'utf8'));
}

function text(v) {
  return String(v ?? '').trim();
}

function verifyCandidate(candidate = {}) {
  const evidence = candidate.evidence || {};
  const verification = candidate.verification || {};
  const source = candidate.source || {};

  const officialUrl =
    candidate.officialUrl ||
    source.officialUrl ||
    evidence.officialUrl ||
    candidate.url ||
    null;

  const sourceUrl =
    candidate.sourceUrl ||
    source.url ||
    candidate.url ||
    officialUrl ||
    null;

  let sourceDomain = null;
  try {
    sourceDomain = sourceUrl ? new URL(sourceUrl).hostname : null;
  } catch {}

  const title = text(candidate.name || candidate.title);

  const sourceVerified = Boolean(
    verification.sourceVerified ||
    candidate.sourceVerified ||
    sourceUrl
  );

  const opportunityId = text(
    evidence.opportunityId ||
    candidate.opportunityId
  );
  const opportunityNumber = text(
    evidence.opportunityNumber ||
    candidate.opportunityNumber
  );

  const opportunityVerified = Boolean(
    opportunityId || opportunityNumber
  );

  const eligibilityVerified = Boolean(
    verification.eligibilityVerified ||
    evidence.eligibility ||
    evidence.eligibilityEvidence
  );

  const deadlineVerified = Boolean(
    verification.deadlineVerified ||
    evidence.deadline ||
    evidence.deadlineEvidence
  );

  const applicationPathVerified = Boolean(
    verification.applicationPathVerified ||
    evidence.applicationPath ||
    evidence.applicationEvidence
  );

  const aggregator = /grantportal|instrumentl|federalgrants|grantwatch/i
    .test(sourceDomain || sourceUrl || '');

  const officialSource = Boolean(
    candidate.officialSource ||
    verification.officialSource ||
    /\.gov$/i.test(sourceDomain || '') ||
    /\.edu$/i.test(sourceDomain || '') ||
    /\.org$/i.test(sourceDomain || '') ||
    !aggregator
  );

  const verified =
    sourceVerified &&
    Boolean(title) &&
    opportunityVerified &&
    eligibilityVerified &&
    deadlineVerified &&
    applicationPathVerified;

  const status = verified
    ? 'VERIFIED_REVIEW_REQUIRED'
    : sourceVerified
      ? 'SOURCE_FOUND_REQUIRES_VERIFICATION'
      : 'UNVERIFIED';

  return {
    verified,
    status,
    sourceVerified,
    opportunityVerified,
    eligibilityVerified,
    deadlineVerified,
    applicationPathVerified,
    officialSource,
    aggregator,
    sourceDomain,
    officialUrl,
    sourceUrl,

    evidence: {
      title: evidence.title || title || null,
      description: evidence.description || null,
      opportunityId: evidence.opportunityId || null,
      opportunityNumber: evidence.opportunityNumber || null,
      eligibility: evidence.eligibility || null,
      eligibilityEvidence: evidence.eligibilityEvidence || null,
      deadline: evidence.deadline || null,
      deadlineEvidence: evidence.deadlineEvidence || null,
      fundingAmount: evidence.fundingAmount || null,
      fundingAmountEvidence: evidence.fundingAmountEvidence || null,
      applicationPath: evidence.applicationPath || null,
      applicationEvidence: evidence.applicationEvidence || null
    },

    missingEvidence: [
      !opportunityVerified && 'opportunity',
      !eligibilityVerified && 'eligibility',
      !deadlineVerified && 'deadline',
      !applicationPathVerified && 'application_path'
    ].filter(Boolean)
  };
}

function intake(candidates) {
  const profile = loadProfile();

  const results = (Array.isArray(candidates) ? candidates : []).map((candidate, i) => {
    const verification = verifyCandidate(candidate);

    return {
      id:
        candidate.id ||
        candidate.opportunityId ||
        `funding-${Date.now()}-${i}`,

      name: candidate.name || candidate.title || null,
      source: candidate.source || null,

      officialUrl: verification.officialUrl,
      sourceUrl: verification.sourceUrl,
      sourceDomain: verification.sourceDomain,

      searchQuery: candidate.searchQuery || null,
      discoveryProvider: candidate.discoveryProvider || null,

      relevance: candidate.relevance || {
        score: 0,
        reasons: []
      },

      verification,

      ownerReviewOnly: true,
      submissionAllowed: false,
      signingAllowed: false,
      financialExecutionAllowed: false,
      moneyMovementAllowed: false,
      automaticApprovalAllowed: false,
      ownerApprovalRequired: true,
      ownerSignatureRequired: true,

      createdAt: new Date().toISOString()
    };
  });

  const payload = {
    generatedAt: new Date().toISOString(),
    organization: profile.organization?.name || 'House of Jazzu',
    state: 'OWNER_REVIEW_ONLY',

    candidateCount: results.length,

    verifiedCount: results.filter(
      x => x.verification.verified
    ).length,

    sourceVerifiedCount: results.filter(
      x => x.verification.sourceVerified
    ).length,

    opportunityVerifiedCount: results.filter(
      x => x.verification.opportunityVerified
    ).length,

    eligibilityVerifiedCount: results.filter(
      x => x.verification.eligibilityVerified
    ).length,

    deadlineVerifiedCount: results.filter(
      x => x.verification.deadlineVerified
    ).length,

    applicationPathVerifiedCount: results.filter(
      x => x.verification.applicationPathVerified
    ).length,

    rejectedCount: results.filter(
      x => !x.verification.verified
    ).length,

    safety: {
      submissionAllowed: false,
      signingAllowed: false,
      financialExecutionAllowed: false,
      moneyMovementAllowed: false,
      automaticApprovalAllowed: false,
      ownerApprovalRequired: true,
      ownerSignatureRequired: true
    },

    results
  };

  fs.mkdirSync(path.dirname(INTAKE_PATH), { recursive: true });

  fs.writeFileSync(
    INTAKE_PATH,
    JSON.stringify(payload, null, 2)
  );

  return payload;
}

module.exports = {
  loadProfile,
  verifyCandidate,
  intake
};
