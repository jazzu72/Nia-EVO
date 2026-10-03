'use strict';

const rss = require('../aios/rss/rss-revenue-bridge');
const revenue = require('../revenue/revenue-engine');
const acquisition = require('../revenue/acquisition/acquisition-engine');
const capital = require('../intelligence/capital-engine');
const DealDiscovery = require('../deal-discovery');
const GooglePlaces = require('./google-places-discovery');
const ServiceFit = require('./service-fit-engine');

function safe(fn, fallback = null) {
  try {
    return fn();
  } catch (_) {
    return fallback;
  }
}

function textOf(deal) {
  return `${deal.title || ''} ${deal.description || ''}`.toLowerCase();
}

function classifyOpportunity(deal) {
  const text = textOf(deal);

  const risk =
    /\b(scam|fraud|stolen|warning|beware|impersonat|lost \$[\d,]+)\b/i.test(text);

  /*
   * Commercial intent must be explicit.
   * General selling pain, advice requests, and marketplace discussion
   * are NOT revenue opportunities by themselves.
   */
  const explicitHire =
    /\b(hire|hiring|looking to hire|pay someone|paid help|looking for someone to help|someone to hire)\b/i
      .test(text);

  const explicitServiceRequest =
    /\b(looking for a service|need a service|seeking a service|service provider|consultant|consulting|expertise needed)\b/i
      .test(text);

  /*
   * Commercial context alone is not enough.
   * Require an actual transaction/service/monetization request.
   */
  const explicitCommercial =
    /\b(sell my|liquidat(e|ion)|valuation (service|help)|appraisal (service|help)|pricing service|business opportunity|looking for buyers|looking for a buyer|looking for clients)\b/i
      .test(text);

  const marketplaceIntent =
    /\b(ebay|etsy|facebook marketplace|chairish|reseller|reselling|buyers|inventory|profit|pricing|wholesale)\b/i
      .test(text);

  const rssCategory = String(deal.category || '').toLowerCase();

  const fundingSignal =
    rssCategory === 'funding_opportunity' ||
    /\b(grant|funding opportunity|sbir|sttr|seed fund|pilot funding|commercialization funding)\b/i
      .test(text);

  const contractSignal =
    rssCategory === 'contract_opportunity' ||
    /\b(contract opportunity|procurement|request for proposal|request for quote|rfp|rfq|task order)\b/i
      .test(text);

  const pain =
    /\b(problem|struggling|can't sell|cannot sell|difficulty|difficult|issue|mistake|inventory error|not selling|losing money|lost money)\b/i
      .test(text);

  const educational =
    /\b(thread|lessons learned|newbie|newb|advice|tips|experience|journey)\b/i
      .test(text);

  if (risk) {
    return 'RISK_WARNING';
  }

  if (fundingSignal) {
    return 'FUNDING_OPPORTUNITY';
  }

  if (contractSignal) {
    return 'CONTRACT_OPPORTUNITY';
  }

  if (
    explicitHire ||
    explicitServiceRequest ||
    (explicitCommercial && !educational && !marketplaceIntent)
  ) {
    return 'REVENUE_OPPORTUNITY';
  }

  if (pain && marketplaceIntent) {
    return 'CUSTOMER_PAIN';
  }

  if (educational) {
    return 'EDUCATIONAL';
  }

  if (marketplaceIntent) {
    return 'MARKET_INTELLIGENCE';
  }

  return 'NO_ACTION';
}

function qualificationScore(deal, classification) {
  const text = textOf(deal);

  let score = Number(deal.qualificationScore || 0);

  if (classification === 'REVENUE_OPPORTUNITY') score += 30;
  if (classification === 'CUSTOMER_PAIN') score += 10;
  if (classification === 'MARKET_INTELLIGENCE') score += 5;
  if (classification === 'RISK_WARNING') score = Math.min(score, 25);
  if (classification === 'EDUCATIONAL') score = Math.min(score, 20);

  if (/\b(hire|hiring|client|customer|consultant|consulting)\b/.test(text)) {
    score += 15;
  }

  if (/\b(need help|expertise needed|looking for help)\b/.test(text)) {
    score += 10;
  }

  if (/\b(scam|fraud|stolen|impersonat)\b/.test(text)) {
    score -= 30;
  }

  return Math.max(0, Math.min(100, score));
}

function recommendation(classification) {
  switch (classification) {
    case 'REVENUE_OPPORTUNITY':
      return 'Review evidence and prepare a potential offer for owner authorization.';
    case 'CUSTOMER_PAIN':
      return 'Monitor for stronger commercial intent before proposing outreach.';
    case 'FUNDING_OPPORTUNITY':
      return 'Review eligibility, program requirements, deadline, award structure, and evidence before any owner decision.';
    case 'CONTRACT_OPPORTUNITY':
      return 'Review solicitation, buyer, scope, eligibility, deadline, and fit before any owner decision.';
    case 'MARKET_INTELLIGENCE':
      return 'Capture market signal; no outreach recommended.';
    case 'RISK_WARNING':
      return 'Record as risk intelligence; do not treat as a sales lead.';
    case 'EDUCATIONAL':
      return 'Retain as background intelligence only.';
    default:
      return 'No action.';
  }
}

class RevenueIntelligenceScout {
  async scout(limit = 25) {
    const discovered = await safe(
      () => rss.discover(limit),
      []
    );

    const discoveryItems =
      Array.isArray(discovered)
        ? discovered
        : discovered?.opportunities ||
          discovered?.items ||
          [];

    const engine = new DealDiscovery();
    const liveDeals = await safe(
      () => engine.discoverDeals(),
      []
    );

    /*
     * Local business discovery is evidence collection only.
     * It does NOT qualify businesses as revenue opportunities.
     */
    const placesQueries = [
      'small business needing automation',
      'small business consulting',
      'business operations consulting',
      'inventory management business',
      'local business technology services'
    ];

    const placesLocation = {
      lat: Number(process.env.NIA_PLACES_LAT),
      lng: Number(process.env.NIA_PLACES_LNG)
    };

    const placesKey = process.env.GOOGLE_PLACES_API_KEY;

    const placesDeals = placesKey && placesLocation.lat && placesLocation.lng
      ? (await Promise.all(
          placesQueries.map(query =>
            safe(
              () => GooglePlaces.searchBusinesses({
                apiKey: placesKey,
                query,
                location: placesLocation,
                radius: Number(process.env.NIA_PLACES_RADIUS || 25000),
                pageSize: 10
              }),
              []
            )
          )
        )).flat()
      : [];

    const placeItems = placesDeals.map(deal => ({
      ...deal,
      description: `${deal.description || ''} ${deal.website || ''}`.trim()
    }));

    /*
     * RSS intelligence is discovery evidence.
     * Normalize it into the same read-only classification pipeline
     * used by live deal discovery. No prospect mutation or outreach.
     */
    const rssDeals = discoveryItems.map(item => ({
      source: item.source || 'nia_rss',
      sourceId: item.source_id || item.sourceId || item.id || item.url || null,
      title: item.name || item.title || 'RSS intelligence',
      description: item.description || '',
      url: item.url || item.link || null,
      category: item.category || null,
      qualificationScore: Number(item.score || 0)
    }));

    const combinedDeals = [...rssDeals, ...liveDeals, ...placeItems];

    const deals = combinedDeals.map(deal => {
      const classification = classifyOpportunity(deal);
      const score = qualificationScore(deal, classification);
      const serviceFit = ServiceFit.analyze(deal);

      const commercialFit =
        classification === 'REVENUE_OPPORTUNITY' &&
        serviceFit.fit === 'DIRECT'
          ? 'DIRECT'
          : classification === 'REVENUE_OPPORTUNITY' &&
            serviceFit.fit === 'POSSIBLE'
              ? 'POSSIBLE'
              : classification === 'CUSTOMER_PAIN'
                ? 'PAIN_ONLY'
                : 'NONE';

      return {
        source: deal.source || 'unknown',
        sourceId: deal.sourceId || deal.id || null,
        company: deal.company || null,
        opportunityType: classification,
        title: deal.title,
        description: deal.description || '',
        url: deal.url || null,
        qualificationScore: score,
        originalScore: Number(deal.qualificationScore || 0),
        evidence: {
          title: deal.title || '',
          description: deal.description || '',
          source: deal.source || null
        },
        whyItMatters:
          classification === 'REVENUE_OPPORTUNITY'
            ? 'Observable commercial need with evidence of potential demand.'
            : classification === 'CUSTOMER_PAIN'
              ? 'Observable problem or friction that may become commercially relevant.'
              : classification === 'FUNDING_OPPORTUNITY'
                ? 'Funding signal that may warrant eligibility, program, timing, and evidence review; not itself a sales lead.'
                : classification === 'CONTRACT_OPPORTUNITY'
                  ? 'Procurement signal that may warrant scope, eligibility, buyer, and solicitation review; not itself a sales lead.'
                  : classification === 'MARKET_INTELLIGENCE'
                    ? 'Useful signal about pricing, buyers, marketplaces, or reseller behavior.'
                    : classification === 'RISK_WARNING'
                      ? 'Potential fraud, scam, or operational risk signal.'
                      : 'Background information without sufficient commercial evidence.',
        serviceFit,
        commercialFit,

        recommendedNextAction:
          classification === 'REVENUE_OPPORTUNITY'
            ? serviceFit.nextAction
            : recommendation(classification),

        /*
         * Governance is explicit on every item.
         */
        readOnly: true,
        persisted: false,
        mutation: false,
        outreachSent: false,
        externalExecution: 'BLOCKED',
        authorizationRequired: true
      };
    });

    const revenueOpportunities = deals
      .filter(x => x.opportunityType === 'REVENUE_OPPORTUNITY')
      .sort((a, b) => b.qualificationScore - a.qualificationScore);

    const customerPain = deals
      .filter(x => x.opportunityType === 'CUSTOMER_PAIN')
      .sort((a, b) => b.qualificationScore - a.qualificationScore);

    const fundingOpportunities = deals
      .filter(x => x.opportunityType === 'FUNDING_OPPORTUNITY')
      .sort((a, b) => b.qualificationScore - a.qualificationScore);

    const contractOpportunities = deals
      .filter(x => x.opportunityType === 'CONTRACT_OPPORTUNITY')
      .sort((a, b) => b.qualificationScore - a.qualificationScore);

    const counts = {};

    for (const item of deals) {
      counts[item.opportunityType] =
        (counts[item.opportunityType] || 0) + 1;
    }

    return {
      mode: 'READ_ONLY',
      discovered: deals.length,
      rssSignals: discoveryItems.length,
      classifications: counts,
      revenueOpportunities,
      customerPain,
      fundingOpportunities,
      contractOpportunities,
      opportunities: deals,
      placesStatus: {
        configured: Boolean(
          process.env.GOOGLE_PLACES_API_KEY &&
          process.env.NIA_PLACES_LAT &&
          process.env.NIA_PLACES_LNG
        ),
        discovered: placesDeals.length,
        queries: placesQueries.length,
        readOnly: true,
        mutation: false,
        externalExecution: 'BLOCKED'
      },
      governance: {
        persisted: false,
        mutation: false,
        outreachSent: false,
        externalExecution: 'BLOCKED',
        authorizationRequired: true
      }
    };
  }

  async run(limit = 25) {
    return this.scout(limit);
  }
}

module.exports = RevenueIntelligenceScout;
module.exports.RevenueIntelligenceScout = RevenueIntelligenceScout;
module.exports.classifyOpportunity = classifyOpportunity;
module.exports.qualificationScore = qualificationScore;
