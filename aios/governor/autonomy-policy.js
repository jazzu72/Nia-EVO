'use strict';

/*
 * NIA MAXIMUM BOUNDED AUTONOMY POLICY
 *
 * Autonomous by default:
 * - research / intelligence
 * - monitoring
 * - opportunity discovery
 * - scoring / prioritization
 * - analysis
 * - drafting
 * - internal reporting
 * - internal scheduling
 * - reconciliation / learning
 *
 * Approval required:
 * - external communications
 * - financial transactions
 * - grant submissions
 * - customer/deal state changes
 * - creation of external automations
 * - any medium/high/critical-risk action
 *
 * Never autonomous:
 * - unauthorized access
 * - fraud/deception
 * - circumvention of law/regulation
 * - actions requiring a human legal signature/attestation
 *
 * This policy does NOT enable execution by itself.
 */

const AUTONOMY_ENABLED =
  String(process.env.NIA_AUTONOMY_ENABLED || 'false').toLowerCase() === 'true';

const POLICY = Object.freeze({
  autonomy_enabled: AUTONOMY_ENABLED,
  mode: 'MAXIMUM_BOUNDED_AUTONOMY',

  autonomous_domains: Object.freeze([
    'research',
    'intelligence',
    'monitoring',
    'opportunity_discovery',
    'scoring',
    'prioritization',
    'analysis',
    'drafting',
    'internal_reporting',
    'internal_scheduling',
    'reconciliation',
    'learning'
  ]),

  approval_required_domains: Object.freeze([
    'external_communication',
    'financial_transaction',
    'grant_submission',
    'customer_state_change',
    'deal_state_change',
    'external_automation',
    'medium_risk',
    'high_risk',
    'critical_risk'
  ]),

  prohibited_autonomous_domains: Object.freeze([
    'unauthorized_access',
    'fraud',
    'deception',
    'law_evasion',
    'regulatory_evasion',
    'human_legal_attestation'
  ]),

  external_side_effects_allowed: false,
  human_approval_required: true,
  autonomous_execution: false
});

function canOperateAutonomously(domain) {
  return AUTONOMY_ENABLED &&
    POLICY.autonomous_domains.includes(String(domain));
}

function requiresApproval(domain) {
  return POLICY.approval_required_domains.includes(String(domain)) ||
    POLICY.prohibited_autonomous_domains.includes(String(domain));
}

module.exports = {
  POLICY,
  canOperateAutonomously,
  requiresApproval
};
