'use strict';

const fabric = require('../tools/register-business-tools');
const intelligenceHub = require('../providers/intelligence-hub');
const credentials = require('../providers/credential-router');
const intelligenceGateway = require('../providers/intelligence-hub');
const { QuantumBranchingAdapter } = require('../../quantum-branching-adapter');
const branchingAdapter = new QuantumBranchingAdapter();

const READ_ONLY = new Set([
    'intelligence_snapshot',
  'system_status',
  'list_modules',
  'acquisition_stats',
  'top_prospects',
  'revenue_dashboard',
  'automation_queue',
  'outreach_queue'
]);

async function inspect() {
  const results = {};

  for (const tool of fabric.list()) {
    if (!READ_ONLY.has(tool.name)) continue;

    try {
      results[tool.name] = await fabric.execute(
        tool.name,
        {},
        { approved: false }
      );
    } catch (error) {
      results[tool.name] = {
        status: 'error',
        error: error.message
      };
    }
  }

  return {
    timestamp: new Date().toISOString(),
    mode: 'READ_ONLY',
    results
  };
}

async function decide(objective, context = {}) {
  const branching = context.branching;
  if (branching !== undefined && (
    !branching || typeof branching !== 'object' || Array.isArray(branching) ||
    !branching.graph || typeof branching.graph !== 'object' ||
    typeof branching.startNodeId !== 'string'
  )) {
    throw new Error('Invalid branching input: graph and startNodeId are required');
  }
  if (!objective || !objective.trim()) {
    throw new Error('Objective required');
  }

  const snapshot = await inspect();
    const intelligence = await intelligenceHub.collect({
      symbol: context.symbol || context.market_data?.data?.data?.chart?.result?.[0]?.meta?.symbol || null
    });

  const branchingResult = branching === undefined ? null : branchingAdapter.evaluate({
    graph: branching.graph,
    startNodeId: branching.startNodeId,
    context: branching.context || {},
    constraints: branching.constraints || {},
    weights: branching.weights || {},
    maxExpansions: branching.maxExpansions ?? 1000,
    maxDepth: branching.maxDepth ?? 50,
    topN: branching.topN ?? 5
  });

  return {
    ok: true,
    objective,
    mode: 'READ_ONLY',
    branching: branchingResult ? {
      ...branchingResult,
      executionPerformed: false,
      executionAllowed: false,
      ownerAuthorizationRequired: true
    } : null,
    instruction:
      'Analyze the supplied Nia business state. Recommend actions, but do not claim that any action was executed.',
    available_tools: fabric.list(),
    business_state: snapshot,
    market_context: context.market_data || intelligence.market || null,
      credential_status: credentials.configured(),
      intelligence,
      intelligence_gateway: {
        provider_count: credentials.configured().length,
        market_connected: Boolean(intelligence.market),
        feed_sources: Array.isArray(intelligence.feeds) ? intelligence.feeds.length : 0,
        mode: 'READ_ONLY'
      },
    assessment: context.market_data ? {
      symbol: context.market_data.data?.data?.chart?.result?.[0]?.meta?.symbol || null,
      price: context.market_data.data?.data?.chart?.result?.[0]?.meta?.regularMarketPrice || null,
      change_percent: context.market_data.data?.data?.chart?.result?.[0]?.meta?.regularMarketChangePercent || null,
      day_high: context.market_data.data?.data?.chart?.result?.[0]?.meta?.regularMarketDayHigh || null,
      day_low: context.market_data.data?.data?.chart?.result?.[0]?.meta?.regularMarketDayLow || null,
      fifty_two_week_high: context.market_data.data?.data?.chart?.result?.[0]?.meta?.fiftyTwoWeekHigh || null,
      fifty_two_week_low: context.market_data.data?.data?.chart?.result?.[0]?.meta?.fiftyTwoWeekLow || null,
      recommendation: 'REVIEW_REQUIRED'
    } : null,
    execution_plan: {
      mode: 'CONTROLLED_EXECUTION',
      status: 'READY_FOR_APPROVAL',
      autonomous_execution: false,
      external_side_effects_allowed: false,
      required_next_step: 'HUMAN_APPROVAL'
    },
    governance: {
      execution_allowed: false,
      execution_authorized: false,
      execution_performed: false,
      autonomous_execution: false,
      human_approval_required: true
    }
  };
}

module.exports = {
  inspect,
  decide
};
