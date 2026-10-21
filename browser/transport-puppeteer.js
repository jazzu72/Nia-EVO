'use strict';

const audit = require('./audit');
const guard = require('./guardrails');
const finder = require('./field-finder');

let puppeteer = null;
try { puppeteer = require('puppeteer-core'); } catch {}

function isAvailable() {
  return !!puppeteer && !!(process.env.CHROME_EXECUTABLE || process.env.PUPPETEER_EXECUTABLE_PATH);
}

async function open({ url, mode = 'headed', sessionId }) {
  if (!puppeteer) throw Object.assign(new Error('puppeteer-core not installed'), { code: 'NO_TRANSPORT' });
  if (!isAvailable()) throw Object.assign(new Error('CHROME_EXECUTABLE or PUPPETEER_EXECUTABLE_PATH required'), { code: 'NO_CHROME' });

  // Guardrails: check BEFORE launching — never launch headless on .gov
  guard.assertSafeNavigation({ url, mode });

  const browser = await puppeteer.launch({
    headless: mode === 'headless' ? 'new' : false,
    executablePath: process.env.CHROME_EXECUTABLE || process.env.PUPPETEER_EXECUTABLE_PATH,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1280, height: 900 }
  });

  const page = await browser.newPage();
  audit.record({
    event: 'transport.open',
    sessionId, transport: 'puppeteer', mode, url,
    guardrailPassed: true
  });

  // Intercept click attempts on submit-like elements — hard guardrail
  await page.evaluateOnNewDocument(() => {
    document.addEventListener('click', (ev) => {
      const el = ev.target.closest('button,input[type=submit],input[type=button]');
      if (!el) return;
      const text = (el.textContent || el.value || '').trim();
      if (/submit|apply|attest|finalize|transmit|certify/i.test(text)) {
        // Allowed only if ev.isTrusted === true (real human click)
        if (!ev.isTrusted) {
          ev.preventDefault();
          ev.stopImmediatePropagation();
          window.__NIA_BLOCKED_CLICK__ = text;
        }
      }
    }, true);
  }, {});

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  return { browser, page, sessionId };
}

async function fill(page, specs, { sessionId } = {}) {
  const results = await page.evaluate((specsArg) => {
    const F = (${finder.FINDER_SOURCE});
    return F.fillSpecs(specsArg, { overwrite: false });
  }, specs);

  audit.record({
    event: 'transport.fill',
    sessionId, transport: 'puppeteer', count: results.length,
    filled: results.filter(r => r.status === 'FILLED').length,
    results
  });
  return results;
}

async function screenshot(page, { sessionId, label } = {}) {
  const buf = await page.screenshot({ fullPage: true });
  audit.record({ event: 'transport.screenshot', sessionId, bytes: buf.length, label });
  return buf;
}

async function assertNoSubmitClicked(page, { sessionId, url } = {}) {
  const blocked = await page.evaluate(() => window.__NIA_BLOCKED_CLICK__ || null);
  if (blocked) {
    audit.record({
      event: 'guardrail.submit_click_blocked',
      sessionId, url, elementText: blocked
    });
    throw Object.assign(
      new Error(`GOVERNANCE_VIOLATION: attempted programmatic submit on ${guard.hostOf(url)}`),
      { code: 'GOVERNANCE_VIOLATION' }
    );
  }
}

async function close(browser, { sessionId } = {}) {
  audit.record({ event: 'transport.close', sessionId, transport: 'puppeteer' });
  await browser.close();
}

module.exports = { isAvailable, open, fill, screenshot, close, assertNoSubmitClicked };
