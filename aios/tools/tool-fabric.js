'use strict';

const tools = new Map();
const EXECUTION_MODE='CONTROLLED_EXECUTION';
const actionGate = require('../governor/action-gate');

function register(name, handler, options = {}) {
  if (typeof handler !== 'function') throw new Error(`Invalid handler: ${name}`);

  tools.set(name, {
    name,
    handler,
    risk: options.risk || 'medium',
    description: options.description || ''
  });
}

function list() {
  return [...tools.values()].map(({ name, risk, description }) => ({
    name, risk, description
  }));
}

async function execute(name, args = {}, context = {}) {
  const tool = tools.get(name);
  if (!tool) throw new Error(`Unknown NIA tool: ${name}`);

  const allowed = await require('../governor/execution-governor')
    .authorize(tool, context);

  if (!allowed.execute) {
    return {
      status: 'approval_required',
      tool: name,
      risk: tool.risk,
      reason: allowed.reason
    };
  }

  const result = await tool.handler(args, context);

  return {
    status: 'executed',
    tool: name,
    risk: tool.risk,
    result
  };
}

module.exports = { register, list, execute };
