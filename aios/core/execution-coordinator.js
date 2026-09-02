'use strict';

const fabric = require('../tools/tool-fabric');

async function run({ tool, args = {}, context = {}, approved = false } = {}) {
  if (!tool) throw new Error('Tool required');

  if (!approved) {
    return {
      status: 'approval_required',
      tool,
      execution_mode: 'CONTROLLED_EXECUTION',
      execution_performed: false,
      external_side_effects_allowed: false,
      human_approval_required: true
    };
  }

  const result = await fabric.execute(tool, args, {
    ...context,
    execution_mode: 'CONTROLLED_EXECUTION',
    human_approved: true
  });

  return {
    status: result?.status || 'completed',
    tool,
    execution_mode: 'CONTROLLED_EXECUTION',
    execution_performed: result?.status === 'executed',
    external_side_effects_allowed: false,
    human_approval_required: true,
    result
  };
}

module.exports = { run };
