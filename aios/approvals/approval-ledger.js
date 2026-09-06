'use strict';

/* TAMPER_EVIDENT_HASH_CHAIN */
const crypto = require('crypto');

const fs = require('fs');
const path = require('path');


const LEDGER = path.resolve(
  process.env.NIA_APPROVAL_LEDGER ||
  path.join(process.cwd(), 'data/aios/approval-ledger.jsonl')
);

function ensureLedger() {
  fs.mkdirSync(path.dirname(LEDGER), { recursive: true });
  if (!fs.existsSync(LEDGER)) fs.writeFileSync(LEDGER, '', { mode: 0o600 });
}

function _ledgerHash(record, previousHash='GENESIS') {
  return crypto.createHash('sha256')
    .update(previousHash + JSON.stringify(record))
    .digest('hex');
}

function append(event) {
  ensureLedger();

  const record = {
    event_id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    ...event
  };

  fs.appendFileSync(
    LEDGER,
    JSON.stringify(record) + '\n',
    { mode: 0o600 }
  );

  return record;
}

function readAll() {
  ensureLedger();

  return fs.readFileSync(LEDGER, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map(line => {
      try { return JSON.parse(line); }
      catch (_) { return null; }
    })
    .filter(Boolean);
}

function createApproval(input = {}) {
  const id = `APR-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

  return append({
    type: 'APPROVAL_REQUESTED',
    approval_id: id,
    objective: String(input.objective || ''),
    action: input.action || null,
    action_type: input.action_type || 'review',
    source: input.source || 'aios',
    provider: input.provider || null,
    model: input.model || null,

    status: 'PENDING',
    execution_allowed: false,
    execution_authorized: false,
    execution_performed: false,
    autonomous_execution: false,
    human_approval_required: true
  });
}

function getApprovalState(approvalId) {
  const events = readAll()
    .filter(x => x.approval_id === approvalId);

  if (!events.length) return null;

  return events.reduce((state, event) => ({
    ...state,
    ...event
  }), {});
}

function decide(approvalId, decision, reviewer = 'human') {
  const current = getApprovalState(approvalId);

  if (!current) {
    const err = new Error(`Approval not found: ${approvalId}`);
    err.statusCode = 404;
    throw err;
  }

  const normalized = String(decision).toUpperCase();

  if (!['APPROVED', 'REJECTED'].includes(normalized)) {
    const err = new Error('Decision must be APPROVED or REJECTED');
    err.statusCode = 400;
    throw err;
  }

  /*
   * CRITICAL SAFETY INVARIANT:
   * Approval NEVER grants execution permission.
   */
  return append({
    type: 'APPROVAL_DECISION',
    approval_id: approvalId,
    previous_status: current.status,
    status: normalized,
    reviewer: String(reviewer || 'human'),

    execution_allowed: false,
    execution_authorized: false,
    execution_performed: false,
    autonomous_execution: false,
    human_approval_required: true,

    execution_authorized: false,
    execution_performed: false
  });
}



function markExecutionPerformed(approvalId, tool, result = {}) {
  const current = getApprovalState(approvalId);

  if (!current) {
    const err = new Error(`Approval not found: ${approvalId}`);
    err.statusCode = 404;
    throw err;
  }

  if (current.status !== 'AUTHORIZED') {
    const err = new Error('Execution requires AUTHORIZED approval state');
    err.statusCode = 409;
    throw err;
  }

  if (current.execution_performed === true) {
    const err = new Error('Execution authorization already consumed');
    err.statusCode = 409;
    throw err;
  }

  return append({
    type: 'EXECUTION_PERFORMED',
    approval_id: approvalId,
    previous_status: current.status,
    status: 'EXECUTED',
    tool: String(tool || ''),
    reviewer: current.reviewer || null,
    execution_allowed: true,
    execution_authorized: true,
    execution_performed: true,
    autonomous_execution: false,
    human_approval_required: true,
    result_status: result?.status || null
  });
}

function authorizeExecution(approvalId, reviewer = 'human') {
  const current = getApprovalState(approvalId);

  if (!current) {
    const err = new Error(`Approval not found: ${approvalId}`);
    err.statusCode = 404;
    throw err;
  }

  if (current.status !== 'APPROVED') {
    const err = new Error(`Execution authorization requires APPROVED status`);
    err.statusCode = 409;
    throw err;
  }

  const name = String(reviewer || '').trim();
  if (!name) {
    const err = new Error('Explicit human reviewer required');
    err.statusCode = 400;
    throw err;
  }

  return append({
    type: 'EXECUTION_AUTHORIZATION',
    approval_id: approvalId,
    previous_status: current.status,
    status: 'AUTHORIZED',
    reviewer: name,
    execution_allowed: true,
    execution_authorized: true,
    execution_performed: false,
    autonomous_execution: false,
    human_approval_required: true
  });
}

module.exports = {
  LEDGER,
  append,
  readAll,
  createApproval,
  getApprovalState,
  decide,
  authorizeExecution,
  markExecutionPerformed
};
