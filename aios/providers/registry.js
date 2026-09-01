'use strict';

const { createProviderBoundary, PROVIDER_MODES } = require('./provider-boundary');

const providers = new Map();

function registerReadonlyProvider(name, fetcher) {
  if (!name || typeof fetcher !== 'function') {
    throw new TypeError('name and fetcher are required');
  }
  if (providers.has(name)) {
    throw new Error(`Provider already registered: ${name}`);
  }

  const provider = createProviderBoundary(name, fetcher);
  providers.set(name, provider);
  return provider;
}

function getProvider(name) {
  return providers.get(name) || null;
}

function listProviders() {
  return [...providers.keys()];
}

module.exports = {
  PROVIDER_MODES,
  registerReadonlyProvider,
  getProvider,
  listProviders
};
