'use strict';

const Parser = require('rss-parser');
const store = require('./rss-store');

const parser = new Parser({
  timeout: 15000,
  headers: {
    'User-Agent': 'Nia-Executive-OS/1.0 RSS Intelligence Reader'
  }
});

function configuredSources() {
  const raw = process.env.NIA_RSS_SOURCES || '';
  if (!raw.trim()) return [];

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {}

  return raw
    .split(',')
    .map(x => x.trim())
    .filter(Boolean)
    .map(url => ({ name: url, url, category: 'intelligence' }));
}

async function ingestFeed(source) {
  const name = String(source.name || source.url || 'rss-source');
  const url = String(source.url || '').trim();

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return {
      source: name,
      status: 'skipped',
      reason: 'Invalid HTTP(S) feed URL'
    };
  }

  try {
    const feed = await parser.parseURL(url);
    const items = (feed.items || []).map(item =>
      store.normalize(item, name)
    );

    store.upsert(items);

    return {
      source: name,
      status: 'ingested',
      items: items.length,
      title: feed.title || null
    };
  } catch (err) {
    return {
      source: name,
      status: 'error',
      error: String(err.message || err)
    };
  }
}

async function ingestAll() {
  const sources = configuredSources();
  const results = [];

  for (const source of sources) {
    results.push(await ingestFeed(source));
  }

  return {
    status: 'completed',
    source_count: sources.length,
    results,
    read_only: true,
    external_side_effects_allowed: false,
    human_approval_required: true,
    autonomous_execution: false
  };
}

module.exports = { configuredSources, ingestFeed, ingestAll };
