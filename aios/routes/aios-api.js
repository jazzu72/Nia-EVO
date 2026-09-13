'use strict';

const express = require('express');
const router = express.Router();

const executive =
  require('../agents/executive-agent');

const aiRouter =
  require('../core/ai-router');

const memory =
  require('../memory/memory');

router.get('/status', (req, res) => {
  res.json({
    ok: true,
    system: 'NIA-AIOS',
    providers: aiRouter.availableProviders(),
    memory: memory.recent(5).length,
    timestamp: new Date().toISOString()
  });
});

router.post('/execute', async (req, res) => {
  try {
    const {
      objective,
      type,
      provider,
      model
    } = req.body;

    const result = await executive.execute(
      objective,
      {
        type,
        provider,
        model
      }
    );

    res.json({
      ok: true,
      ...result
    });

  } catch (error) {
    console.error('NIA-AIOS:', error);

    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

router.get('/memory', (req, res) => {
  res.json({
    ok: true,
    memory: memory.recent(
      Number(req.query.limit) || 50
    )
  });
});

module.exports = router;
