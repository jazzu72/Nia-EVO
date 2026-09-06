'use strict';

const { register } = require('./tool-fabric');
const intelligenceHub = require('../providers/intelligence-hub');

register('intelligence_snapshot', async ({ symbol } = {}) => {
  return intelligenceHub.collect({ symbol: symbol || null });
}, {
  risk: 'low',
  description: 'Unified read-only intelligence snapshot from configured providers and feeds'
});

module.exports = { intelligence_snapshot: true };
