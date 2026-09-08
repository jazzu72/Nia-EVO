'use strict';

const express = require('express');
const router = express.Router();

const ingestor = require('./rss-ingestor');
const publisher = require('./rss-publisher');
const store = require('./rss-store');

router.get('/health', (req,res) => {
  res.json({
    ok: true,
    service: 'nia-rss-intelligence',
    mode: 'READ_ONLY',
    configured_sources: ingestor.configuredSources().length,
    stored_items: store.list(1000).length,
    external_side_effects_allowed: false,
    autonomous_execution: false,
    human_approval_required: true
  });
});

router.get('/items', (req,res) => {
  res.json({
    ok: true,
    items: store.list(req.query.limit),
    read_only: true
  });
});

router.post('/ingest', async (req,res) => {
  try {
    const result = await ingestor.ingestAll();
    res.json({
      ok: true,
      ...result
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: String(err.message || err),
      read_only: true
    });
  }
});

router.get('/feed.xml', (req,res) => {
  res.type('application/rss+xml').send(
    publisher.buildFeed({
      title: 'Nia Executive OS — Intelligence',
      description: 'Normalized intelligence generated from approved Nia RSS sources.'
    })
  );
});

router.get('/feed/:category.xml', (req,res) => {
  const category = String(req.params.category || '').toLowerCase();

  const all = store.list(1000);
  const filtered = all.filter(x =>
    String(x.category || '').toLowerCase() === category
  );

  const originalList = store.list;
  store.list = () => filtered.slice(0,100);
  const xml = publisher.buildFeed({
    title: `Nia Executive OS — ${category}`,
    description: `Nia intelligence feed: ${category}`
  });
  store.list = originalList;

  res.type('application/rss+xml').send(xml);
});

module.exports = router;
