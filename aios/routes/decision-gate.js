'use strict';

const express = require('express');
const router = express.Router();

const { chat } = require('../providers/ai-provider');
const { parseHermesDecision } = require('../guardrails/decision-gate');

router.post('/reason', async (req, res) => {
  try {
    const objective = String(req.body?.objective || '').trim();

    if (!objective) {
      return res.status(400).json({
        ok: false,
        error: 'objective is required'
      });
    }

    const system = [
      'You are the Nia Capital OS read-only business intelligence layer.',
      'Analyze available data only.',
      'Never invent values.',
      'Never execute an action.',
      'Never send outreach.',
      'Never purchase anything.',
      'Never invest money.',
      'Never modify business state.',
      'Return concise JSON only.',
      '',
      'Required JSON fields:',
      'decision: OBSERVE | RECOMMEND | APPROVAL_REQUIRED',
      'summary: string',
      'evidence: array',
      'next_actions: array',
      'approval_required: boolean',
      'execution_allowed: false'
    ].join('\n');

    const result = await chat({
      provider: process.env.NIA_AI_PROVIDER || 'hermes',
      model: process.env.NIA_AI_MODEL || 'z-ai/glm-5.2',
      system,
      user: objective
    });

    const raw = result?.choices?.[0]?.message?.content || '';
    const decision = parseHermesDecision(raw);

    /*
     * AIOS → APPROVAL LEDGER BRIDGE
     * ------------------------------
     * Hermes can recommend.
     * AIOS can classify.
     * The ledger can record.
     * NOTHING executes here.
     */
    let approval_records = [];

    const actions = Array.isArray(decision.next_actions)
      ? decision.next_actions
      : [];

    const SIDE_EFFECT_TYPES = new Set([
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

    /*
     * Only side-effect actions enter the approval ledger.
     * OBSERVE/RECOMMEND/review actions remain recommendations
     * and are never treated as executable approvals.
     */
    const approvalActions = actions.filter(action =>
      SIDE_EFFECT_TYPES.has(
        String(action.action_type || '').toLowerCase()
      )
    );

    const requiresApproval =
      approvalActions.length > 0 ||
      decision.decision === 'APPROVAL_REQUIRED';

    if (requiresApproval && approvalActions.length > 0) {
      for (const action of approvalActions) {
        try {
          const approvalResponse = await fetch(
            'http://127.0.0.1:3000/api/aios/approvals/request',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                objective,
                action: action.action || String(action),
                action_type: action.action_type || 'review',
                source: 'nia-aios-decision-gate',
                provider: result.provider,
                model: result.model
              })
            }
          );

          const approval = await approvalResponse.json();

          if (approval?.approval) {
            approval_records.push(approval.approval);
          }
        } catch (approvalError) {
          /*
           * Failure to create an approval must NEVER become
           * permission to execute anything.
           */
          approval_records.push({
            status: 'APPROVAL_RECORD_FAILED',
            execution_allowed: false,
            autonomous_execution: false,
            human_approval_required: true,
            error: approvalError.message
          });
        }
      }
    }

    return res.json({
      ok: true,
      mode: 'AI_READ_ONLY',
      provider: result.provider,
      model: result.model,
      decision,
      approval_records,
      approval_summary: {
        approval_required: approvalActions.length > 0,
        approval_candidates: approvalActions.length,
        review_recommendations: actions.length - approvalActions.length,
        ledger_recording_only: true
      },
      safety: {
        mode: 'READ_ONLY',
        execution_allowed: false,
        autonomous_execution: false,
        human_approval_required: true,
        approval_recording_only: true
      }
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      mode: 'AI_READ_ONLY',
      execution_allowed: false,
      approval_required: true,
      error: err.message
    });
  }
});

module.exports = router;
