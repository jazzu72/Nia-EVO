'use strict';

const providers = require('../providers');

const TASK_ROUTING = {
  reasoning: ['openai', 'anthropic', 'xai'],
  coding: ['anthropic', 'openai', 'xai'],
  research: ['openai', 'anthropic'],
  strategy: ['openai', 'xai', 'anthropic'],
  general: ['openai', 'xai', 'anthropic']
};

function availableProviders() {
  return Object.keys(providers).filter(
    name => providers[name] && typeof providers[name].complete === 'function'
  );
}

async function route(task, options = {}) {
  const type = options.type || 'general';
  const preferred = options.provider;

  const candidates = preferred
    ? [preferred]
    : (TASK_ROUTING[type] || TASK_ROUTING.general);

  const available = availableProviders();

  for (const name of candidates) {
    if (!available.includes(name)) continue;

    try {
      const result = await providers[name].complete({
        task,
        system: options.system,
        model: options.model
      });

      return {
        provider: name,
        type,
        result,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      console.error(`AI provider ${name} failed:`, err.message);
    }
  }

  throw new Error('No AI provider available');
}

module.exports = {
  route,
  availableProviders
};
