'use strict';

const catalog = require('./provider-catalog');
const credentials = require('./credential-router');
const market = require('./public-market');
const fs = require('fs');
const path = require('path');

function existingFeeds() {
  const files = [
    'modules/activity/routes.js',
    'modules/activity-feed/routes.js',
    'modules/ceo-live-feed/routes.js'
  ];
  return files.filter(fs.existsSync).map(file => ({
    name: path.basename(file, '.js'),
    source: file,
    status: 'AVAILABLE',
    read_only: true
  }));
}

async function collect({ symbol = null, feeds = [] } = {}) {
  const result = {
    timestamp: new Date().toISOString(),
    providers: catalog.catalog().providers.filter(p => p.configured),
      credential_status: credentials.configured(),
    market: null,
    feeds: existingFeeds(),
    governance: {
      execution_allowed: false,
      execution_authorized: false,
      execution_performed: false,
      autonomous_execution: false,
      human_approval_required: true
    }
  };

  if (symbol) {
    result.market = await market.fetch(
      `/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`
    );
  }

  for (const feed of feeds) {
    if (!feed?.url) continue;
    result.feeds.push({
      name: feed.name || feed.url,
      url: feed.url,
      status: 'REGISTERED',
      read_only: true
    });
  }

  return result;
}

module.exports = { collect };
