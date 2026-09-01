'use strict';

const { registerReadonlyProvider } = require('./registry');
const { createHttpReadonlyProvider } = require('./http-readonly');

const providers = {};

if (process.env.FMP_API_KEY) {
  const fmp = createHttpReadonlyProvider(
    'fmp',
    'https://financialmodelingprep.com'
  );
  providers.fmp = registerReadonlyProvider(
    'fmp',
    fmp.fetch
  );
}

module.exports = providers;
