'use strict';

/*
 * HOUSE OF JAZZU SERVICE-FIT ENGINE
 *
 * Purpose:
 * Determine whether a discovered problem has a plausible
 * House of Jazzu service/product fit.
 *
 * READ-ONLY:
 * - no prospect creation
 * - no persistence
 * - no outreach
 * - no external execution
 * - owner authorization always required
 */

const SERVICES = [
  {
    id: 'REVENUE_INTELLIGENCE',
    name: 'Revenue Intelligence & Opportunity Research',
    signals: /\b(revenue|profit|pricing|buyers|market|business model|sales|selling strategy|monetiz|sourcing|inventory)\b/i
  },
  {
    id: 'BUSINESS_OPERATIONS',
    name: 'Small Business Operations & Systems',
    signals: /\b(operations|workflow|process|inventory|tracking|organization|systems|automation|business process)\b/i
  },
  {
    id: 'MARKET_RESEARCH',
    name: 'Market & Product Research',
    signals: /\b(find|research|source|sourcing|valuation|appraisal|pricing|market|product|item|supplier|wholesale|liquidation)\b/i
  },
  {
    id: 'AI_AUTOMATION',
    name: 'AI & Business Automation',
    signals: /\b(automation|automate|ai|artificial intelligence|software|workflow|data|dashboard|tool)\b/i
  },
  {
    id: 'ASSET_LIQUIDATION',
    name: 'Asset & Inventory Monetization Strategy',
    signals: /\b(attic|estate|liquidat|inventory|stock|items|furniture|clothes|toys|dishware|collectibles)\b/i
  }
];

function clean(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function analyze(deal = {}) {
  const text = clean(`${deal.title || ''} ${deal.description || ''}`);

  const matches = SERVICES
    .filter(service => service.signals.test(text))
    .map(service => service.id);

  const explicitHire =
    /\b(hire|hiring|looking for someone|looking to hire|pay someone|paid help|service)\b/i
      .test(text);

  const explicitNeed =
    /\b(need help|looking for help|expertise needed|how do i|how can i|where do i go|what should i do)\b/i
      .test(text);

  let fit = 'UNKNOWN';

  if (matches.length >= 2 && (explicitHire || explicitNeed)) {
    fit = 'DIRECT';
  } else if (matches.length >= 1 && (explicitHire || explicitNeed)) {
    fit = 'POSSIBLE';
  } else if (matches.length >= 1) {
    fit = 'POSSIBLE';
  } else {
    fit = 'NONE';
  }

  let confidence = 0;

  if (matches.length >= 1) confidence += 35;
  if (matches.length >= 2) confidence += 20;
  if (explicitNeed) confidence += 20;
  if (explicitHire) confidence += 25;

  confidence = Math.min(100, confidence);

  const serviceNames = SERVICES
    .filter(service => matches.includes(service.id))
    .map(service => service.name);

  let nextAction;

  switch (fit) {
    case 'DIRECT':
      nextAction =
        'Prepare an evidence-backed opportunity brief for owner review; do not contact the subject.';
      break;
    case 'POSSIBLE':
      nextAction =
        'Research the problem further and determine whether a concrete House of Jazzu offer exists.';
      break;
    case 'UNKNOWN':
      nextAction =
        'Gather additional evidence before treating this as a commercial opportunity.';
      break;
    default:
      nextAction =
        'Retain as intelligence only; no commercial action recommended.';
  }

  return {
    fit,
    confidence,
    serviceIds: matches,
    services: serviceNames,
    commercialIntent: explicitHire ? 'EXPLICIT_HIRE' :
      explicitNeed ? 'EXPLICIT_NEED' :
      'NOT_EXPLICIT',
    nextAction,

    readOnly: true,
    persisted: false,
    mutation: false,
    outreachSent: false,
    externalExecution: 'BLOCKED',
    authorizationRequired: true
  };
}

module.exports = {
  SERVICES,
  analyze
};
