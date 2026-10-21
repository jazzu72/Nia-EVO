'use strict';

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const guard = require('./guardrails');
const audit = require('./audit');
const portals = require('./portals');
const finder = require('./field-finder');
const bmTransport = require('./transport-bookmarklet');
const ppTransport = require('./transport-puppeteer');

const ROOT = path.resolve(__dirname, '..');

function buildFillPlan(grantSourceId) {
  const engine = require(path.join(ROOT, 'grants-engine', 'grants-prep-engine'));
  const kit = engine.buildKit(grantSourceId);
  const portalKey = portals.detectPortal(kit.grant, null);
  const portal = portals.PORTALS[portalKey];

  const fields = portal.fields.map(f => ({
    match: f.match,
    selector: f.selector || null,
    value: valueForKind(f.kind, kit),
    required: !f.optional,
    maxLen: f.maxLen || null
  })).filter(f => f.value || f.required);

  return {
    grantId: 'grant-' + grantSourceId,
    grantTitle: kit.grant,
    amount: kit.amount,
    portalKey,
    portalName: portal.name,
    portalUrl: portal.url,
    submitHint: portal.submitHint,
    fields,
    legalNotice: guard.LEGAL_NOTICE,
    generatedAt: new Date().toISOString()
  };
}

function valueForKind(kind, kit) {
  const sec = (re) => (kit.sections || []).find(s => re.test(s.title || ''))?.body || '';
  const clean = (s) => String(s).replace(/^\[(?:DRAFT|REQUIRED)[^\]]*\]\s*/i, '').replace(/\*\*/g, '').trim();
  switch (kind) {
    case 'title':      return clean((kit.sections.find(s => /Project Title/i.test(s.title)) || {}).body || `${kit.grant} — Application`).split('\n')[0];
    case 'tech':       return clean(sec(/Technical Innovation/i));
    case 'summary':    return clean(sec(/Project Summary|Technical Innovation/i));
    case 'objectives': return clean(sec(/Technical Objectives|Project Description/i));
    case 'commercial': return clean(sec(/Commercial Potential/i));
    case 'team':       return clean(sec(/Team|PI Qualifications/i)) || kit.identity?.founderName || '';
    case 'budget':     return clean(sec(/Budget/i));
    case 'milestones': return clean(sec(/Milestone|Objectives/i));
    case 'references': return clean(sec(/References/i));
    case 'legalName':  return kit.identity?.legalName || '';
    default:           return '';
  }
}

function createSession({ grantSourceId, heartbeatAt }) {
  const sessionId = crypto.randomBytes(8).toString('hex');
  const plan = buildFillPlan(grantSourceId);

  audit.record({
    event: 'session.create',
    sessionId, grantId: plan.grantId, portalKey: plan.portalKey,
    fields: plan.fields.length
  });

  guard.assertHumanPresence({ lastHeartbeatAt: heartbeatAt });

  return {
    sessionId,
    plan,
    transport: ppTransport.isAvailable() ? 'puppeteer' : 'bookmarklet',
    // Bookmarklet path — return the injectable + display page
    async getBookmarklet() {
      return {
        bookmarkletUrl: bmTransport.buildBookmarklet(),
        displayHtml: bmTransport.buildPage()
      };
    },
    // Puppeteer path — full automation with guardrails
    async runAutomated() {
      if (!ppTransport.isAvailable()) {
        throw Object.assign(new Error('puppeteer transport unavailable — use bookmarklet'), { code: 'NO_TRANSPORT' });
      }
      const { browser, page } = await ppTransport.open({
        url: plan.portalUrl, mode: 'headed', sessionId
      });
      try {
        const fillResults = await ppTransport.fill(page, plan.fields, { sessionId });
        const shot = await ppTransport.screenshot(page, { sessionId, label: 'after-fill' });
        audit.record({
          event: 'session.handoff',
          sessionId, filled: fillResults.filter(r => r.status === 'FILLED').length,
          missing: fillResults.filter(r => r.status === 'NOT_FOUND').map(r => r.match)
        });
        // IMPORTANT: we do NOT call page.click on the submit button. Session
        // returns control. Human clicks submit. Human closes browser.
        return {
          sessionId,
          fillResults,
          screenshot: shot.toString('base64'),
          status: 'AWAITING_HUMAN_SUBMIT',
          instruction: plan.submitHint + ' ' + guard.LEGAL_NOTICE
        };
      } finally {
        // Do not auto-close — leave browser open for human to review and submit
        // await ppTransport.close(browser, { sessionId });
      }
    }
  };
}

function recordConfirmation({ sessionId, grantSourceId, confirmationId, url }) {
  if (!confirmationId || !String(confirmationId).trim()) {
    throw Object.assign(new Error('confirmationId required'), { code: 'BAD_INPUT' });
  }
  audit.record({
    event: 'session.confirmation_recorded',
    sessionId, grantSourceId, confirmationId: String(confirmationId).trim(),
    url, clickedBy: 'human'
  });
  return { ok: true };
}

module.exports = {
  createSession,
  buildFillPlan,
  recordConfirmation,
  transports: {
    puppeteer: ppTransport.isAvailable,
    bookmarklet: () => true
  }
};
