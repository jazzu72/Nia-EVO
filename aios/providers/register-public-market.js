'use strict';

const { registerReadonlyProvider } = require('./registry');
const market = require('./public-market');

const publicMarket = registerReadonlyProvider(
  'public-market',
  market.fetch
);

module.exports = { publicMarket };
