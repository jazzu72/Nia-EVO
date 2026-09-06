'use strict';

const tools = new Map();
const EXECUTION_MODE='CONTROLLED_EXECUTION';
const actionGate = require('../governor/action-gate');
const ledger = require('../approvals/approval-ledger');

function register(name, handler, options = {}) {
  if (typeof handler !== 'function') throw new Error(`Invalid handler: ${name}`);

  tools.set(name, {
    name,
    handler,
    risk: options.risk || 'medium',
    description: options.description || ''
  });
}

function list() {
  return [...tools.values()].map(({ name, risk, description }) => ({
    name, risk, description
  }));
}

async function execute(name, args = {}, context = {}) {
  const tool = tools.get(name);
  if (!tool) throw new Error(`Unknown NIA tool: ${name}`);

  const riskLevels = { low: 1, medium: 2, high: 3, critical: 4 };
  const risk = riskLevels[tool.risk] || 2;

  // Defense in depth: medium/high/critical tools require
  // a durable AUTHORIZED ledger record. A boolean approved flag
  // alone is never sufficient.
  if (risk >= riskLevels.medium) {
    const approvalId = String(context.approval_id || '').trim();
    const approval = approvalId ? ledger.getApprovalState(approvalId) : null;

    if (
      !approval ||
      approval.status !== 'AUTHORIZED' ||
      approval.execution_authorized !== true ||
      approval.execution_allowed !== true ||
      approval.execution_performed === true ||
      approval.autonomous_execution === true ||
      context.approved !== true
    ) {
      return {
        status: 'approval_required',
        tool: name,
        risk: tool.risk,
        reason: 'Durable explicit execution authorization required'
      };
    }
  }

  const allowed = await require('../governor/execution-governor')
    .authorize(tool, context);

  if (!allowed.execute) {
    return {
      status: 'approval_required',
      tool: name,
      risk: tool.risk,
      reason: allowed.reason
    };
  }

  const result = await tool.handler(args, context);

  return {
    status: 'executed',
    tool: name,
    risk: tool.risk,
    result
  };
}

module.exports = { register, list, execute };
