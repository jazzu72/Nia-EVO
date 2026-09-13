'use strict';

const provider = require('../providers/ai-provider');
const decision = require('./decision-engine');

async function reason(objective) {
  if (!objective || !objective.trim()) {
    throw new Error('Objective required');
  }

  const snapshot = await decision.inspect();

  const system = `
You are NIA, the executive intelligence layer of Nia-Capital-OS.

Analyze business state using ONLY the supplied data.

Rules:
1. Do not invent facts.
2. Do not claim an action was executed unless execution data explicitly says so.
3. Identify the highest-value opportunity.
4. Explain why it is prioritized.
5. Recommend concrete next steps.
6. Do not execute tools.
7. Flag actions requiring human approval.
`;

  const user = `
OBJECTIVE:
${objective}

CURRENT NIA BUSINESS STATE:
${JSON.stringify(snapshot, null, 2)}
`;

  const response = await provider.chat({
    system,
    user
  });

  return {
    ok: true,
    mode: 'AI_READ_ONLY',
    provider: process.env.NIA_AI_PROVIDER || 'openai',
    model: process.env.NIA_AI_MODEL,
    objective,
    analysis: response
  };
}

module.exports = { reason };
