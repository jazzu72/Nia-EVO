'use strict';

const express = require('express');
const fs = require('fs');
const router = express.Router();

const fabric = require('../tools/register-business-tools');
const decision = require('../core/decision-engine');
const intelligenceHub = require('../providers/intelligence-hub');
const actionGate = require('../governor/action-gate');
const aiReasoner = require('../core/ai-reasoner');

router.post('/ai-reason', async (req, res) => {
  try {
    const result = await aiReasoner.reason(req.body?.objective);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

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

router.post('/execute-approved', async (req,res) => {
  try {
    const { tool, args={}, context={}, approved=false } = req.body || {};
    const coordinator=require('../core/execution-coordinator');

    const result=await coordinator.run({
      tool,
      args,
      context,
      approved: approved === true
    });

    res.status(result.status === 'approval_required' ? 202 : 200).json({
      ok:true,
      ...result
    });
  } catch(error) {
    res.status(400).json({ok:false,error:error.message});
  }
});

router.post('/execute', async (req, res) => {
  try {
    const { tool, args, approved } = req.body;

    const result = await fabric.execute(
      tool,
      args || {},
      { approved: approved === true }
    );

    res.json({ ok: true, ...result });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

module.exports = router;
