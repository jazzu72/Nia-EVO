'use strict';

/**
 * NIA DASHBOARD ROUTER
 * Mounted at /nia by server-watson.js via loadRoute().
 *
 * Provides:
 *   GET  /nia/                              → dashboard UI (from nia-dashboard/public/nia/)
 *   GET  /nia/api/health                    → liveness
 *   GET  /nia/api/summary                   → executive core + ticket stats (union shape)
 *   GET  /nia/api/state                     → full executive state
 *   POST /nia/api/run                       → trigger one executive cycle
 *   GET  /nia/api/tickets                   → all tickets
 *   POST /nia/api/tickets/:id/approve       → approval_required → executed
 *   POST /nia/api/tickets/:id/decline       → approval_required → declined
 *   POST /nia/api/tickets/:id/confirm       → record external confirmationId, → executed
 *   GET  /nia/api/owner                     → owner identity
 *   GET  /nia/api/owner/funding-profile     → funding profile
 */

const express = require('express');
const fs      = require('fs');
const path    = require('path');

const ROOT         = path.resolve(__dirname, '..', '..');
const TICKETS_FILE = path.join(__dirname, '..', 'data', 'tickets.json');

// ---------------------------------------------------------------------------
// Ticket store (file-backed, synchronous — fine for this scale)
// ---------------------------------------------------------------------------

function ensureTicketStore() {
  fs.mkdirSync(path.dirname(TICKETS_FILE), { recursive: true });
  if (!fs.existsSync(TICKETS_FILE)) {
    fs.writeFileSync(TICKETS_FILE, JSON.stringify({ tickets: [] }, null, 2));
  }
}

function loadTickets() {
  ensureTicketStore();
  try {
    const data = JSON.parse(fs.readFileSync(TICKETS_FILE, 'utf8'));
    return Array.isArray(data.tickets) ? data.tickets : [];
  } catch {
    return [];
  }
}

function saveTickets(tickets) {
  ensureTicketStore();
  fs.writeFileSync(TICKETS_FILE, JSON.stringify({ tickets }, null, 2));
}

function transition(ticket, nextStage, meta) {
  ticket.stage = nextStage;
  ticket.updatedAt = new Date().toISOString();
  ticket.history = (ticket.history || []).concat({
    stage: nextStage,
    at: ticket.updatedAt,
    ...meta,
  });
  return ticket;
}

// ---------------------------------------------------------------------------
// Executive core (optional — must not break the router if absent)
// ---------------------------------------------------------------------------

let executiveCore = null;
try { executiveCore = require(path.join(ROOT, 'NIA-CEO', 'executive-core')); } catch {}

function loadExecutiveState() {
  if (typeof executiveCore?.loadState === 'function') return executiveCore.loadState();
  if (typeof executiveCore?.status    === 'function') return executiveCore.status();
  return { cycle: 0, lastRun: null };
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

const router = express.Router();
router.use(express.json());

// --- GET /nia/api/health ----------------------------------------------------
router.get('/api/health', (_req, res) => {
  res.json({ ok: true, mounted: true, timestamp: new Date().toISOString() });
});

// --- GET /nia/api/summary (union of executive + ticket stats) ---------------
router.get('/api/summary', (_req, res) => {
  try {
    const state = loadExecutiveState();
    const tickets = loadTickets();

    const counts = {
      discovered: 0, analyzed: 0, recommended: 0,
      approval_required: 0, executed: 0, declined: 0,
    };
    let pendingApprovalCount = 0;
    let pendingApprovalValue = 0;
    let oldestPendingAt = null;
    let revenueThisMonth = 0;
    let grantPipelineValue = 0;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const monthStart = startOfMonth.getTime();
    const now = Date.now();

    for (const t of tickets) {
      if (counts[t.stage] !== undefined) counts[t.stage]++;
      const v = Number(t.value || 0);
      const at = new Date(t.updatedAt || 0).getTime();
      if (t.stage === 'approval_required') {
        pendingApprovalCount++;
        pendingApprovalValue += v;
        if (oldestPendingAt === null || at < oldestPendingAt) oldestPendingAt = at;
      }
      if (t.stage === 'executed' && at >= monthStart) revenueThisMonth += v;
      if (t.tier === 'tier2' && t.stage !== 'executed' && t.stage !== 'declined') {
        grantPipelineValue += v;
      }
    }

    res.json({
      // executive core (unchanged shape)
      ok: true,
      cycle:      state.cycle ?? 0,
      lastRun:    state.lastRun ?? null,
      signals:    state.understanding?.signals?.length ?? 0,
      priorities: state.priorities?.length ?? 0,
      decisions:  state.decisions?.length ?? 0,
      planItems:  state.actionPlan?.length ?? 0,
      // ticket dashboard (new — consumed by public/nia/app.js)
      pendingApprovalCount,
      pendingApprovalValue,
      oldestApprovalAgeMs: oldestPendingAt ? now - oldestPendingAt : 0,
      counts,
      revenueThisMonth,
      grantPipelineValue,
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// --- GET /nia/api/state -----------------------------------------------------
router.get('/api/state', (_req, res) => {
  try { res.json({ ok: true, state: loadExecutiveState() }); }
  catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// --- POST /nia/api/run ------------------------------------------------------
router.post('/api/run', async (_req, res) => {
  try {
    const fn = executiveCore?.runCycle || executiveCore?.cycle;
    if (typeof fn !== 'function') {
      return res.status(501).json({ ok: false, error: 'No cycle/runCycle export on executive-core' });
    }
    const result = await fn();
    res.json({ ok: true, result });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// --- GET /nia/api/tickets ---------------------------------------------------
router.get('/api/tickets', (_req, res) => {
  try { res.json({ ok: true, tickets: loadTickets() }); }
  catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// --- POST /nia/api/tickets/:id/approve --------------------------------------
router.post('/api/tickets/:id/approve', (req, res) => {
  try {
    const tickets = loadTickets();
    const t = tickets.find(x => x.id === req.params.id);
    if (!t) return res.status(404).json({ ok: false, error: 'Ticket not found' });
    if (t.stage !== 'approval_required') {
      return res.status(400).json({ ok: false, error: `Cannot approve ticket in stage ${t.stage}` });
    }
    transition(t, 'executed', { via: 'approve' });
    saveTickets(tickets);
    res.json({ ok: true, ticket: t });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// --- POST /nia/api/tickets/:id/decline --------------------------------------
router.post('/api/tickets/:id/decline', (req, res) => {
  try {
    const tickets = loadTickets();
    const t = tickets.find(x => x.id === req.params.id);
    if (!t) return res.status(404).json({ ok: false, error: 'Ticket not found' });
    if (t.stage !== 'approval_required') {
      return res.status(400).json({ ok: false, error: `Cannot decline ticket in stage ${t.stage}` });
    }
    transition(t, 'declined', { via: 'decline' });
    saveTickets(tickets);
    res.json({ ok: true, ticket: t });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// --- POST /nia/api/tickets/:id/confirm --------------------------------------
router.post('/api/tickets/:id/confirm', (req, res) => {
  try {
    const { confirmationId } = req.body || {};
    if (!confirmationId || typeof confirmationId !== 'string' || !confirmationId.trim()) {
      return res.status(400).json({ ok: false, error: 'confirmationId is required' });
    }
    const tickets = loadTickets();
    const t = tickets.find(x => x.id === req.params.id);
    if (!t) return res.status(404).json({ ok: false, error: 'Ticket not found' });
    if (t.stage !== 'approval_required') {
      return res.status(400).json({ ok: false, error: `Cannot confirm ticket in stage ${t.stage}` });
    }
    t.confirmationId = confirmationId.trim();
    transition(t, 'executed', { via: 'confirm', confirmationId: t.confirmationId });
    saveTickets(tickets);
    res.json({ ok: true, ticket: t });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// --- Owner endpoints (preserve existing) ------------------------------------
router.get('/api/owner', (_req, res) => {
  try {
    const file = path.join(ROOT, 'data', 'owner-identity.json');
    res.json({ ok: true, owner: JSON.parse(fs.readFileSync(file, 'utf8')) });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

router.get('/api/owner/funding-profile', (_req, res) => {
  try {
    const file = path.join(ROOT, 'data', 'funding', 'house-of-jazzu-profile.json');
    res.json({ ok: true, profile: JSON.parse(fs.readFileSync(file, 'utf8')) });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// --- Static UI (Gap 3 — 1 line, needed for app.js to be reachable) ---------
router.use(express.static(path.join(__dirname, '..', 'public', 'nia')));

// --- GET /nia/ (HTML fallback if index.html not yet present) ----------------
router.get('/', (_req, res) => {
  const html = path.join(__dirname, '..', 'public', 'nia', 'index.html');
  if (fs.existsSync(html)) return res.sendFile(html);
  res.type('html').send(
    '<h1>Nia Executive Dashboard</h1>' +
    '<p>UI not yet installed at <code>nia-dashboard/public/nia/index.html</code>.</p>' +
    '<p>API endpoints: <a href="api/summary">/nia/api/summary</a>, ' +
    '<a href="api/tickets">/nia/api/tickets</a></p>'
  );
});

module.exports = router;
