'use strict';

const fabric = require('../tools/tool-fabric');
const ledger = require('../approvals/approval-ledger');

async function run({ tool, args = {}, context = {}, approval_id } = {}) {
  if (!tool) throw new Error('Tool required');

  const approvalId = String(approval_id || '').trim();

  if (!approvalId) {
    return {
      status: 'authorization_required',
      tool,
      execution_mode: 'CONTROLLED_EXECUTION',
      execution_performed: false,
      execution_allowed: false,
      execution_authorized: false,
      autonomous_execution: false,
      external_side_effects_allowed: false,
      human_approval_required: true,
      reason: 'Durable approval_id required'
    };
  }

  const approval = ledger.getApprovalState(approvalId);

  if (!approval) {
    return {
      status: 'authorization_required',
      tool,
      approval_id: approvalId,
      execution_mode: 'CONTROLLED_EXECUTION',
      execution_performed: false,
      execution_allowed: false,
      execution_authorized: false,
      autonomous_execution: false,
      external_side_effects_allowed: false,
      human_approval_required: true,
      reason: 'Approval record not found'
    };
  }

  if (
    approval.status !== 'AUTHORIZED' ||
    approval.execution_authorized !== true ||
    approval.execution_allowed !== true ||
    approval.execution_performed === true ||
    approval.autonomous_execution === true
  ) {
    return {
      status: 'authorization_required',
      tool,
      approval_id: approvalId,
      approval_status: approval.status,
      execution_mode: 'CONTROLLED_EXECUTION',
      execution_performed: false,
      execution_allowed: false,
      execution_authorized: false,
      autonomous_execution: false,
      external_side_effects_allowed: false,
      human_approval_required: true,
      reason: 'Valid explicit execution authorization is required'
    };
  }

  const result = await fabric.execute(tool, args, {
    ...context,
    approval_id: approvalId,
    approved: true,
    human_approved: true,
    execution_mode: 'CONTROLLED_EXECUTION',
    autonomous: false,
    autonomous_execution: false
  });

  const executed = result?.status === 'executed';

  if (executed) {
    ledger.markExecutionPerformed(approvalId, tool, result);
  }

  return {
    status: result?.status || 'completed',
    tool,
    approval_id: approvalId,
    execution_mode: 'CONTROLLED_EXECUTION',
    execution_performed: executed,
    execution_allowed: true,
    execution_authorized: true,
    autonomous_execution: false,
    external_side_effects_allowed: false,
    human_approval_required: true,
    result
  };
}

module.exports = { run };
