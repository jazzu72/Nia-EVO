'use strict';

/*
 * NIA PROVIDER BOUNDARY
 * READ-ONLY DATA INGESTION ONLY.
 * No provider may execute external actions through this interface.
 */

const PROVIDER_MODES = Object.freeze({
  READ_ONLY: 'READ_ONLY',
  DISABLED: 'DISABLED'
});

function createProviderBoundary(provider, fetcher) {
  if (!provider || typeof fetcher !== 'function') {
    throw new TypeError('provider and fetcher are required');
  }

  return Object.freeze({
    provider,
    mode: PROVIDER_MODES.READ_ONLY,

    async fetch(input = {}) {
      const data = await fetcher(input);

      return Object.freeze({
        provider,
        mode: PROVIDER_MODES.READ_ONLY,
        data,
        execution_allowed: false,
        execution_authorized: false,
        execution_performed: false,
        autonomous_execution: false,
        human_approval_required: true
      });
    },

    async execute() {
      return Object.freeze({
        ok: false,
        provider,
        mode: PROVIDER_MODES.DISABLED,
        error: 'Provider execution is disabled by governance policy.',
        execution_allowed: false,
        execution_authorized: false,
        execution_performed: false,
        autonomous_execution: false,
        human_approval_required: true
      });
    }
  });
}

module.exports = {
  PROVIDER_MODES,
  createProviderBoundary
};
