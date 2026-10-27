'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

function readVaultJSON(rel) {
  try {
    const helper = require(path.join(ROOT, 'tools', 'vault-helpers'));
    return helper.readVaultJSON(path.join(ROOT, rel));
  } catch { return {}; }
}

function detectProgram(grant) {
  const g = grant || '';
  if (/NSF|SBIR|STTR|National Science/i.test(g)) return 'NSF_SBIR';
  if (/VIPC|Virginia Innovation/i.test(g))        return 'VIPC';
  if (/NIH|National Institutes of Health/i.test(g)) return 'NIH';
  return 'GENERIC';
}

const PROGRAMS = {
  NSF_SBIR: {
    label: 'NSF SBIR Phase I',
    portal: 'https://seedfund.nsf.gov/project-pitch/',
    stages: ['Project Pitch (1 hr)', 'Invitation', 'Full Proposal (20-40 hrs)', 'Award (~6-9 mo review)'],
    blockingItems: [
      { item: 'SAM.gov registration',                        time: '2-4 weeks processing',                  who: 'founder only' },
      { item: 'UEI from SAM.gov',                            time: 'issued after SAM.gov approval',          who: 'founder only' },
      { item: 'Research.gov account with PI role',           time: '15 min signup + verification',           who: 'founder only' },
      { item: 'EIN (IRS Employer ID)',                       time: 'instant if already have it',             who: 'founder' },
      { item: 'Founder bio (education + technical history)', time: '30 min writing',                         who: 'founder only' },
      { item: 'Project Pitch narrative (~750 words)',        time: '1 hour',                                 who: 'Nia drafts, you edit' }
    ]
  },
  VIPC: {
    label: 'VIPC Launch Grant ($50k)',
    portal: 'https://www.vipc.org/',
    stages: ['Online Application', 'Review (~60 days)', 'Award'],
    blockingItems: [
      { item: 'VIPC portal account',                time: '10 min',            who: 'founder' },
      { item: 'Use-of-funds budget with line items', time: '1 hour',            who: 'Nia drafts, you validate' },
      { item: 'Milestone plan (6-12 months)',       time: '30 min',            who: 'Nia drafts, you edit' },
      { item: 'Business plan overview',             time: 'exists in profile', who: 'Nia extracts' }
    ]
  },
  NIH: {
    label: 'NIH SBIR Phase I',
    portal: 'https://grants.nih.gov/',
    stages: ['eRA Commons registration', 'Project submission', 'Review', 'Award'],
    blockingItems: [
      { item: 'eRA Commons account',                  time: '3-5 business days', who: 'founder' },
      { item: 'NIH-specific project narrative',      time: '2 hours',           who: 'Nia drafts' }
    ]
  },
  GENERIC: {
    label: 'General Grant Application',
    portal: 'https://www.grants.gov/',
    stages: ['Registration', 'Application', 'Review', 'Award'],
    blockingItems: [
      { item: 'Portal registration (varies)', time: 'varies', who: 'founder' }
    ]
  }
};

function getIdentity(profile, owner) {
  return {
    legalName:    profile.legalName || profile.name || '[REQUIRED]',
    orgType:      profile.entityType || profile.organizationType || '[REQUIRED]',
    ein:          profile.ein  || '[REQUIRED]',
    uei:          profile.uei  || profile.duns || '[REQUIRED — SAM.gov]',
    founderName:  owner.name   || '[REQUIRED]',
    founderTitle: owner.title  || '[REQUIRED]',
    founderPhone: owner.phone  || '[REQUIRED]',
    founderEmail: owner.email  || '[REQUIRED — add to owner-identity.json]',
    city:         owner.city   || '[REQUIRED]',
    state:        owner.state  || '[REQUIRED]',
    org:          owner.organization || profile.organization || 'House of Jazzu'
  };
}

function stripHeader(text) {
  if (!text) return '';
  return String(text)
    .replace(/^\[DRAFT[^\]]*\]\s*/i, '')
    .replace(/^\[REQUIRED[^\]]*\]\s*/i, '')
    .replace(/\*\*/g, '')
    .trim();
}

function buildSections(program, entry, identity) {
  const sections = [];

  sections.push({
    title: 'Company & Applicant',
    body: [
      '**Legal name:** ' + identity.legalName,
      '**Entity type:** ' + identity.orgType,
      '**EIN:** ' + identity.ein,
      '**UEI:** ' + identity.uei,
      '**Founded by:** ' + identity.founderName + ', ' + identity.founderTitle,
      '**Phone:** ' + identity.founderPhone,
      '**Email:** ' + identity.founderEmail,
      '**Location:** ' + identity.city + ', ' + identity.state,
      '**Organization:** ' + identity.org
    ].join('\n')
  });

  sections.push({
    title: 'Award Being Applied For',
    body: [
      '**Program:** ' + PROGRAMS[program].label,
      '**Opportunity:** ' + entry.grant,
      '**Amount:** $' + Number(entry.amount || 0).toLocaleString(),
      '**Current status:** ' + entry.status,
      '**Portal:** ' + PROGRAMS[program].portal
    ].join('\n')
  });

  if (program === 'NSF_SBIR') {
    sections.push({
      title: 'Project Title',
      body: 'A Novel Governance-First Executive AI Operating System for Small-Business Revenue, Grant, and Capital Operations'
    });

    sections.push({
      title: 'Technical Innovation',
      body: stripHeader(
        'Nia is a governance-first executive AI operating system that consolidates grant discovery, ' +
        'application preparation, revenue pipeline tracking, and executive decision support for ' +
        'small-business founders. Unlike general-purpose AI assistants that answer questions in a ' +
        'stateless session, Nia maintains persistent state across capital, revenue, acquisition, ' +
        'operations, IP, and governance domains, and orchestrates owner-approved actions through a ' +
        'formally gated approval ledger.\n\n' +
        'The core technical innovation is a five-stage decision cycle ' +
        '(OBSERVE \u2192 UNDERSTAND \u2192 PRIORITIZE \u2192 DECIDE \u2192 PREPARE) that runs autonomously ' +
        'but is prohibited by design from executing external side effects without recorded owner ' +
        'authorization. The system demonstrates AES-256-GCM encryption at rest for all PII, a ' +
        'deterministic grant state machine (READY_FOR_SUBMISSION \u2192 PORTAL_SUBMISSION_REQUIRED \u2192 ' +
        'VERIFIED_SUBMITTED), a modular reasoning orchestrator that unifies heterogeneous intelligence ' +
        'modules behind a single fa\u00e7ade, and a Stripe-backed subscription surface with entitlement ' +
        'state transitions that fire on webhook events.'
      )
    });

    sections.push({
      title: 'Technical Objectives',
      body: stripHeader(
        '**Phase I objective 1 \u2014 Autonomous grant pipeline:** Discover federal and state funding ' +
        'opportunities from RSS/API sources, score them against a company-specific eligibility profile, ' +
        'and generate application dossiers containing required documentation checklists, portal URLs, ' +
        'and deadline tracking.\n\n' +
        '**Phase I objective 2 \u2014 Governance-gated execution:** Implement and formally verify an ' +
        'executive decision layer that reasons about actions but cannot execute external side effects ' +
        'without recorded owner authorization. Demonstrate the approval ledger, immutable audit trail, ' +
        'and refuse-on-missing-key behavior for encrypted data.\n\n' +
        '**Phase I objective 3 \u2014 Encrypted PII management:** Deploy AES-256-GCM encryption-at-rest ' +
        'for all founder and company PII with scrypt-derived master keys and per-file salts. Validate ' +
        'that the system refuses to serve plaintext if the master key is unavailable (fail-closed).\n\n' +
        '**Phase I objective 4 \u2014 Multi-tier commercial surface:** Build a Stripe-backed subscription ' +
        'layer (four tiers, $99\u2013$2,500/mo) with a governed checkout flow and a customer-entitlement ' +
        'state machine that updates automatically on webhook events.\n\n' +
        '**Phase I objective 5 \u2014 Revenue pipeline state machine:** Implement ticket-based tracking ' +
        'for grants, deals, and client services, with a five-stage state machine and manual-confirmation ' +
        'gating for externally executed actions.'
      )
    });

    sections.push({
      title: 'Commercial Potential',
      body: stripHeader(
        'Target market: approximately 33 million US small businesses, of which ~400,000 annually submit ' +
        'SBIR/STTR or state-level grant applications. Enterprise-grade revenue operations infrastructure ' +
        'is priced for companies with CFOs; grant-application support is typically a $5k\u2013$25k ' +
        'consulting engagement.\n\n' +
        'Nia\u2019s subscription tiers ($99\u2013$2,500/mo) target small businesses at the low end and ' +
        'executive-tier operations at the high end. The differentiator is consolidation: one system with ' +
        'unified state and a single governance model, rather than 6\u201310 point solutions.\n\n' +
        'Commercialization path: (a) founder self-application as proof of concept; (b) 100 paying users ' +
        'at $99/mo = $120k ARR in year one; (c) SBIR Phase I award validates the technical thesis and ' +
        'funds Phase II expansion into multi-tenant deployment with team collaboration features.'
      )
    });

    sections.push({
      title: 'Team & PI Qualifications',
      body: '**Principal Investigator:** ' + identity.founderName + '\n' +
            '**Title:** ' + identity.founderTitle + '\n' +
            '**Organization:** ' + identity.org + '\n\n' +
            '[REQUIRED \u2014 fill in: education history, relevant technical experience, prior ventures, publications, awards.]'
    });
  }

  sections.push({
    title: 'Blocking Items \u2014 Founder Must Complete',
    body: PROGRAMS[program].blockingItems
      .map(function (b) { return '- [ ] **' + b.item + '** \u2014 ' + b.time + ' \u2014 ' + b.who; })
      .join('\n') + '\n\n**None of these can be completed by Nia.** SAM.gov and Research.gov require ' +
      'verified human identity and authorized-representative signature. Nia\u2019s governance layer ' +
      'explicitly forbids legally binding submissions.'
  });

  return sections;
}

function buildKit(sourceId) {
  const subPath = path.join(ROOT, 'grants-engine', 'submission-db.json');
  if (!fs.existsSync(subPath)) {
    const e = new Error('submission-db.json not found'); e.code = 'NOT_FOUND'; throw e;
  }
  const subs = JSON.parse(fs.readFileSync(subPath, 'utf8'));
  const entry = subs.find(function (s) { return s.id === sourceId; });
  if (!entry) {
    const e = new Error('Grant not found: ' + sourceId); e.code = 'NOT_FOUND'; throw e;
  }

  const profile = readVaultJSON('data/funding/house-of-jazzu-profile.json') || {};
  const owner   = readVaultJSON('data/owner-identity.json') || {};

  const program  = detectProgram(entry.grant);
  const config   = PROGRAMS[program] || PROGRAMS.GENERIC;
  const identity = getIdentity(profile, owner);
  const sections = buildSections(program, entry, identity);

  return {
    grant: entry.grant,
    amount: entry.amount,
    status: entry.status,
    program: program,
    label: config.label,
    portal: config.portal,
    stages: config.stages,
    identity: identity,
    sections: sections,
    blockingItems: config.blockingItems,
    canNiaSubmit: false,
    reasonCannotSubmit:
      'Governance policy forbids legally-binding submissions. SAM.gov and Research.gov require ' +
      'verified human identity plus authorized-representative signature.',
    generatedAt: new Date().toISOString()
  };
}

function kitToMarkdown(kit) {
  const lines = [];
  lines.push('# Application Kit: ' + kit.grant);
  lines.push('');
  lines.push('**Program:** ' + kit.label);
  lines.push('**Award amount:** $' + Number(kit.amount || 0).toLocaleString());
  lines.push('**Portal:** ' + kit.portal);
  lines.push('**Stages:** ' + kit.stages.join(' \u2192 '));
  lines.push('');
  lines.push('> This kit prepares the content. Submission requires founder action:');
  lines.push('> ' + kit.reasonCannotSubmit);
  lines.push('');
  lines.push('---');
  lines.push('');
  for (var i = 0; i < kit.sections.length; i++) {
    lines.push('## ' + kit.sections[i].title);
    lines.push('');
    lines.push(kit.sections[i].body);
    lines.push('');
    lines.push('---');
    lines.push('');
  }
  lines.push('*Generated ' + kit.generatedAt + ' by Nia grants-prep-engine.*');
  return lines.join('\n');
}

module.exports = { buildKit: buildKit, kitToMarkdown: kitToMarkdown, detectProgram: detectProgram, PROGRAMS: PROGRAMS };
