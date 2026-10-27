'use strict';

/**
 * NIA EXECUTIVE CORE
 * ------------------
 * Authoritative executive decision layer for Nia.
 *
 * Flow:
 * OBSERVE -> UNDERSTAND -> PRIORITIZE -> DECIDE -> PREPARE
 *
 * IMPORTANT:
 * - Research/analysis may run autonomously.
 * - External side effects are NEVER executed here.
 * - Material actions require owner authorization.
 * - RSS discovery uses discover() only.
 * - RSS sync()/prospect persistence is deliberately excluded.
 */

const fs = require('fs');
const approvalLedger = require('../aios/approvals/approval-ledger');
const privateGovernance = require('./house-of-jazzu-governance');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const STATE_FILE = path.join(
  ROOT,
  'runtime',
  'nia-executive-state.json'
);

const AUDIT_FILE = path.join(
  ROOT,
  'data',
  'nia-executive-audit.jsonl'
);

const IDENTITY = {
  name: 'Nia',
  role: 'Private Executive AI',
  organization: 'House of Jazzu',
  authority: 'OWNER_ONLY',
  mission:
    'Increase capability, revenue, resilience, and long-term value of House of Jazzu',
  productRelationship:
    'Nia manages House of Jazzu products; Nia is not a product sold by House of Jazzu'
};

const GOVERNANCE = {
  autonomous: true,
  externalSideEffects: false,
  financialTransactions: false,
  contracts: false,
  legallyBindingSubmissions: false,
  sensitiveCommunications: false,
  infrastructureDestructiveActions: false,
  ownerAuthorizationRequired: true
};

const ENGINES = [
  'capital',
  'revenue',
  'acquisition',
  'intelligence',
  'operations',
  'automation',
  'real_estate',
  'ip_assets',
  'communications',
  'products',
  'memory',
  'governance'
];

function ensureStorage() {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.mkdirSync(path.dirname(AUDIT_FILE), { recursive: true });

  if (!fs.existsSync(STATE_FILE)) {
    fs.writeFileSync(
      STATE_FILE,
      JSON.stringify(
        {
          cycle: 0,
          lastRun: null,
          priorities: [],
          decisions: [],
          actionPlan: [],
          observations: null
        },
        null,
        2
      )
    );
  }

  if (!fs.existsSync(AUDIT_FILE)) {
    fs.writeFileSync(AUDIT_FILE, '');
  }
}

function loadState() {
  ensureStorage();

  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return {
      cycle: 0,
      lastRun: null,
      priorities: [],
      decisions: [],
      actionPlan: [],
      observations: null
    };
  }
}

function saveState(state) {
  ensureStorage();
  fs.writeFileSync(
    STATE_FILE,
    JSON.stringify(state, null, 2)
  );
}

function audit(event, data = {}) {
  ensureStorage();

  const record = {
    timestamp: new Date().toISOString(),
    component: 'NIA-CEO/executive-core',
    event,
    data
  };

  fs.appendFileSync(
    AUDIT_FILE,
    JSON.stringify(record) + '\n'
  );

  return record;
}

function safeLoad(modulePath) {
  try {
    return require(modulePath);
  } catch (error) {
    return {
      __loadError: error.message
    };
  }
}

async function safeCall(fn, fallback) {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

/**
 * OBSERVE
 *
 * This function is intentionally read-only.
 */
async function observe() {
  const revenue = safeLoad('../revenue/revenue-engine');
  const houseRevenue = safeLoad('../house-of-jazzu/lib/revenue-ledger');
  const operatingPlan = safeLoad('./strategy/revenue-operating-plan');
const quantumStudio = safeLoad('../quantum-studio/core/studio');
  const revenueIntel = safeLoad('../intelligence/revenue-engine');
  const acquisition = safeLoad('../acquisition/lead-acquisition-engine');
  const capital = safeLoad('../intelligence/capital-engine');
  const memory = safeLoad('../memory/memory-engine');

  /*
   * READ-ONLY RSS DISCOVERY
   *
   * discover() builds opportunities in memory.
   * sync() is intentionally NEVER called here.
   * sync() crosses into prospect persistence.
   */
  const rssRevenue = safeLoad('../aios/rss/rss-revenue-bridge');
  const opportunityBrief = safeLoad('./opportunity-brief-engine');
    const capitalEvidence = safeLoad('./capital-evidence-engine');

  const revenueDashboard =
    revenue && typeof revenue.dashboard === 'function'
      ? await safeCall(
          () => revenue.dashboard(),
          {
            totalDeals: 0,
            pipelineValue: 0,
            stages: {}
          }
        )
      : {
          totalDeals: 0,
          pipelineValue: 0,
          stages: {}
        };

  const revenuePipeline =
    revenue && typeof revenue.pipeline === 'function'
      ? await safeCall(
          () => revenue.pipeline(),
          []
        )
      : [];

  const revenueSummary =
    revenueIntel &&
    typeof revenueIntel.summary === 'function'
      ? await safeCall(
          () => revenueIntel.summary(),
          {
            opportunities: 0,
            totalPotential: 0,
            weightedPipeline: 0
          }
        )
      : {
          opportunities: 0,
          totalPotential: 0,
          weightedPipeline: 0
        };

  const acquisitionStats =
    acquisition &&
    typeof acquisition.stats === 'function'
      ? await safeCall(
          () => acquisition.stats(),
          {
            ok: true,
            total: 0,
            targets: []
          }
        )
      : {
          ok: true,
          total: 0,
          targets: []
        };

  const topProspects =
    acquisition &&
    typeof acquisition.topProspects === 'function'
      ? await safeCall(
          () => acquisition.topProspects(10),
          []
        )
      : [];

  const capitalOpportunities =
    capital &&
    typeof capital.top === 'function'
      ? await safeCall(
          () => capital.top(10),
          []
        )
      : [];

  const memoryRecords =
    memory &&
    typeof memory.allMemory === 'function'
      ? await safeCall(
          () => memory.allMemory(),
          []
        )
      : [];

  /*
   * HOUSE OF JAZZU REVENUE OPERATING STATE
   *
   * Verified revenue is the authoritative commercial baseline.
   * The operating plan supplies strategic product priorities.
   *
   * READ-ONLY:
   * - no payment processing
   * - no financial execution
   * - no external side effects
   * - owner authorization remains required
   */
  const houseRevenueSnapshot =
    houseRevenue &&
    typeof houseRevenue.snapshot === 'function'
      ? await safeCall(
          () => houseRevenue.snapshot(),
          {
            verifiedRevenue: 0,
            annualTarget: 1000000,
            remaining: 1000000,
            progressPercent: 0,
            products: {}
          }
        )
      : {
          verifiedRevenue: 0,
          annualTarget: 1000000,
          remaining: 1000000,
          progressPercent: 0,
          products: {}
        };

  const quantumStudioSnapshot =
  quantumStudio &&
  typeof quantumStudio.status === 'function'
    ? await safeCall(
        () => quantumStudio.status(),
        {
          ok: false,
          system: 'QUANTUM_STUDIO',
          status: 'UNAVAILABLE'
        }
      )
    : {
        ok: false,
        system: 'QUANTUM_STUDIO',
        status: 'UNAVAILABLE'
      };

const houseOperatingPlan =
    operatingPlan &&
    typeof operatingPlan.getOperatingPlan === 'function'
      ? await safeCall(
          () => operatingPlan.getOperatingPlan(),
          null
        )
      : null;

  /*
   * EXECUTIVE INTELLIGENCE SNAPSHOT
   *
   * One read-only scout pass feeds the separate executive lanes:
   *
   *   REVENUE     = actual commercial/customer opportunity
   *   FUNDING     = grant/capital opportunity
   *   PROCUREMENT = contract/RFP opportunity
   *
   * Funding and procurement signals are NOT revenue opportunities.
   * No persistence, outreach, or external execution occurs here.
   */
  let scoutResult = {
    opportunities: []
  };

  try {
    const scoutModule = safeLoad('./revenue-intelligence-scout');
    const Scout =
      scoutModule &&
      (scoutModule.RevenueIntelligenceScout || scoutModule);

    if (typeof Scout === 'function') {
      const scout = new Scout();

      scoutResult = await safeCall(
        () => scout.scout(100),
        { opportunities: [] }
      );
    }
  } catch (error) {
    scoutResult = {
      opportunities: []
    };
  }

  const executiveOpportunities =
    Array.isArray(scoutResult?.opportunities)
      ? scoutResult.opportunities
      : [];

  /*
   * Preserve the raw RSS evidence for traceability.
   * Prefer the single scout snapshot so all executive lanes
   * observe the same evidence set.
   */
  const rssOpportunities =
    executiveOpportunities.filter(
      opportunity =>
        String(opportunity.source || '').toLowerCase() === 'nia_rss' ||
        String(opportunity.category || '').toLowerCase().includes('opportunity')
    );

  /*
   * COMMERCIAL OPPORTUNITY INTELLIGENCE
   *
   * Only actual REVENUE_OPPORTUNITY records enter the
   * commercial brief engine.
   *
   * READ-ONLY:
   * - no prospect creation
   * - no persistence
   * - no outreach
   * - no external execution
   * - owner authorization required
   */
  let opportunityBriefs = [];

  if (
    opportunityBrief &&
    typeof opportunityBrief.buildQualifiedBriefs === 'function'
  ) {
    try {
      opportunityBriefs =
        opportunityBrief.buildQualifiedBriefs(
          executiveOpportunities
        );
    } catch (error) {
      opportunityBriefs = [];
    }
  }

  /*
   * CAPITAL / PROCUREMENT EVIDENCE
   *
   * These are executive-review intelligence records.
   * They are deliberately kept outside the revenue brief engine.
   */
  const fundingOpportunities =
    executiveOpportunities
      .filter(
        opportunity =>
          opportunity.opportunityType === 'FUNDING_OPPORTUNITY'
      )
      .sort(
        (a,b) =>
          Number(b.qualificationScore || 0) -
          Number(a.qualificationScore || 0)
      );

  const contractOpportunities =
    executiveOpportunities
      .filter(
        opportunity =>
          opportunity.opportunityType === 'CONTRACT_OPPORTUNITY'
      )
      .sort(
        (a,b) =>
          Number(b.qualificationScore || 0) -
          Number(a.qualificationScore || 0)
      );

  const capitalEvidenceItems =
    capitalEvidence &&
    typeof capitalEvidence.screen === 'function'
      ? capitalEvidence.screen([
          ...fundingOpportunities,
          ...contractOpportunities
        ])
      : [];

  return {
    timestamp: new Date().toISOString(),

    evidence: {
      revenueDashboard,
      revenuePipeline,
      revenueIntel: revenueSummary,

      houseRevenue: houseRevenueSnapshot,

      houseOperatingPlan: houseOperatingPlan,
      quantumStudio: quantumStudioSnapshot,

      acquisition: {
        stats: acquisitionStats,
        topProspects
      },

      capital: {
        opportunities: capitalOpportunities
      },

      memory: {
        records: memoryRecords
      },

      revenueDiscovery: {
        source: 'nia_revenue_intelligence',
        opportunities: executiveOpportunities,
        rssOpportunities,
        count: executiveOpportunities.length,
        opportunityBriefs,
        opportunityBriefCount: opportunityBriefs.length,
        readOnly: true,
        persisted: false,
        mutation: false,
        externalExecution: 'BLOCKED',
        authorizationRequired: true
      },

      capitalIntelligence: {
        evidenceItems: capitalEvidenceItems,
        evidenceCount: capitalEvidenceItems.length,
        fundingOpportunities,
        fundingCount: fundingOpportunities.length,
        contractOpportunities,
        contractCount: contractOpportunities.length,
        readOnly: true,
        persisted: false,
        mutation: false,
        outreachSent: false,
        externalExecution: 'BLOCKED',
        authorizationRequired: true
      }
    },

    governance: {
      autonomousResearchAllowed: true,
      autonomousExternalExecution: false,
      ownerAuthorizationRequired: true
    }
  };
}

/**
 * PRIORITIZE
 *
 * Converts evidence into executive priorities.
 */
function prioritize(observations) {
  const evidence = observations?.evidence || {};

  const revenueDashboard =
    evidence.revenueDashboard || {};

  const revenueIntel =
    evidence.revenueIntel || {};

  const acquisition =
    evidence.acquisition || {};

  const houseRevenue =
    evidence.houseRevenue || {};

  const houseOperatingPlan =
    evidence.houseOperatingPlan || {};

  const houseProducts =
    Array.isArray(houseOperatingPlan.products)
      ? houseOperatingPlan.products
      : [];

  const capital =
    evidence.capital || {};

  /*
   * COMMERCIAL OPPORTUNITY EVIDENCE
   *
   * These briefs are produced by the read-only commercial
   * intelligence layer during observe().
   *
   * They inform prioritization only.
   * They do NOT authorize execution.
   */
  const revenueDiscovery =
    evidence.revenueDiscovery || {};

  const opportunityBriefs =
    Array.isArray(revenueDiscovery.opportunityBriefs)
      ? revenueDiscovery.opportunityBriefs
      : [];

  const directBriefs =
    opportunityBriefs.filter(
      brief => brief.commercialFit === 'DIRECT'
    );

  const possibleBriefs =
    opportunityBriefs.filter(
      brief => brief.commercialFit === 'POSSIBLE'
    );

  const priorities = [];

  const verifiedRevenue =
    Number(houseRevenue.verifiedRevenue || 0);

  const annualRevenueTarget =
    Number(houseRevenue.annualTarget || 1000000);

  const revenueRemaining =
    Number(
      houseRevenue.remaining ??
      Math.max(annualRevenueTarget - verifiedRevenue, 0)
    );

  const revenueProgress =
    Number(houseRevenue.progressPercent || 0);

  const totalDeals =
    Number(revenueDashboard.totalDeals || 0);

  const pipelineValue =
    Number(revenueDashboard.pipelineValue || 0);

  const opportunities =
    Number(revenueIntel.opportunities || 0);

  const prospects =
    Number(
      acquisition.stats?.total ??
      acquisition.stats?.count ??
      0
    );

  const capitalIntelligence =
    evidence.capitalIntelligence || {};

  const legacyCapitalCount =
    Array.isArray(capital.opportunities)
      ? capital.opportunities.length
      : 0;

  const fundingOpportunities =
    Array.isArray(capitalIntelligence.fundingOpportunities)
      ? capitalIntelligence.fundingOpportunities
      : [];

  const contractOpportunities =
    Array.isArray(capitalIntelligence.contractOpportunities)
      ? capitalIntelligence.contractOpportunities
      : [];

  const fundingCount = fundingOpportunities.length;
  /*
   * Only possible open solicitations count as actionable
   * procurement opportunities. Awarded contracts remain
   * market intelligence and must not inflate CAP-001.
   */
  const openSolicitationContracts =
    contractOpportunities.filter(opportunity => {
      const title = String(opportunity.title || '');
      const description = String(
        opportunity.description ||
        opportunity.summary ||
        opportunity.snippet ||
        opportunity.whyItMatters ||
        ''
      );

      const text = [
        title,
        description,
        String(opportunity.category || ''),
        String(opportunity.opportunityType || '')
      ].join(' ');

      const awarded =
        /\\b(wins|won|awarded|awards|award(ed)?|selected)\\b/i.test(text);

      const solicitation =
        /\\b(rfp|rfq|request for proposal|request for quote|solicitation|bid|task order)\\b/i.test(text);

      return solicitation && !awarded;
    });

  const contractCount = openSolicitationContracts.length;

  const awardedContractCount =
    contractOpportunities.length - contractCount;

  const capitalCount =
    legacyCapitalCount +
    fundingCount +
    contractCount;

  /*
   * Revenue remains the first executive priority when
   * the active revenue pipeline is empty.
   *
   * If qualified commercial intelligence already exists,
   * Nia changes the objective from discovery to owner review.
   */
  if (
    pipelineValue === 0 &&
    totalDeals === 0
  ) {
    priorities.push({
      id: 'REV-001',
      area: 'revenue',
      priority: 'CRITICAL',

      objective:
        opportunityBriefs.length > 0
          ? 'Convert qualified revenue intelligence into owner-review opportunities'
          : 'Create qualified revenue opportunities',

      reason:
        opportunityBriefs.length > 0
          ? `Executive evidence contains ${opportunityBriefs.length} qualified commercial opportunities (${directBriefs.length} DIRECT, ${possibleBriefs.length} POSSIBLE), while the active revenue pipeline remains empty.`
          : 'Current evidence shows zero active deals and zero pipeline value.',

      evidence: {
        totalDeals,
        pipelineValue,
        opportunities,

        qualifiedOpportunityBriefs:
          opportunityBriefs.length,

        directOpportunities:
          directBriefs.length,

        possibleOpportunities:
          possibleBriefs.length,

        topOpportunity:
          opportunityBriefs.length > 0
            ? {
                title:
                  opportunityBriefs[0].title,

                commercialFit:
                  opportunityBriefs[0].commercialFit,

                serviceFit:
                  opportunityBriefs[0]
                    .houseOfJazzuFit?.fit ||
                  'UNKNOWN',

                confidence:
                  opportunityBriefs[0]
                    .houseOfJazzuFit?.confidence ||
                  0,

                commercialIntent:
                  opportunityBriefs[0]
                    .commercialIntent ||
                  'NOT_EXPLICIT'
              }
            : null
      }
    });

    /*
     * House-level revenue evidence makes the $1M objective
     * visible to the executive prioritization layer.
     */
    const highestGapProduct =
      [...houseProducts]
        .sort(
          (a, b) =>
            Number(b.remaining || 0) -
            Number(a.remaining || 0)
        )[0] || null;

    priorities[priorities.length - 1].evidence.houseRevenue = {
      verifiedRevenue,
      annualTarget: annualRevenueTarget,
      remaining: revenueRemaining,
      progressPercent: revenueProgress,
      highestGapProduct: highestGapProduct
        ? {
            id: highestGapProduct.id,
            target: highestGapProduct.target,
            verifiedRevenue: highestGapProduct.verifiedRevenue,
            remaining: highestGapProduct.remaining,
            priorities: highestGapProduct.priorities
          }
        : null
    };
  }

  if (prospects === 0) {
    priorities.push({
      id: 'ACQ-001',
      area: 'acquisition',
      priority: 'HIGH',
      objective:
        'Build a qualified prospect pipeline',
      reason:
        'Current acquisition evidence contains zero targets.',
      evidence: {
        prospects
      }
    });
  }

  /*
   * CAPITAL / PROCUREMENT INTELLIGENCE
   *
   * Funding and contract signals are executive-review evidence.
   * They are NOT revenue opportunities and do not authorize
   * applications, bids, contracts, spending, or outreach.
   */
  if (capitalCount === 0) {
    priorities.push({
      id: 'CAP-001',
      area: 'capital',
      priority: 'MEDIUM',
      objective:
        'Identify and evaluate relevant funding and procurement opportunities',
      reason:
        'No funding or procurement opportunities are currently present in the executive evidence set.',
      evidence: {
        opportunities: 0,
        fundingOpportunities: 0,
        contractOpportunities: 0,
        legacyCapitalOpportunities: legacyCapitalCount
      }
    });
  } else {
    priorities.push({
      id: 'CAP-001',
      area: 'capital',
      priority: 'HIGH',
      objective:
        'Review relevant funding and procurement intelligence for eligibility, fit, timing, and evidence',
      reason:
        'Executive evidence contains ' +
        fundingCount +
        ' funding opportunity and ' +
        contractCount +
        ' procurement signal requiring owner review.',
      evidence: {
        opportunities: capitalCount,
        fundingOpportunities: fundingCount,
        contractOpportunities: contractCount,
        awardedContractSignals: awardedContractCount,
        awardedContractSignals: awardedContractCount,
        legacyCapitalOpportunities: legacyCapitalCount,

        topFundingOpportunity:
          fundingCount > 0
            ? {
                title: fundingOpportunities[0].title,
                score: Number(
                  fundingOpportunities[0].qualificationScore || 0
                ),
                type:
                  fundingOpportunities[0].opportunityType ||
                  'FUNDING_OPPORTUNITY'
              }
            : null,

        topContractOpportunity:
          contractCount > 0
            ? {
                title: openSolicitationContracts[0].title,
                score: Number(
                  openSolicitationContracts[0].qualificationScore || 0
                ),
                type:
                  openSolicitationContracts[0].opportunityType ||
                  'CONTRACT_OPPORTUNITY'
              }
            : null,

        readOnly: true,
        persisted: false,
        mutation: false,
        externalExecution: 'BLOCKED',
        authorizationRequired: true
      }
    });
  }
  priorities.push({
    id: 'OPS-001',
    area: 'operations',
    priority: 'HIGH',
    objective:
      'Maintain an accurate executive operating state',
    reason:
      'Nia requires current evidence before making material recommendations.',
    evidence: {}
  });

  return priorities;
}
/**
 * DECIDE
 *
 * Decision disposition does NOT authorize execution.
 */
function decide(priorities) {
  const policy = privateGovernance.evaluateAction("prepare_internal_plan");

  return priorities.map(priority => ({
    ...priority,
    disposition: "RECOMMEND",
    governance: {
      policyStatus: policy.status,
      internalPreparationAllowed: policy.allowed,
      externalExecution: "BLOCKED",
      ownerAuthorizationRequired: true
    },
    execution: {
      status: "BLOCKED_PENDING_AUTHORIZATION",
      ownerAuthorizationRequired: true,
      autonomousExecution: false,
      executionAllowed: false
    }
  }));
}

/**
 * PREPARE
 * Creates internal work plans only; it never executes external actions.
 */
function buildActionPlan(priorities) {
  const plans = priorities.map(priority => {
    const evidence = priority.evidence || {};
    let proposedActions = [];
    let opportunityEvidence = [];

    switch (priority.id) {
      case "REV-001": {
        const top = evidence.topOpportunity || null;
        const houseRevenue = evidence.houseRevenue || {};
        const gapProduct = houseRevenue.highestGapProduct || null;

        if (Number(evidence.qualifiedOpportunityBriefs || 0) > 0) {
          opportunityEvidence = [{
            title: top?.title || "Qualified opportunity",
            commercialFit: top?.commercialFit || "UNKNOWN",
            serviceFit: top?.serviceFit || "UNKNOWN",
            confidence: Number(top?.confidence || 0),
            commercialIntent: top?.commercialIntent || "NOT_EXPLICIT"
          }];

          proposedActions = [
            "Review the highest-confidence qualified opportunity",
            "Validate customer need and supporting evidence",
            "Map the need to a concrete House of Jazzu capability",
            "Prepare a preliminary offer and economics for owner review"
          ];
        } else {
          proposedActions = [
            "Research qualified revenue prospects",
            "Score prospects against House of Jazzu criteria",
            "Prepare owner-review opportunity briefs"
          ];

          if (gapProduct) {
            proposedActions.unshift(
              "Prioritize " + String(gapProduct.id) +
              " as the largest recorded House of Jazzu revenue gap"
            );
            if (Array.isArray(gapProduct.priorities)) {
              proposedActions.push(...gapProduct.priorities.map(
                item => "Prepare internal plan: " + String(item)
              ));
            }
          }
        }
        break;
      }

      case "CAP-001":
        proposedActions = [
          "Find grants and capital partners relevant to actual House of Jazzu activities",
          "Check current status, eligibility, deadlines, geography, and matching-fund requirements",
          "Record source links and evidence for each opportunity",
          "Prepare a funding brief and required-document checklist",
          "Keep applications and external contact for owner review"
        ];
        break;

      case "ACQ-001":
        proposedActions = [
          "Identify qualified acquisition and partnership targets",
          "Collect supporting public evidence",
          "Score targets against House of Jazzu criteria",
          "Prepare outreach drafts for owner review; do not send automatically"
        ];
        break;

      case "OPS-001":
        proposedActions = [
          "Refresh executive evidence",
          "Verify engine availability",
          "Record operating state",
          "Audit unresolved executive priorities"
        ];
        break;

      default:
        proposedActions = [
          "Review evidence and identify the next internal research task",
          "Prepare recommendations for owner review"
        ];
    }

    const policy = privateGovernance.evaluateAction("prepare_internal_plan");

    return {
      priorityId: priority.id,
      area: priority.area,
      objective: priority.objective,
      evidence,
      opportunityEvidence,
      proposedActions,
      governance: {
        policyStatus: policy.status,
        internalPreparationAllowed: policy.allowed,
        externalExecution: "BLOCKED",
        executionAllowed: false,
        ownerAuthorizationRequired: true
      },
      authorizationRequired: true,
      externalExecution: "BLOCKED"
    };
  });

  const hasRealEstate = plans.some(plan =>
    String(plan.area || "").toLowerCase().includes("real") ||
    String(plan.priorityId || "").toUpperCase().startsWith("REAL-")
  );

  if (!hasRealEstate) {
    const policy = privateGovernance.evaluateAction("prepare_internal_plan");
    plans.push({
      priorityId: "REAL-001",
      area: "real_estate",
      objective: "Evaluate Hampton Roads real-estate opportunities and capital partners",
      evidence: {
        geography: ["Norfolk", "Hampton Roads"],
        acquisitionCapitalAvailable: 0,
        capitalStrategy: ["grants where eligible", "joint ventures", "capital partners"]
      },
      opportunityEvidence: [],
      proposedActions: [
        "Research publicly documented Hampton Roads property and partnership opportunities",
        "Record asking price, property status, and source date",
        "Estimate acquisition costs, repairs, operating expenses, and conservative income",
        "Calculate cash required, potential return, and downside scenarios",
        "Identify due-diligence gaps and potential capital partners",
        "Prepare a deal brief for owner review; do not bid, buy, or contact parties automatically"
      ],
      governance: {
        policyStatus: policy.status,
        internalPreparationAllowed: policy.allowed,
        externalExecution: "BLOCKED",
        executionAllowed: false,
        ownerAuthorizationRequired: true
      },
      authorizationRequired: true,
      externalExecution: "BLOCKED"
    });
  }

  return plans;
}

/**
 * ONE EXECUTIVE CYCLE
 */
async function cycle() {
  const state = loadState();
  const cycleNumber = Number(state.cycle || 0) + 1;

  const observations = await observe();
  const priorities = prioritize(observations);
  const decisions = decide(priorities);
  const actionPlan = buildActionPlan(priorities);

  const approvalRequests = [];

  for (const plan of actionPlan) {
    if (plan.priorityId !== 'REV-001') continue;

    const existing = approvalLedger.readAll()
      .filter(event =>
        event.type === 'APPROVAL_REQUESTED' &&
        event.action?.priorityId === plan.priorityId
      )
      .map(event =>
        approvalLedger.getApprovalState(event.approval_id)
      )
      .filter(Boolean)
      .find(current =>
        ['PENDING', 'APPROVED', 'AUTHORIZED'].includes(current.status)
      );

    if (existing) {
      approvalRequests.push({
        approval_id: existing.approval_id,
        priorityId: plan.priorityId,
        status: existing.status,
        human_approval_required: true,
        execution_allowed: false,
        execution_authorized: false,
        execution_performed: false,
        autonomous_execution: false,
        ledger_state: 'PRESERVED'
      });
      continue;
    }

    const evidence = plan.opportunityEvidence?.[0] || {};

    const approval = approvalLedger.createApproval({
      objective: plan.objective,
      action: {
        type: 'OWNER_REVIEW_OFFER_HYPOTHESIS',
        priorityId: plan.priorityId,
        evidence,
        proposedActions: plan.proposedActions,
        authorizationRequired: true,
        externalExecution: 'BLOCKED'
      },
      action_type: 'owner_review',
      source: 'executive-core'
    });

    approvalRequests.push({
      approval_id: approval.approval_id,
      priorityId: plan.priorityId,
      status: 'PENDING',
      human_approval_required: true,
      execution_allowed: false,
      execution_authorized: false,
      execution_performed: false,
      autonomous_execution: false,
      ledger_state: 'CREATED'
    });
  }

  const nextState = {
    cycle: cycleNumber,
    lastRun: new Date().toISOString(),
    identity: IDENTITY,
    governance: GOVERNANCE,
    observations,
    priorities,
    decisions,
    actionPlan,
    approvalRequests
  };

  saveState(nextState);

  audit('EXECUTIVE_CYCLE', {
    cycle: cycleNumber,
    priorityIds: priorities.map(x => x.id),
    recommendationCount: decisions.length,
    approvalRequestCount: approvalRequests.length,
    externalExecution: 'BLOCKED',
    ownerAuthorizationRequired: true
  });

  return nextState;
}

/**
 * STATUS
 */
function status() {
  const state = loadState();

  return {
    identity: IDENTITY,
    governance: GOVERNANCE,
    engines: ENGINES,
    state
  };
}

module.exports = {
  identity: IDENTITY,
  governance: GOVERNANCE,
  engines: ENGINES,
  observe,
  prioritize,
  decide,
  buildActionPlan,
  cycle,
  status
};
