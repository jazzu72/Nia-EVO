'use strict';

const LEVELS = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4
};

async function authorize(tool, context = {}) {
  const risk = LEVELS[tool.risk] || 2;

  if (risk >= LEVELS.high && context.approved !== true) {
    return {
      execute: false,
      reason: 'Human approval required for high-risk action'
    };
  }

  if (risk >= LEVELS.critical && context.approved !== true) {
    return {
      execute: false,
      reason: 'Human approval required for critical action'
    };
  }

  return { execute: true };
}

module.exports={ EXECUTION_MODE,
 authorize };
