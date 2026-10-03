'use strict';

/**
 * NIA Capital Evidence Engine
 *
 * Read-only intelligence layer for funding and procurement evidence.
 *
 * Governance:
 * - No persistence
 * - No applications
 * - No bids
 * - No outreach
 * - No spending
 * - No contracts
 * - No external execution
 * - Owner review required
 */

const VERIFICATION_STATES = [
  'REQUIRED',
  'PARTIAL',
  'VERIFIED',
  'DISQUALIFIED'
];

function buildEvidence(opportunity = {}) {
  const type = opportunity.opportunityType || opportunity.type || 'UNKNOWN';
  const isFunding = type === 'FUNDING_OPPORTUNITY';
  const isContract = type === 'CONTRACT_OPPORTUNITY';

  const title = String(opportunity.title || '');
  const source = String(opportunity.source || '');
  const url = opportunity.url || null;

  const description = String(
    opportunity.description ||
    opportunity.summary ||
    opportunity.snippet ||
    opportunity.whyItMatters ||
    ''
  );

  const text = [
    title,
    source,
    description,
    String(opportunity.category || ''),
    String(opportunity.opportunityType || '')
  ].join(' ');

  const awardedContract =
    isContract &&
    /\b(wins|won|awarded|awards|award(ed)?|selected)\b/i.test(text);

  const possibleOpenSolicitation =
    isContract &&
    /\b(rfp|rfq|request for proposal|request for quote|solicitation|bid|task order)\b/i.test(text);

  const procurementStatus = isContract
    ? awardedContract
      ? 'AWARDED_CONTRACT'
      : possibleOpenSolicitation
        ? 'POSSIBLE_OPEN_SOLICITATION'
        : 'UNKNOWN'
    : null;

  const eligibilityStatus =
    /\b(small business|small businesses|startup|entrepreneur|sbir|sttr)\b/i.test(text)
      ? 'POTENTIAL_MATCH'
      : 'UNKNOWN';

  const sourceType =
    /\b(nsf|sba|sam\.gov|grants\.gov|federal register|government)\b/i.test(
      `${source} ${title} ${description}`
    )
      ? 'PRIMARY_GOVERNMENT_SOURCE'
      : 'NEWS_OR_SECONDARY_SOURCE';

  const qualificationScore = Number(
    opportunity.qualificationScore ??
    opportunity.score ??
    0
  );

  let requiredVerification;
  let evidenceGaps;
  let houseOfJazzuFit;

  if (isFunding) {
    requiredVerification = [
      'applicant eligibility',
      'eligible technology/business scope',
      'award amount and structure',
      'deadline',
      'required evidence'
    ];

    evidenceGaps = [
      'applicant eligibility',
      'program eligibility',
      'eligible technology/business scope',
      'award amount and structure',
      'deadline',
      'required evidence',
      'authoritative program documentation'
    ];

    houseOfJazzuFit = 'REQUIRES_PROGRAM_REVIEW';
  } else if (isContract) {
    requiredVerification = [
      'actual solicitation',
      'buyer',
      'scope of work',
      'vendor eligibility',
      'response deadline'
    ];

    evidenceGaps = [
      'actual open solicitation',
      'solicitation number',
      'buyer',
      'scope of work',
      'vendor eligibility',
      'set-aside or size-standard requirements',
      'response deadline',
      'authoritative solicitation documentation'
    ];

    houseOfJazzuFit = 'REQUIRES_SOLICITATION_REVIEW';
  } else {
    requiredVerification = [
      'source verification',
      'eligibility',
      'scope',
      'timing'
    ];

    evidenceGaps = [
      'source verification',
      'eligibility',
      'scope',
      'timing'
    ];

    houseOfJazzuFit = 'REQUIRES_REVIEW';
  }

  return {
    type,
    title,
    score: qualificationScore,
    source,
    url,

    evidenceSignals: {
      titleSignal: title,
      sourceSignal: source,
      categorySignal: opportunity.category || null,
      descriptionSignal: description.slice(0, 1000),
      qualificationScore
    },

    evidenceQuality: {
      level: sourceType === 'PRIMARY_GOVERNMENT_SOURCE'
        ? 'PRIMARY'
        : 'SECONDARY',
      sourceType,
      requiresPrimarySourceVerification:
        sourceType !== 'PRIMARY_GOVERNMENT_SOURCE'
    },

    verificationStatus: 'REQUIRED',

    verificationStates: VERIFICATION_STATES,

    verificationDecision: {
      status: 'REQUIRED',
      verifiedBy: null,
      verifiedAt: null,
      notes: [],
      ownerAuthorizationRequired: true
    },

    sourceVerification: {
      status: 'REQUIRED',
      authoritativeSourceRequired: true,
      sourceChecked: false,
      verifiedAt: null,
      verificationNotes: []
    },

    procurementStatus,

    eligibilityStatus,

    houseOfJazzuFit,

    requiredVerification,

    evidenceGaps,

    action: 'OWNER_REVIEW_ONLY',

    governance: {
      persisted: false,
      mutation: false,
      outreachSent: false,
      externalExecution: 'BLOCKED',
      authorizationRequired: true
    }
  };
}

function screen(opportunities = []) {
  if (!Array.isArray(opportunities)) return [];

  return opportunities
    .filter(opportunity => {
      const type =
        opportunity?.opportunityType ||
        opportunity?.type;

      return (
        type === 'FUNDING_OPPORTUNITY' ||
        type === 'CONTRACT_OPPORTUNITY'
      );
    })
    .map(buildEvidence);
}

module.exports = {
  VERIFICATION_STATES,
  buildEvidence,
  screen
};
