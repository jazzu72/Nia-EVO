'use strict';

// Self-contained /nia router. No top-level requires of project files.
// Only express/fs/path at module load. Every project-file read is
// inside a route handler with try/catch. This module cannot fail
// at require() time.

const express = require('express');
const fs      = require('fs');
const path    = require('path');

const NIA_DIR         = path.resolve(__dirname, '..');
const ROOT            = path.resolve(__dirname, '..', '..');
const TICKETS_FILE    = path.join(NIA_DIR, 'data', 'tickets.json');
const SUBMISSIONS_FILE = path.join(ROOT, 'grants-engine', 'submission-db.json');
const PUBLIC_DIR      = path.join(NIA_DIR, 'public', 'nia');

function readJSON(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    const raw = fs.readFileSync(file, 'utf8');
    return JSON.parse(raw);
  } catch { return fallback; }
}
function writeJSON(file, data) {
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    return true;
  } catch { return false; }
}
function loadTickets() {
  const raw = readJSON(TICKETS_FILE, { tickets: [] });
  return Array.isArray(raw && raw.tickets) ? raw.tickets : [];
}
function saveTickets(list) { return writeJSON(TICKETS_FILE, { tickets: list }); }
function loadSubmissions() {
  const raw = readJSON(SUBMISSIONS_FILE, []);
  return Array.isArray(raw) ? raw : [];
}
function saveSubmissions(list) { return writeJSON(SUBMISSIONS_FILE, list); }

const SUB_STATUS_TO_STAGE = {
  READY_FOR_SUBMISSION: 'approval_required',
  PORTAL_SUBMISSION_REQUIRED: 'approval_required',
  READY_FOR_MANUAL_SUBMISSION: 'approval_required',
  VERIFIED_SUBMITTED: 'executed',
  SUBMITTED: 'executed',
  DECLINED: 'declined',
};

function submissionToTicket(e) {
  if (!e || typeof e !== 'object') return null;
  const tl = Array.isArray(e.timeline) ? e.timeline : [];
  const createdAt = (tl[0] && tl[0].date) || e.createdAt || e.submittedAt || new Date().toISOString();
  const updatedAt = (tl[tl.length - 1] && tl[tl.length - 1].date) ||
                    e.confirmedAt || e.declinedAt || e.submittedAt || createdAt;
  const stage = SUB_STATUS_TO_STAGE[e.status] || 'recommended';
  let nextAction = 'Package in progress';
  if (e.status === 'READY_FOR_SUBMISSION')       nextAction = 'Approve to authorize "' + e.grant + '" for submission';
  if (e.status === 'PORTAL_SUBMISSION_REQUIRED') nextAction = 'Submit "' + e.grant + '" on the portal, then record confirmation';
  if (e.status === 'VERIFIED_SUBMITTED')         nextAction = 'Submitted — confirmation ' + (e.confirmation || 'pending');
  if (e.status === 'DECLINED')                   nextAction = 'Declined';
  return {
    id: 'grant-' + e.id,
    title: e.grant,
    tier: 'tier2',
    tierLabel: 'Tier II · Grant Pipeline',
    value: Number(e.amount) || 0,
    valueUnit: null,
    stage,
    status: e.status,
    awaitingManualConfirmation: e.status === 'PORTAL_SUBMISSION_REQUIRED',
    createdAt, updatedAt, nextAction,
    countsAsRevenue: false,
    confirmationId: e.confirmation || null,
    _sourceId: e.id,
  };
}

function summarize(tickets) {
  const counts = { discovered: 0, analyzed: 0, recommended: 0, approval_required: 0, executed: 0, declined: 0 };
  let pendingApprovalCount = 0, pendingApprovalValue = 0, oldestPendingAt = null;
  let revenueThisMonth = 0, grantPipelineValue = 0;
  const start = new Date(); start.setDate(1); start.setHours(0, 0, 0, 0);
  const monthStart = start.getTime();
  const now = Date.now();
  for (const t of tickets) {
    if (!t) continue;
    if (counts[t.stage] !== undefined) counts[t.stage]++;
    const v = Number(t.value) || 0;
    const at = new Date(t.updatedAt || 0).getTime() || 0;
    if (t.stage === 'approval_required') {
      pendingApprovalCount++;
      pendingApprovalValue += v;
      if (at && (oldestPendingAt === null || at < oldestPendingAt)) oldestPendingAt = at;
    }
    if (t.stage === 'executed' && at >= monthStart) revenueThisMonth += v;
    if (t.tier === 'tier2' && t.stage !== 'executed' && t.stage !== 'declined') grantPipelineValue += v;
  }
  return {
    counts, pendingApprovalCount, pendingApprovalValue,
    oldestApprovalAgeMs: oldestPendingAt ? now - oldestPendingAt : 0,
    revenueThisMonth, grantPipelineValue,
  };
}

function execState() {
  try {
    const core = require(path.join(ROOT, 'NIA-CEO', 'executive-core'));
    if (typeof core.loadState === 'function') return core.loadState();
    if (typeof core.status === 'function') return core.status();
  } catch {}
  return { cycle: 0, lastRun: null };
}

const router = express.Router();
router.use(express.json());
router.use(express.static(PUBLIC_DIR));

router.get('/api/health', (_req, res) => {
  res.json({
    ok: true, mounted: true,
    deps: {
      ticketsFile: fs.existsSync(TICKETS_FILE),
      submissionsFile: fs.existsSync(SUBMISSIONS_FILE),
      publicDir: fs.existsSync(PUBLIC_DIR),
    },
    node: process.version,
    cwd: process.cwd(),
    timestamp: new Date().toISOString(),
  });
});

router.get('/api/summary', (_req, res) => {
  let portfolio = null;
  try {
    const sm = require(path.join(ROOT, 'aios', 'funding-state-machine'));
    const records = sm.load ? sm.load() : (sm.readState ? sm.readState() : []);
    if (sm.portfolioMetrics && Array.isArray(records)) portfolio = sm.portfolioMetrics(records);
  } catch(e) {}

  try {
    const tickets = [...loadTickets(), ...loadSubmissions().map(submissionToTicket).filter(Boolean)];
    const s = summarize(tickets);
    const state = execState();
    s.portfolio = portfolio;
    s.cycle = state.cycle || 0;
    s.lastRun = state.lastRun || null;
    res.json(s);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/api/tickets', (req, res) => {
  try {
    const tickets = [...loadTickets(), ...loadSubmissions().map(submissionToTicket).filter(Boolean)];
    const filtered = req.query.stage ? tickets.filter(t => t.stage === req.query.stage) : tickets;
    filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    res.json({ tickets: filtered });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/api/state', (_req, res) => {
  try { res.json({ ok: true, state: execState() }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/api/tickets/:id/approve', (req, res) => {
  const id = req.params.id;
  try {
    if (id.startsWith('grant-')) {
      const sourceId = id.slice(6);
      const subs = loadSubmissions();
      const t = subs.find(s => s.id === sourceId);
      if (!t) return res.status(404).json({ error: 'Submission not found' });
      if (t.status === 'VERIFIED_SUBMITTED' || t.status === 'PORTAL_SUBMISSION_REQUIRED') {
        return res.json({ ticket: submissionToTicket(t) });
      }
      if (t.status !== 'READY_FOR_SUBMISSION') return res.status(409).json({ error: 'Cannot approve from status ' + t.status });
      t.status = 'PORTAL_SUBMISSION_REQUIRED';
      t.submittedAt = new Date().toISOString();
      t.submissionMethod = 'PORTAL';
      t.timeline = (t.timeline || []).concat({ event: 'PORTAL_SUBMISSION_REQUIRED', date: t.submittedAt });
      saveSubmissions(subs);
      return res.json({ ticket: submissionToTicket(t) });
    }
    const tickets = loadTickets();
    const t = tickets.find(x => x.id === id);
    if (!t) return res.status(404).json({ error: 'Ticket not found' });
    if (t.stage !== 'approval_required') return res.status(409).json({ error: 'Cannot approve from stage ' + t.stage });
    t.stage = 'executed';
    t.updatedAt = new Date().toISOString();
    t.executedAt = t.updatedAt;
    saveTickets(tickets);
    res.json({ ticket: t });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/api/tickets/:id/confirm', (req, res) => {
  const id = req.params.id;
  const { confirmationId } = req.body || {};
  try {
    if (!id.startsWith('grant-')) return res.status(400).json({ error: 'Only grants support confirmation' });
    if (!confirmationId || !String(confirmationId).trim()) return res.status(400).json({ error: 'confirmationId required' });
    const sourceId = id.slice(6);
    const subs = loadSubmissions();
    const t = subs.find(s => s.id === sourceId);
    if (!t) return res.status(404).json({ error: 'Submission not found' });
    if (t.status !== 'PORTAL_SUBMISSION_REQUIRED') return res.status(409).json({ error: 'Cannot confirm from status ' + t.status });
    t.status = 'VERIFIED_SUBMITTED';
    t.confirmation = String(confirmationId).trim();
    t.confirmedAt = new Date().toISOString();
    t.timeline = (t.timeline || []).concat({ event: 'MANUAL_CONFIRMATION_RECORDED', date: t.confirmedAt, confirmationId: t.confirmation });
    saveSubmissions(subs);
    res.json({ ticket: submissionToTicket(t) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/api/tickets/:id/decline', (req, res) => {
  const id = req.params.id;
  try {
    if (id.startsWith('grant-')) {
      const sourceId = id.slice(6);
      const subs = loadSubmissions();
      const t = subs.find(s => s.id === sourceId);
      if (!t) return res.status(404).json({ error: 'Submission not found' });
      if (t.status === 'DECLINED') return res.json({ ticket: submissionToTicket(t) });
      if (t.status === 'VERIFIED_SUBMITTED') return res.status(409).json({ error: 'Cannot decline verified submission' });
      t.status = 'DECLINED';
      t.declinedAt = new Date().toISOString();
      t.timeline = (t.timeline || []).concat({ event: 'DECLINED', date: t.declinedAt });
      saveSubmissions(subs);
      return res.json({ ticket: submissionToTicket(t) });
    }
    const tickets = loadTickets();
    const t = tickets.find(x => x.id === id);
    if (!t) return res.status(404).json({ error: 'Ticket not found' });
    if (t.stage !== 'approval_required') return res.status(409).json({ error: 'Cannot decline from stage ' + t.stage });
    t.stage = 'declined';
    t.updatedAt = new Date().toISOString();
    saveTickets(tickets);
    res.json({ ticket: t });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/api/tickets/:id/dossier', (req, res) => {
  const id = req.params.id;
  try {
    if (!id.startsWith('grant-')) return res.status(400).json({ error: 'Dossier only for grants' });
    const sourceId = id.slice(6);
    const subs = loadSubmissions();
    const entry = subs.find(s => s.id === sourceId);
    if (!entry) return res.status(404).json({ error: 'Not found' });
    const g = entry.grant || '';
    const portal = /NSF|SBIR|STTR/i.test(g) ? { name: 'NSF SBIR/STTR', url: 'https://seedfund.nsf.gov/' }
                 : /NIH/i.test(g)            ? { name: 'NIH', url: 'https://grants.nih.gov/' }
                 :                             { name: 'Grants.gov', url: 'https://www.grants.gov/' };
    const checklist = /NSF|SBIR|STTR/i.test(g) ? [
      { item: 'Project Summary', required: true },
      { item: 'Project Description (15pg max)', required: true },
      { item: 'References Cited', required: true },
      { item: 'Budget & Justification', required: true },
      { item: 'Biographical Sketch', required: true },
      { item: 'Current & Pending Support', required: true },
      { item: 'Facilities & Resources', required: true },
      { item: 'Data Management Plan', required: true },
      { item: 'Commercialization History', required: false },
      { item: 'Letters of Commitment', required: false },
    ] : [
      { item: 'Cover sheet', required: true },
      { item: 'Project narrative', required: true },
      { item: 'Budget', required: true },
      { item: 'Org documents', required: true },
      { item: 'Letters of support', required: false },
    ];
    res.json({
      dossier: {
        id: entry.id, grant: entry.grant, amount: entry.amount, status: entry.status,
        confirmation: entry.confirmation || null,
        portal,
        checklist: checklist.map(c => ({ ...c, complete: false })),
        timeline: entry.timeline || [],
        generatedAt: new Date().toISOString(),
      }
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/api/grants/:id/fill-plan', (req, res) => {
  const id = req.params.id;
  try {
    if (!id.startsWith('grant-')) return res.status(400).json({ error: 'Fill-plan only for grants' });
    const eng = require(path.join(ROOT, 'grants-engine', 'assisted-submit'));
    res.json({ plan: eng.buildFillPlan(id.slice(6)) });
  } catch (e) { res.status(e.code === 'NOT_FOUND' ? 404 : 500).json({ error: e.message }); }
});

router.get('/api/grants/:id/bookmarklet', (req, res) => {
  try {
    const eng = require(path.join(ROOT, 'grants-engine', 'assisted-submit'));
    res.type('text/plain; charset=utf-8').send(eng.buildBookmarklet());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/api/grants/:id/fill-report', (req, res) => {
  try {
    const id = req.params.id;
    const report = Object.assign({ grantId: id, receivedAt: new Date().toISOString() }, req.body || {});
    const file = path.join(ROOT, 'runtime', 'assist-reports.jsonl');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.appendFileSync(file, JSON.stringify(report) + '\n');
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/api/grants/:id/fill-plan', (req, res) => {
  const id = req.params.id;
  try {
    if (!id.startsWith('grant-')) return res.status(400).json({ error: 'only for grants' });
    const browser = require(path.join(ROOT, 'browser', 'session'));
    res.json({ plan: browser.buildFillPlan(id.slice(6)) });
  } catch (e) { res.status(e.code === 'NOT_FOUND' ? 404 : 500).json({ error: e.message }); }
});

router.get('/api/grants/:id/bookmarklet', (req, res) => {
  try {
    const t = require(path.join(ROOT, 'browser', 'transport-bookmarklet'));
    res.type('text/plain; charset=utf-8').send(t.buildBookmarklet());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/api/grants/:id/fill-page', (req, res) => {
  try {
    const t = require(path.join(ROOT, 'browser', 'transport-bookmarklet'));
    res.type('html').send(t.buildPage());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/api/grants/:id/session', (req, res) => {
  const id = req.params.id;
  try {
    if (!id.startsWith('grant-')) return res.status(400).json({ error: 'only for grants' });
    const browser = require(path.join(ROOT, 'browser', 'session'));
    const s = browser.createSession({
      grantSourceId: id.slice(6),
      heartbeatAt: Date.now()
    });
    res.json({ sessionId: s.sessionId, transport: s.transport, plan: s.plan });
  } catch (e) {
    const status = e.code === 'GOVERNANCE_VIOLATION' ? 403 : 500;
    res.status(status).json({ error: e.message, code: e.code });
  }
});

router.post('/api/grants/:id/fill-report', (req, res) => {
  try {
    const audit = require(path.join(ROOT, 'browser', 'audit'));
    audit.record(Object.assign({ event: 'client.fill_report' }, req.body || {}));
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/api/browser/audit/verify', (_req, res) => {
  try {
    const audit = require(path.join(ROOT, 'browser', 'audit'));
    res.json(audit.verifyChain());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/api/run', async (_req, res) => {
  try {
    const core = require(path.join(ROOT, 'NIA-CEO', 'executive-core'));
    const fn = core.runCycle || core.cycle;
    if (typeof fn !== 'function') return res.status(501).json({ error: 'No cycle export' });
    const result = await fn();
    res.json({ ok: true, result });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/api/owner', (_req, res) => {
  try {
    const helper = require(path.join(ROOT, 'tools', 'vault-helpers'));
    res.json({ ok: true, owner: helper.readVaultJSON(path.join(ROOT, 'data', 'owner-identity.json')) });
  } catch (e) { res.status(500).json({ error: e.message, code: e.code }); }
});

router.get('/api/owner/funding-profile', (_req, res) => {
  try {
    const helper = require(path.join(ROOT, 'tools', 'vault-helpers'));
    res.json({ ok: true, profile: helper.readVaultJSON(path.join(ROOT, 'data', 'funding', 'house-of-jazzu-profile.json')) });
  } catch (e) { res.status(500).json({ error: e.message, code: e.code }); }
});

router.get('/', (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'), (err) => {
    if (!err) return;
    res.type('html').send('<h1>Nia</h1><p>Dashboard HTML missing at ' + PUBLIC_DIR + '/index.html</p><p><a href="api/summary">summary</a> · <a href="api/tickets">tickets</a> · <a href="api/health">health</a></p>');
  });
});

module.exports = router;
