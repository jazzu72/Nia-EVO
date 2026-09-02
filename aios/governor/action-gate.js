'use strict';

const GOVERNANCE = Object.freeze({
  execution_allowed: false,
  execution_authorized: false,
  execution_performed: false,
  autonomous_execution: false,
  human_approval_required: true
});

function request(action, context = {}) {
  if (!action || typeof action !== 'string') {
    throw new Error('Action required');
  }

  return {
    status: 'approval_required',
    action,
    context,
    governance: GOVERNANCE,
    message: 'Human approval is required before any external side effect.'
  };
}

module.exports = { request, GOVERNANCE };
