'use strict';

/**
 * NIA DASHBOARD ROUTER
 * Mounted at /nia by server-watson.js:719 via loadRoute().
 *
 *   GET  /nia/                → dashboard UI (HTML)
 *   GET  /nia/api/health      → liveness probe
 *   GET  /nia/api/summary     → condensed executive state
 *   GET  /nia/api/state       → full executive state
 *   POST /nia/api/run         → trigger one OBSERVE→PREPARE cycle
 */

const express = require('express');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const executiveCore = require(path.join(ROOT, 'NIA-CEO', 'executive-core'));

const router = express.Router();

// --- GET /nia/ → dashboard UI ---------------------------------------------
router.get('/', (req, res) => {
  const html = path.join(ROOT, 'public', 'dashboard', 'nia.html');
  if (fs.existsSync(html)) return res.sendFile(html);

  res.type('html').send(`<!doctype html>
<html><head><title>Nia — Executive</title>
<style>
  body{font-family:system-ui;background:#0a0a0a;color:#e8e8e8;padding:2rem;max-width:900px;margin:auto}
  h1{color:#ffd700;margin-bottom:.25rem}
  pre{background:#111;padding:1rem;border-radius:6px;overflow:auto;border:1px solid #222}
  a{color:#ffd700}
</style></head><body>
<h1>🏰 Nia — Executive Dashboard</h1>
<p>Router mounted. Dashboard HTML not installed at <code>public/dashboard/nia.html</code>.</p>
<pre>
GET  /nia/api/health
GET  /nia/api/summary
GET  /nia/api/state
POST /nia/api/run
</pre>
<p><a href="/nia/api/summary">→ /nia/api/summary</a></p>
</body></html>`);
});

router.get('/api/health', (_req, res) => {
  res.json({ ok: true, mounted: true, timestamp: new Date().toISOString() });
});

router.get('/api/summary', (_req, res) => {
  try {
    const s = executiveCore.loadState();
    res.json({
      ok: true,
      cycle: s.cycle,
      lastRun: s.lastRun,
      signals: s.understanding?.signals?.length ?? 0,
      priorities: s.priorities?.length ?? 0,
      decisions: s.decisions?.length ?? 0,
      planItems: s.actionPlan?.length ?? 0
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

router.get('/api/state', (_req, res) => {
  try {
    res.json({ ok: true, state: executiveCore.loadState() });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

router.post('/api/run', async (_req, res) => {
  try {
    const s = await executiveCore.runCycle();
    res.json({
      ok: true,
      cycle: s.cycle,
      signals: s.understanding?.signals?.length ?? 0,
      decisions: s.decisions?.length ?? 0,
      planItems: s.actionPlan?.length ?? 0
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;
