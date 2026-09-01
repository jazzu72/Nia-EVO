'use strict';

const {
  registerReadonlyProvider,
  getProvider,
  listProviders
} = require('../providers/registry');

function registerProviderTools(registry) {
  if (!registry || typeof registry.register !== 'function') {
    throw new TypeError('AIOS tool registry with register() is required');
  }

  registry.register(
    'provider_list',
    async () => ({
      ok: true,
      providers: listProviders(),
      mode: 'READ_ONLY',
      execution_allowed: false,
      execution_authorized: false,
      execution_performed: false,
      autonomous_execution: false,
      human_approval_required: true
    })
  );

  registry.register(
    'provider_fetch',
    async ({ provider, input = {} } = {}) => {
      const p = getProvider(provider);
      if (!p) {
        return {
          ok: false,
          error: 'Provider not registered',
          execution_allowed: false,
          execution_authorized: false,
          execution_performed: false,
          autonomous_execution: false,
          human_approval_required: true
        };
      }
      return p.fetch(input);
    }
  );

  registry.register(
    'provider_execute',
    async ({ provider } = {}) => {
      const p = getProvider(provider);
      if (!p) {
        return {
          ok: false,
          error: 'Provider not registered',
          execution_allowed: false,
          execution_authorized: false,
          execution_performed: false,
          autonomous_execution: false,
          human_approval_required: true
        };
      }
      return p.execute();
    }
  );

  return registry;
}

module.exports = { registerProviderTools };
