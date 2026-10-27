'use strict';

const fs = require('fs');
const path = require('path');

const DB = path.join(__dirname, 'submission-db.json');

const PORTAL_RULES = [
  { match: /NSF|National Science Foundation|SBIR|STTR/i,
    name: 'NSF SBIR/STTR', url: 'https://seedfund.nsf.gov/' },
  { match: /NIH|National Institutes of Health/i,
    name: 'NIH', url: 'https://grants.nih.gov/' },
  { match: /DOE|Department of Energy/i,
    name: 'DOE SBIR', url: 'https://science.osti.gov/sbir' },
  { match: /USDA|Department of Agriculture/i,
    name: 'USDA', url: 'https://www.usda.gov/' },
  { match: /Virginia|VIPC|Innovation Partnership/i,
    name: 'VIPC', url: 'https://www.vipc.org/' },
  { match: /Grants\.gov/i,
    name: 'Grants.gov', url: 'https://www.grants.gov/' }
];

const NSF_SBIR = [
  { item: 'Project Summary (1 page: Overview, Intellectual Merit, Broader Impacts)', required: true },
  { item: 'Project Description (up to 15 pages)', required: true },
  { item: 'References Cited', required: true },
  { item: 'Budget & Budget Justification', required: true },
  { item: 'Biographical Sketch of PI', required: true },
  { item: 'Current & Pending Support', required: true },
  { item: 'Facilities, Equipment & Other Resources', required: true },
  { item: 'Data Management Plan', required: true },
  { item: 'Company Commercialization History (if prior SBIR)', required: false },
  { item: 'Letters of Commitment from Partners', required: false }
];

const GENERIC = [
  { item: 'Application cover sheet', required: true },
  { item: 'Project narrative', required: true },
  { item: 'Budget & justification', required: true },
  { item: 'Organizational documents (EIN, DUNS/UEI)', required: true },
  { item: 'Letters of support', required: false }
];

function findPortal(grant) {
  for (const r of PORTAL_RULES) if (r.match.test(grant)) return { name: r.name, url: r.url };
  return { name: 'Grants.gov', url: 'https://www.grants.gov/' };
}

function findChecklist(grant) {
  if (/NSF|National Science Foundation|SBIR|STTR/i.test(grant)) return NSF_SBIR;
  return GENERIC;
}

function computeNextAction(status) {
  switch (status) {
    case 'READY_FOR_SUBMISSION':        return 'Approve to unlock submission';
    case 'PORTAL_SUBMISSION_REQUIRED':  return 'Submit on portal, then record confirmation ID';
    case 'VERIFIED_SUBMITTED':          return 'Submitted — awaiting agency decision';
    case 'DECLINED':                    return 'Declined';
    default:                            return 'Unknown status';
  }
}

function generateDossier(sourceId) {
  if (!fs.existsSync(DB)) {
    const e = new Error('No submission database yet'); e.code = 'NOT_FOUND'; throw e;
  }
  const data = JSON.parse(fs.readFileSync(DB, 'utf8'));
  const entry = data.find(x => x.id === sourceId);
  if (!entry) {
    const e = new Error('Submission not found: ' + sourceId); e.code = 'NOT_FOUND'; throw e;
  }

  const portal = findPortal(entry.grant || '');
  const checklist = findChecklist(entry.grant || '');
  const timeline = Array.isArray(entry.timeline) ? entry.timeline : [];

  return {
    id: entry.id,
    grant: entry.grant,
    amount: entry.amount,
    status: entry.status,
    confirmation: entry.confirmation || null,
    submittedAt: entry.submittedAt || null,
    confirmedAt: entry.confirmedAt || null,
    portal,
    checklist: checklist.map(c => ({ ...c, complete: false })),
    timeline,
    nextAction: computeNextAction(entry.status),
    generatedAt: new Date().toISOString()
  };
}

module.exports = { generateDossier, findPortal, findChecklist };
