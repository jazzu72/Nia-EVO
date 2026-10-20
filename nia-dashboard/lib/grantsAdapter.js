'use strict';

const path = require('path');
const GRANTS_ENGINE_DIR = path.join(__dirname, '..', '..', 'grants-engine');

let tracker = null;
try {
  tracker = require(path.join(GRANTS_ENGINE_DIR, 'submission-tracker'));
} catch (err) {
  console.warn('[grantsAdapter] could not load submission-tracker.js: ' + err.message);
}

const STATUS_TO_STAGE = {
  READY_FOR_SUBMISSION: 'approval_required',
  PORTAL_SUBMISSION_REQUIRED: 'approval_required',
  READY_FOR_MANUAL_SUBMISSION: 'approval_required',
  VERIFIED_SUBMITTED: 'executed',
  SUBMITTED: 'executed',
  DECLINED: 'declined'
};

const NEXT_ACTION = {
  READY_FOR_SUBMISSION:       (g) => `Your approval to authorize "${g}" for submission`,
  PORTAL_SUBMISSION_REQUIRED: (g) => `Authorized — submit "${g}" on the real portal, then record confirmation`,
  VERIFIED_SUBMITTED:         (g, e) => `Submitted — confirmation ${e.confirmation || 'pending'}`,
  DECLINED:                   () => 'Declined'
};

function toTicket(entry) {
  if (!entry || typeof entry !== 'object') return entry;
  const stage = STATUS_TO_STAGE[entry.status] || 'recommended';
  const timeline = Array.isArray(entry.timeline) ? entry.timeline : [];
  const createdAt =
    (timeline[0] && timeline[0].date) ||
    entry.createdAt || entry.submittedAt || new Date().toISOString();
  const updatedAt =
    (timeline[timeline.length - 1] && timeline[timeline.length - 1].date) ||
    entry.confirmedAt || entry.declinedAt || entry.submittedAt || createdAt;

  const builder = NEXT_ACTION[entry.status];
  const nextAction = builder ? builder(entry.grant, entry) : 'Package in progress';

  const ticket = {
    id: 'grant-' + entry.id,
    title: entry.grant,
    tier: 'tier2',
    tierLabel: 'Tier II · Grant Pipeline',
    value: entry.amount,
    valueUnit: null,
    stage,
    status: entry.status,
    awaitingManualConfirmation: entry.status === 'PORTAL_SUBMISSION_REQUIRED',
    createdAt,
    updatedAt,
    nextAction,
    countsAsRevenue: false,
    _sourceId: entry.id
  };
  if (stage === 'executed') ticket.executedAt = entry.confirmedAt || entry.submittedAt || updatedAt;
  if (entry.confirmation) ticket.confirmationId = entry.confirmation;
  if (entry.submissionBlocked) {
    ticket.submissionBlocked = true;
    ticket.reason = entry.reason;
  }
  return ticket;
}

function readGrantTickets() {
  if (!tracker || typeof tracker.dashboard !== 'function') return [];
  const entries = tracker.dashboard();
  return (Array.isArray(entries) ? entries : []).map(toTicket);
}

function sumPipelineValue(grantTickets) {
  return grantTickets
    .filter(t => t.stage === 'approval_required' || t.stage === 'recommended')
    .reduce((sum, t) => sum + (Number(t.value) || 0), 0);
}

async function approveGrant(sourceId) {
  if (!tracker || typeof tracker.submit !== 'function') {
    const e = new Error('submission-tracker.submit unavailable'); e.code = 'NOT_IMPLEMENTED'; throw e;
  }
  return toTicket(tracker.submit(sourceId));
}

async function confirmGrant(sourceId, confirmationId) {
  if (!tracker || typeof tracker.confirmManualSubmission !== 'function') {
    const e = new Error('submission-tracker.confirmManualSubmission unavailable'); e.code = 'NOT_IMPLEMENTED'; throw e;
  }
  return toTicket(tracker.confirmManualSubmission(sourceId, confirmationId));
}

async function declineGrant(sourceId, reason) {
  if (!tracker) { const e = new Error('tracker not loaded'); e.code = 'NOT_IMPLEMENTED'; throw e; }
  const fn = tracker.reject || tracker.decline;
  if (typeof fn !== 'function') { const e = new Error('tracker.reject unavailable'); e.code = 'NOT_IMPLEMENTED'; throw e; }
  return toTicket(fn(sourceId, reason));
}

module.exports = {
  readGrantTickets, sumPipelineValue, approveGrant, confirmGrant, declineGrant
};
