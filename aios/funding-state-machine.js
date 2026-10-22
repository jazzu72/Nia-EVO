'use strict';

const fs = require('fs');
const path = require('path');

const SUBMISSIONS_FILE = path.resolve(__dirname, '..', 'grants-engine', 'submission-db.json');

function scoreRecord(entry) {
  let s = 50;
  const amount = Number(entry.amount) || 0;
  if (amount >= 100000) s += 15;
  if (amount >= 250000) s += 5;
  if (entry.status === 'READY_FOR_SUBMISSION')       s += 20;
  if (entry.status === 'PORTAL_SUBMISSION_REQUIRED') s += 10;
  if (entry.status === 'VERIFIED_SUBMITTED')         s += 25;
  if (entry.status === 'DECLINED')                   s -= 40;
  if (entry.confirmation) s += 10;
  if (entry.timeline && entry.timeline.length > 2) s += 5;
  return Math.max(0, Math.min(100, s));
}

function recommend(score, status) {
  if (status === 'DECLINED') return 'DECLINE';
  if (status === 'VERIFIED_SUBMITTED') return 'COMPLETE';
  if (score >= 85) return 'PURSUE_NOW';
  if (score >= 70) return 'PRIORITIZE';
  if (score >= 50) return 'REVIEW';
  return 'DEFER';
}

function load() {
  try {
    const raw = JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, 'utf8'));
    if (!Array.isArray(raw)) return [];
    return raw.map(e => {
      const score = scoreRecord(e);
      return Object.assign({}, e, {
        opportunity: { score, recommendation: recommend(score, e.status) }
      });
    });
  } catch { return []; }
}

function portfolioMetrics(records) {
  const total = records.length;
  const averageScore = Math.round(
    records.reduce((a, r) => a + ((r.opportunity && r.opportunity.score) || 0), 0) / Math.max(total, 1)
  );
  const pursueNow = records.filter(r => r.opportunity && r.opportunity.recommendation === 'PURSUE_NOW').length;
  const prioritize = records.filter(r => r.opportunity && r.opportunity.recommendation === 'PRIORITIZE').length;
  return { total, averageScore, pursueNow, prioritize };
}

module.exports = { load, portfolioMetrics, scoreRecord, recommend };
