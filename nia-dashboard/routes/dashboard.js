'use strict';

const express = require('express');
const fs      = require('fs');
const path    = require('path');

const ROOT  = path.resolve(__dirname, '..', '..');
const store = require('../lib/ticketStore');
const grants = require('../lib/grantsAdapter');
const dossier = require('../../grants-engine/dossier-engine');

let executiveCore = null;
try { executiveCore = require(path.join(ROOT, 'NIA-CEO', 'executive-core')); } catch {}

function loadExecutiveState() {
  if (typeof executiveCore?.loadState === 'function') return executiveCore.loadState();
  if (typeof executiveCore?.status    === 'function') return executiveCore.status();
  return { cycle: 0, lastRun: null };
}

const router = express.Router();
router.use(express.json());
router.use(express.static(path.join(__dirname, '..', 'public', 'nia')));

router.get('/api/health', (_req, res) => {
  res.json({ ok: true, mounted: true, timestamp: new Date().toISOString() });
});

router.get('/api/state', (_req, res) => {
  try { res.json({ ok: true, state: loadExecutiveState() }); }
  catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

router.get('/api/summary', async (_req, res) => {
  try {
    const [local, grantTickets] = await Promise.all([
      store.readTickets(),
      Promise.resolve(grants.readGrantTickets())
    ]);
    const all = [...local, ...grantTickets];
    const summary = store.summarize(all);
    summary.grantPipelineValue = grants.sumPipelineValue(all.filter(t => t.tier === 'tier2'));
    const state = loadExecutiveState();
    summary.cycle = state.cycle ?? 0;
    summary.lastRun = state.lastRun ?? null;
    res.json(summary);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/api/tickets', async (req, res) => {
  try {
    const [local, grantTickets] = await Promise.all([
      store.readTickets(),
      Promise.resolve(grants.readGrantTickets())
    ]);
    const all = [...local, ...grantTickets];
    const { stage } = req.query;
    const filtered = stage ? all.filter(t => t.stage === stage) : all;
    filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    res.json({ tickets: filtered });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

function statusFor(err) {
  return err.code === 'NOT_FOUND' ? 404
       : err.code === 'INVALID_TRANSITION' ? 409
       : err.code === 'NOT_IMPLEMENTED' ? 501
       : 500;
}

router.post('/api/tickets/:id/approve', async (req, res) => {
  const { id } = req.params;
  try {
    if (id.startsWith('grant-')) {
      const result = await grants.approveGrant(id.slice('grant-'.length));
      return res.json({ ticket: result });
    }
    const ticket = await store.setStage(id, 'executed', { executedAt: new Date().toISOString() });
    res.json({ ticket });
  } catch (err) { res.status(statusFor(err)).json({ error: err.message, code: err.code }); }
});

router.post('/api/tickets/:id/confirm', async (req, res) => {
  const { id } = req.params;
  const { confirmationId } = req.body || {};
  try {
    if (!id.startsWith('grant-')) {
      return res.status(400).json({ error: 'Manual confirmation only applies to grant tickets' });
    }
    const result = await grants.confirmGrant(id.slice('grant-'.length), confirmationId);
    res.json({ ticket: result });
  } catch (err) { res.status(statusFor(err)).json({ error: err.message, code: err.code }); }
});

router.post('/api/tickets/:id/decline', async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body || {};
  try {
    if (id.startsWith('grant-')) {
      const result = await grants.declineGrant(id.slice('grant-'.length), reason);
      return res.json({ ticket: result });
    }
    const ticket = await store.setStage(id, 'declined');
    res.json({ ticket });
  } catch (err) { res.status(statusFor(err)).json({ error: err.message, code: err.code }); }
});

router.get('/api/tickets/:id/dossier', (req, res) => {
  const { id } = req.params;
  if (!id.startsWith('grant-')) {
    return res.status(400).json({ error: 'Dossier only applies to grant tickets' });
  }
  try {
    const result = dossier.generateDossier(id.slice('grant-'.length));
    res.json({ dossier: result });
  } catch (err) {
    const status = err.code === 'NOT_FOUND' ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
});

router.post('/api/run', async (_req, res) => {
  try {
    const fn = executiveCore?.runCycle || executiveCore?.cycle;
    if (typeof fn !== 'function') return res.status(501).json({ ok: false, error: 'no cycle export' });
    const result = await fn();
    res.json({ ok: true, result });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

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

router.get('/', (_req, res) => {
  const html = path.join(__dirname, '..', 'public', 'nia', 'index.html');
  if (fs.existsSync(html)) return res.sendFile(html);
  res.type('html').send(
    '<h1>Nia Executive Dashboard</h1>' +
    '<p>UI not installed at <code>nia-dashboard/public/nia/index.html</code>.</p>' +
    '<p>API: <a href="api/summary">/nia/api/summary</a> · <a href="api/tickets">/nia/api/tickets</a></p>'
  );
});

module.exports = router;
