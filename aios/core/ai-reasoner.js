'use strict';

const provider = require('../providers/ai-provider');
const decision = require('./decision-engine');

function responseText(response) {
if (typeof response === 'string') return response;
return response?.choices?.[0]?.message?.content
|| response?.message?.content
|| response?.content
|| JSON.stringify(response);
}

function retrieveMemories(objective, limit = 8) {
try {
const memory = require('../../memory/memory-engine');
if (typeof memory.allMemory !== 'function') return [];

const items = memory.allMemory();
if (!Array.isArray(items)) return [];

const terms = [...new Set(
  objective.toLowerCase().match(/[a-z0-9]{3,}/g) || []
)];

return items
  .map(item => {
    const text = [
      item.title, item.content, item.category,
      ...(Array.isArray(item.tags) ? item.tags : [])
    ].join(' ').toLowerCase();

    const matches = terms.filter(term => text.includes(term)).length;
    return { item, matches };
  })
  .filter(entry => entry.matches > 0)
  .sort((a, b) =>
    b.matches - a.matches ||
    String(b.item.created || '').localeCompare(String(a.item.created || ''))
  )
  .slice(0, limit)
  .map(({ item, matches }) => ({
    id: item.id || null,
    title: item.title || '',
    content: item.content || '',
    category: item.category || 'general',
    tags: item.tags || [],
    relevanceMatches: matches
  }));

} catch {
return [];
}
}

async function reason(objective) {
if (typeof objective !== 'string' || !objective.trim()) {
throw new Error('Objective required');
}

const snapshot = await decision.inspect();
const memories = retrieveMemories(objective);

const system = [
'You are NIA, the executive intelligence layer of Nia-Capital-OS.',
'Analyze business state using only the supplied snapshot and clearly identified memories.',
'Treat memory as historical context, not proof that a claim is currently true.',
'Separate observed facts, inferences, assumptions, and unknowns.',
'Never invent facts, figures, eligibility, deadlines, revenue, or execution results.',
'Identify the highest-value opportunity and explain the evidence for prioritizing it.',
'Give concrete, ordered next steps and identify missing evidence.',
'Do not execute tools or claim that actions were executed.',
'Material actions require owner authorization.',
'Financial transactions, contracts, submissions, communications, and external side effects are prohibited.'
].join('\n');

const user = [
`OBJECTIVE:\n${objective.trim()}`,
`CURRENT READ-ONLY BUSINESS SNAPSHOT:\n${JSON.stringify(snapshot, null, 2)}`,
`RELEVANT STORED MEMORIES:\n${JSON.stringify(memories, null, 2)}`,
'Analyze the objective. Cite the snapshot fields or memory IDs supporting important claims.',
'If evidence is missing or conflicting, say so instead of guessing.'
].join('\n\n');

const firstPass = responseText(await provider.chat({ system, user }));

const reviewSystem = [
'You are NIA’s independent reasoning reviewer.',
'Audit the proposed analysis against the supplied business snapshot and memories.',
'Identify unsupported claims, incorrect inferences, missing risks, contradictions, and unsafe recommendations.',
'Then produce a corrected final analysis, not merely a list of criticisms.',
'Do not invent evidence or claim external verification.',
'Keep all actions advisory; owner authorization remains required for material actions.',
'Return these sections: FINAL ANALYSIS, EVIDENCE CHECK, UNCERTAINTIES, SELF-CRITIQUE, NEXT STEPS.'
].join('\n');

const reviewUser = [
`OBJECTIVE:\n${objective.trim()}`,
`BUSINESS SNAPSHOT:\n${JSON.stringify(snapshot, null, 2)}`,
`RETRIEVED MEMORIES:\n${JSON.stringify(memories, null, 2)}`,
`INITIAL ANALYSIS TO REVIEW:\n${firstPass}`
].join('\n\n');

const reviewed = responseText(await provider.chat({
system: reviewSystem,
user: reviewUser
}));

return {
ok: true,
mode: 'AI_READ_ONLY_TWO_PASS',
provider: process.env.NIA_AI_PROVIDER || 'openai',
model: process.env.NIA_AI_MODEL || null,
objective: objective.trim(),
memoryCount: memories.length,
initialAnalysis: firstPass,
analysis: reviewed,
reviewPassCompleted: true,
governance: {
externalSideEffectsAllowed: false,
executionPerformed: false,
financialTransactionsAllowed: false,
legallyBindingSubmissionsAllowed: false,
ownerAuthorizationRequired: true
}
};
}

module.exports = { reason, retrieveMemories };
