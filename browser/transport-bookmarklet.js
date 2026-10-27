'use strict';

const finder = require('./field-finder');
const audit = require('./audit');
const guard = require('./guardrails');

// Generates an injectable javascript: URL. Runs in the user's browser, in the
// user's authenticated session. Never sees credentials. Fills fields, highlights
// the submit button, reports back. Never clicks submit on protected domains —
// even if the bookmarklet code tried, the guardrails check on the SERVER side
// when fill-report is POSTed would flag it.

const BODY = `
(function(){
  const FINDER = ${finder.FINDER_SOURCE};
  const plan = window.__NIA_PLAN__ || (function(){
    const raw = prompt('Paste fill-plan JSON:');
    if (!raw) return null;
    try { return JSON.parse(raw); } catch(e){ alert('Invalid JSON: ' + e.message); return null; }
  })();
  if (!plan) return;

  function doFill(){
    const results = FINDER.fillSpecs(plan.fields, { overwrite: false });
    const filled = results.filter(r => r.status === 'FILLED').length;
    const skipped = results.filter(r => r.status === 'SKIP_FILLED').length;
    const missing = results.filter(r => r.status === 'NOT_FOUND').map(r => r.match);
    const submitCount = FINDER.highlightSubmitCandidates();

    const msg = 'Filled ' + filled + ' field(s).'
      + (skipped ? '\\nSkipped (already has content): ' + skipped : '')
      + (missing.length ? '\\nNot found: ' + missing.join(', ') : '')
      + '\\n\\n' + (submitCount ? submitCount + ' submit-like button(s) highlighted gold.' : 'No submit button found.')
      + '\\n\\nReview every field. Click Submit YOURSELF — that is the AOR action.';

    try {
      fetch('/nia/api/grants/' + plan.grantId + '/fill-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transport: 'bookmarklet',
          url: location.href,
          filled, skipped, missing,
          submitCandidates: submitCount,
          at: new Date().toISOString(),
          guardrailChecks: { submitClicked: false, credentialsHandled: false }
        })
      });
    } catch (e) {}
    alert(msg);
  }

  doFill();
})();
`.replace(/\s+/g, ' ').trim();

function buildBookmarklet() {
  return 'javascript:' + encodeURIComponent(BODY).replace(/%20/g, ' ');
}

function buildPage() {
  // A helper HTML page that puts the plan into clipboard and gives a
  // clickable bookmarklet link the user can drag/save on desktop.
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>Nia Fill</title>
<style>body{font-family:system-ui;background:#0a0a0a;color:#eee;padding:2rem;max-width:780px;margin:auto}
a.bm{background:#d4af37;color:#0a0a0a;padding:.75rem 1.5rem;border-radius:6px;font-weight:700;text-decoration:none;display:inline-block}
pre{background:#111;padding:1rem;overflow:auto;border-radius:6px;border:1px solid #222;font-size:.85rem}
h1{color:#d4af37}.note{color:#888;font-size:.9rem}</style></head>
<body>
<h1>Nia Fill — bookmarklet</h1>
<p class="note">Drag the gold button to your bookmarks bar (desktop). On mobile, long-press, copy link, add as bookmark.</p>
<a class="bm" href="${buildBookmarklet().replace(/"/g, '&quot;')}">Nia Fill</a>
<h2>How to use</h2>
<ol>
  <li>Save the gold button as a bookmark named <code>Nia Fill</code>.</li>
  <li>Open the grant portal in the same browser, log in yourself.</li>
  <li>On the form page, tap the <code>Nia Fill</code> bookmark.</li>
  <li>Paste the fill-plan JSON when prompted.</li>
  <li>Review the filled fields. <strong>Click Submit yourself.</strong></li>
</ol>
<p class="note">Nia never sees your credentials. Nia never clicks Submit. All actions logged to browser-audit.jsonl.</p>
</body></html>`;
}

module.exports = { buildBookmarklet, buildPage };
