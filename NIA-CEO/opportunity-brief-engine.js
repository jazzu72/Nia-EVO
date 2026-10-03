'use strict';

/*
 * HOUSE OF JAZZU — OPPORTUNITY BRIEF ENGINE
 *
 * Converts qualified revenue opportunities into executive-review briefs.
 *
 * READ-ONLY:
 * - no prospect creation
 * - no persistence
 * - no outreach
 * - no external execution
 * - owner authorization required
 */

function clean(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildBrief(opportunity = {}) {
  const serviceFit = opportunity.serviceFit || {};

  const classification = opportunity.opportunityType || 'UNKNOWN';
  const commercialFit = opportunity.commercialFit || 'NONE';

  const qualified =
    classification === 'REVENUE_OPPORTUNITY' &&
    ['DIRECT', 'POSSIBLE'].includes(commercialFit);

  const evidence = [
    opportunity.title,
    opportunity.description,
    opportunity.whyItMatters
  ]
    .map(clean)
    .filter(Boolean);

  const problem =
    clean(opportunity.description) ||
    'Commercial problem requires additional evidence.';

  const potentialCustomer =
    clean(opportunity.author || opportunity.source) ||
    'Unknown';

  const services = Array.isArray(serviceFit.services)
    ? serviceFit.services
    : [];

  const unknowns = [
    'Budget or willingness to pay',
    'Timeline',
    'Decision-maker status',
    'Exact scope of work',
    'Whether the public request remains active'
  ];

  let recommendedNextStep;

  if (commercialFit === 'DIRECT') {
    recommendedNextStep =
      'Prepare an evidence-backed owner-review offer hypothesis. Do not contact the subject.';
  } else if (commercialFit === 'POSSIBLE') {
    recommendedNextStep =
      'Research the problem and validate whether a concrete House of Jazzu offer exists. Do not contact the subject.';
  } else {
    recommendedNextStep =
      'Retain as intelligence only; do not treat as a sales opportunity.';
  }

  return {
    briefType: 'HOUSE_OF_JAZZU_OPPORTUNITY_BRIEF',
    qualified,
    title: clean(opportunity.title) || 'Untitled opportunity',

    problem,
    evidence,

    potentialCustomer,
    source: opportunity.source || 'unknown',
    sourceUrl: opportunity.url || null,

    commercialIntent:
      serviceFit.commercialIntent || 'NOT_EXPLICIT',

    classification,
    commercialFit,

    houseOfJazzuFit: {
      fit: serviceFit.fit || 'UNKNOWN',
      confidence: Number(serviceFit.confidence || 0),
      services
    },

    potentialOffer:
      qualified
        ? 'Define after evidence review; no offer is authorized or committed.'
        : null,

    unknowns,
    recommendedNextStep,

    governance: {
      persisted: false,
      mutation: false,
      outreachSent: false,
      externalExecution: 'BLOCKED',
      authorizationRequired: true
    }
  };
}

function buildQualifiedBriefs(opportunities = []) {
  return opportunities
    .filter(opportunity =>
      opportunity.opportunityType === 'REVENUE_OPPORTUNITY' &&
      ['DIRECT', 'POSSIBLE'].includes(
        opportunity.commercialFit
      )
    )
    .map(buildBrief);
}

module.exports = {
  buildBrief,
  buildQualifiedBriefs
};
