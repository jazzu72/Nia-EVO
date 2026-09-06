'use strict';
const { requireOwnerAuth } = require('../../owner-auth-middleware');

const express = require('express');
const fs = require('fs');
const router = express.Router();

const fabric = require('../tools/register-business-tools');
const decision = require('../core/decision-engine');
const intelligenceHub = require('../providers/intelligence-hub');
const actionGate = require('../governor/action-gate');

router.post('/reason', async (req, res) => {
  try {
    const { objective, symbol } = req.body || {};
    if (!objective) throw new Error('Objective required');

    let market_data = null;
    if (symbol) {
      const market = require('../providers/public-market');
      market_data = await market.fetch(
        `/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`
      );
    }

    const result = await decision.decide(objective, { market_data, symbol: symbol || null });
    res.json(result);
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

router.get('/intelligence/status', (req, res) => {
  try {
    const hub = require('../providers/intelligence-hub');
    const credentials = require('../providers/credential-router');
    const snapshot = hub.collect ? {
      providers: credentials.configured(),
      mode: 'READ_ONLY',
      execution_allowed: false,
      autonomous_execution: false,
      human_approval_required: true
    } : null;

    res.json({
      ok: true,
      intelligence: snapshot
    });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

router.get('/intelligence/tools', (req, res) => {
  try {
    const fabric = require('../tools/tool-fabric');
    res.json({
      ok: true,
      tool: 'intelligence_snapshot',
      registered: fabric.list().some(t => t.name === 'intelligence_snapshot'),
      mode: 'READ_ONLY',
      execution_allowed: false,
      autonomous_execution: false,
      human_approval_required: true
    });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

router.post('/intelligence', async (req, res) => {
  try {
    const result = await intelligenceHub.collect({
      symbol: req.body?.symbol || null
    });
    res.json({ ok: true, ...result });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

router.get('/', (req, res) => {
  res.json({
    ok: true,
    system: 'NIA-TOOL-FABRIC',
    tools: fabric.list()
  });
});

router.post('/daily-cycle', async (req,res) => {
  try {
    const fabric=require('../tools/tool-fabric');
    const result=await fabric.execute('daily_operating_cycle',{},{
      source:'api',
      requested_by:'human'
    });
    res.status(200).json({ok:true,...result});
  } catch(error) {
    res.status(400).json({ok:false,error:error.message});
  }
});


router.post('/execute-approved', requireOwnerAuth, async (req, res) => {
  try {
    const { tool, args = {}, approval_id } = req.body || {};

    if (!tool || !approval_id) {
      return res.status(400).json({
        ok: false,
        error: 'tool and approval_id are required',
        execution_performed: false,
        autonomous_execution: false,
        human_approval_required: true
      });
    }

    const coordinator = require('../core/execution-coordinator');

    const result = await coordinator.run({
      tool,
      args,
      approval_id,
      context: {
        owner_authenticated: req.ownerAuthenticated === true
      }
    });

    return res
      .status((result.status === 'authorization_required' || result.status === 'approval_required') ? 202 : 200)
      .json({
        ok: true,
        ...result
      });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      ok: false,
      error: error.message || 'Controlled execution failed',
      execution_performed: false,
      autonomous_execution: false,
      human_approval_required: true
    });
  }
});


router.post('/execute', requireOwnerAuth, async (req, res) => {
  return res.status(403).json({
    ok: false,
    error: 'DIRECT_EXECUTION_DISABLED',
    message: 'Direct execution is disabled. Use an authenticated approval authorization record.',
    execution_performed: false,
    execution_allowed: false,
    execution_authorized: false,
    autonomous_execution: false,
    human_approval_required: true
  });
});

module.exports = router;
