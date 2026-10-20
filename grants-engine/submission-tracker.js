'use strict';

const fs = require('fs');
const path = require('path');

const DB = path.join(__dirname, 'submission-db.json');

function load() {
  if (!fs.existsSync(DB)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(DB, 'utf8'));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function save(data) {
  fs.writeFileSync(DB, JSON.stringify(data, null, 2));
}

function create(pkg) {
  const data = load();
  const existing = data.find(x =>
    x.grant === pkg.grant &&
    x.amount === pkg.amount &&
    (x.status === 'READY_FOR_SUBMISSION' || x.status === 'PORTAL_SUBMISSION_REQUIRED')
  );
  if (existing) return existing;

  const sub = {
    id: 'SUB-' + Date.now(),
    grant: pkg.grant,
    amount: pkg.amount,
    status: 'READY_FOR_SUBMISSION',
    createdAt: new Date().toISOString(),
    timeline: [{ event: 'PACKAGE_CREATED', date: new Date().toISOString() }]
  };
  data.push(sub);
  save(data);
  return sub;
}

function submit(id) {
  const data = load();
  const x = data.find(s => s.id === id);
  if (!x) { const e = new Error('Submission not found'); e.code = 'NOT_FOUND'; throw e; }
  if (x.status === 'VERIFIED_SUBMITTED') return x;
  if (x.status === 'PORTAL_SUBMISSION_REQUIRED') return x;
  if (x.status === 'DECLINED') {
    const e = new Error('Cannot submit a declined submission'); e.code = 'INVALID_TRANSITION'; throw e;
  }
  if (x.status !== 'READY_FOR_SUBMISSION') {
    const e = new Error('Cannot submit from status ' + x.status); e.code = 'INVALID_TRANSITION'; throw e;
  }
  const now = new Date().toISOString();
  x.status = 'PORTAL_SUBMISSION_REQUIRED';
  x.submissionMethod = 'PORTAL';
  x.submittedAt = now;
  x.timeline = (x.timeline || []).concat({ event: 'PORTAL_SUBMISSION_REQUIRED', date: now });
  save(data);
  return x;
}

function confirmManualSubmission(id, confirmationId) {
  if (!confirmationId || !String(confirmationId).trim()) {
    const e = new Error('confirmationId is required'); e.code = 'INVALID_TRANSITION'; throw e;
  }
  const data = load();
  const x = data.find(s => s.id === id);
  if (!x) { const e = new Error('Submission not found'); e.code = 'NOT_FOUND'; throw e; }
  if (x.status === 'VERIFIED_SUBMITTED') return x;
  if (x.status !== 'PORTAL_SUBMISSION_REQUIRED') {
    const e = new Error('Cannot confirm from status ' + x.status + ' — approve first'); e.code = 'INVALID_TRANSITION'; throw e;
  }
  const now = new Date().toISOString();
  x.status = 'VERIFIED_SUBMITTED';
  x.confirmation = String(confirmationId).trim();
  x.confirmedAt = now;
  x.timeline = (x.timeline || []).concat({
    event: 'MANUAL_CONFIRMATION_RECORDED', date: now, confirmationId: x.confirmation
  });
  save(data);
  return x;
}

function reject(id, reason) {
  const data = load();
  const x = data.find(s => s.id === id);
  if (!x) { const e = new Error('Submission not found'); e.code = 'NOT_FOUND'; throw e; }
  if (x.status === 'DECLINED') return x;
  if (x.status === 'VERIFIED_SUBMITTED') {
    const e = new Error('Cannot decline a verified submission'); e.code = 'INVALID_TRANSITION'; throw e;
  }
  const now = new Date().toISOString();
  x.status = 'DECLINED';
  x.declinedAt = now;
  if (reason) x.declineReason = String(reason);
  x.timeline = (x.timeline || []).concat({ event: 'DECLINED', date: now, reason: reason || null });
  save(data);
  return x;
}

function dashboard() { return load(); }

module.exports = {
  load, save, create, submit, confirmManualSubmission, reject, dashboard,
  decline: reject
};
