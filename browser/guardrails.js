'use strict';

// The AOR boundary as code. Any action passing through BrowserSession is
// checked here BEFORE the transport executes it. Violations throw, not warn.

const PROTECTED_DOMAINS = [
  /(?:^|\.)gov$/i,
  /(?:^|\.)mil$/i,
  /(?:^|\.)sam\.gov$/i,
  /(?:^|\.)research\.gov$/i,
  /(?:^|\.)nsf\.gov$/i,
  /(?:^|\.)nih\.gov$/i,
  /(?:^|\.)grants\.gov$/i,
  /(?:^|\.)vipc\.org$/i,
  /(?:^|\.)sba\.gov$/i
];

// Any button/link whose visible text or value matches these patterns is a
// legally-binding action on a protected domain. Never programmatically click.
const SUBMIT_PATTERNS = [
  /\bsubmit\b/i,
  /\bapply\s*now\b/i,
  /\bsend\s*(?:application|proposal|pitch)\b/i,
  /\battest\b/i,
  /\bsign\s*(?:and\s*)?submit\b/i,
  /\bfinalize\b/i,
  /\btransmit\b/i,
  /\bcertify\b/i
];

const HUMAN_HEARTBEAT_MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes

function hostOf(url) {
  try { return new URL(url).hostname; } catch { return ''; }
}

function isProtectedUrl(url) {
  const h = hostOf(url);
  if (!h) return false;
  return PROTECTED_DOMAINS.some(re => re.test(h));
}

function isSubmitText(text) {
  const t = String(text || '').trim();
  if (!t) return false;
  return SUBMIT_PATTERNS.some(re => re.test(t));
}

function assertSafeNavigation({ url, mode }) {
  if (!url) throw Object.assign(new Error('URL required'), { code: 'BAD_INPUT' });
  if (isProtectedUrl(url) && mode !== 'headed') {
    throw Object.assign(
      new Error(`GOVERNANCE_VIOLATION: protected domain ${hostOf(url)} cannot be loaded in ${mode} mode`),
      { code: 'GOVERNANCE_VIOLATION', url, mode }
    );
  }
}

function assertSafeClick({ url, elementText, elementRole }) {
  if (!isProtectedUrl(url)) return; // non-protected domains: allow
  if (isSubmitText(elementText)) {
    throw Object.assign(
      new Error(`GOVERNANCE_VIOLATION: cannot programmatically click submit on ${hostOf(url)} — text="${elementText}"`),
      { code: 'GOVERNANCE_VIOLATION', url, elementText, elementRole }
    );
  }
}

function assertHumanPresence({ lastHeartbeatAt }) {
  const now = Date.now();
  const age = lastHeartbeatAt ? now - lastHeartbeatAt : Infinity;
  if (age > HUMAN_HEARTBEAT_MAX_AGE_MS) {
    throw Object.assign(
      new Error(`GOVERNANCE_VIOLATION: human heartbeat stale (${Math.round(age/1000)}s > ${HUMAN_HEARTBEAT_MAX_AGE_MS/1000}s). ` +
                `Re-tap the bookmarklet or click "I am here" in the session UI before proceeding.`),
      { code: 'GOVERNANCE_VIOLATION', reason: 'STALE_HEARTBEAT', ageMs: age }
    );
  }
}

const LEGAL_NOTICE =
  'You (the human) are the Authorized Organizational Representative. ' +
  'Nia fills fields, captures evidence, and audits every action. ' +
  'Nia will never click Submit on a federal portal, never store your login credentials, ' +
  'and requires a fresh human presence heartbeat before touching any protected domain.';

module.exports = {
  isProtectedUrl,
  isSubmitText,
  assertSafeNavigation,
  assertSafeClick,
  assertHumanPresence,
  hostOf,
  LEGAL_NOTICE,
  PROTECTED_DOMAINS,
  SUBMIT_PATTERNS,
  HUMAN_HEARTBEAT_MAX_AGE_MS
};
