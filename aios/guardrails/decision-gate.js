'use strict';

/*
 * NIA AIOS — STRUCTURED HUMAN-APPROVAL GATE
 *
 * Hermes = reasoning only.
 * AIOS = decision classification only.
 * Execution = DISABLED.
 *
 * IMPORTANT:
 * Do not scan ordinary prose for words such as "invest",
 * "purchase", "write", etc. Evaluate structured actions only.
 */

const BLOCKED_ACTION_TYPES = new Set([
  'send_email',
  'send_outreach',
  'send_message',
  'contact_prospect',
  'purchase',
  'buy',
  'sell',
  'invest',
  'transfer_money',
  'withdraw',
  'charge_card',
  'create_payment',
  'execute_trade',
  'deploy',
  'delete',
  'modify',
  'write',
  'shell',
  'exec'
]);

const SAFE_DECISIONS = new Set([
  'OBSERVE',
  'RECOMMEND',
  'APPROVAL_REQUIRED'
]);

function stripFences(text) {
  return String(text || '')
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

function extractJSON(text) {
  const cleaned = stripFences(text);

  try {
    return JSON.parse(cleaned);
  } catch (_) {}

  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');

  if (first !== -1 && last > first) {
    try {
      return JSON.parse(cleaned.slice(first, last + 1));
    } catch (_) {}
  }

  return null;
}

function normalizeAction(action) {
  if (typeof action === 'string') {
    return {
      action: action,
      action_type: 'review',
      requires_human_approval: true,
      execution_allowed: false
    };
  }

  if (!action || typeof action !== 'object') {
    return {
      action: String(action || ''),
      action_type: 'review',
      requires_human_approval: true,
      execution_allowed: false
    };
  }

  return {
    ...action,
    requires_human_approval: true,
    execution_allowed: false
  };
}

function parseHermesDecision(raw) {
  const cleaned = stripFences(raw);
  const parsed = extractJSON(cleaned);

  /*
   * If Hermes didn't return JSON, preserve the response as
   * human-readable evidence instead of pretending it was valid JSON.
   */
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {
      decision: 'APPROVAL_REQUIRED',
      summary: cleaned,
      evidence: [],
      next_actions: [],
      approval_required: true,
      execution_allowed: false,
      autonomous_execution: false,
      parse_error: true,
      guardrail: {
        mode: 'READ_ONLY',
        status: 'SAFE_BLOCK',
        human_approval_required: true
      }
    };
  }

  let decision = String(parsed.decision || 'RECOMMEND').toUpperCase();

  if (!SAFE_DECISIONS.has(decision)) {
    decision = 'RECOMMEND';
  }

  /*
   * Normalize next actions without inspecting ordinary prose.
   */
  const rawActions =
    Array.isArray(parsed.next_actions)
      ? parsed.next_actions
      : Array.isArray(parsed.actions)
        ? parsed.actions
        : [];

  const actions = rawActions.map(normalizeAction);

  /*
   * Only a structured action_type can activate this blocker.
   */
  const blocked = actions.filter(action => {
    const type = String(action.action_type || '').toLowerCase();
    return BLOCKED_ACTION_TYPES.has(type);
  });

  if (blocked.length > 0) {
    decision = 'APPROVAL_REQUIRED';
  }

  return {
    ...parsed,

    decision,

    next_actions: actions,

    /*
     * HARD SAFETY INVARIANTS.
     */
    approval_required: true,
    execution_allowed: false,
    autonomous_execution: false,

    guardrail: {
      mode: 'READ_ONLY',
      status: 'SAFE',
      human_approval_required: true,
      execution_allowed: false,
      autonomous_execution: false,

      blocked_structured_action_types:
        Array.from(BLOCKED_ACTION_TYPES),

      blocked_actions_detected:
        blocked.map(action => ({
          action_type: action.action_type,
          action: action.action
        }))
    }
  };
}

module.exports = {
  parseHermesDecision,
  normalizeAction
};
