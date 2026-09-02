'use strict';

const market = require('../providers/public-market');
const { register } = require('./tool-fabric');

register('market_quote', async ({ symbol }) => {
  if (!symbol) throw new Error('symbol is required');
  return market.fetch(
    `/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`
  );
}, {
  risk: 'low',
  description: 'Read-only public market quote data'
});

module.exports = { market_quote: true };
