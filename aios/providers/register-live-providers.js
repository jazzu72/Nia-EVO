'use strict';

const { registerReadonlyProvider } = require('./registry');
const { createHttpReadonlyProvider } = require('./http-readonly');

const providers = {};

if (process.env.FMP_API_KEY) {
  providers.fmp = registerReadonlyProvider(
    'fmp',
    createHttpReadonlyProvider(
      'fmp',
      'https://financialmodelingprep.com',
      {}
    ).fetch.bind(createHttpReadonlyProvider('fmp','https://financialmodelingprep.com'))
  );
}

module.exports = providers;
