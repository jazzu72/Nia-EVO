'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const decision = require('../aios/core/decision-engine');

const graph = {
  nodes: {
    start: { branches: [
      { id: 'safe', to: 'finish', utility: 8, cost: 1, risk: 0, confidence: 0.95 },
      { id: 'risky', to: 'finish2', utility: 10, cost: 1, risk: 9, confidence: 0.8 }
    ] },
    finish: { terminal: true },
    finish2: { terminal: true }
  }
};

test('decision engine exports inspect and decide', () => {
  assert.equal(typeof decision.inspect, 'function');
  assert.equal(typeof decision.decide, 'function');
});

test('branch planner remains directly testable and advisory-only', () => {
  const { QuantumBranchingAdapter } = require('../quantum-branching-adapter');
  const result = new QuantumBranchingAdapter().evaluate({
    graph, startNodeId: 'start', constraints: { maxRisk: 2 }
  });
  assert.equal(result.auditValid, true);
  assert.equal(result.recommendation.path[0].branchId, 'safe');
  assert.equal(result.executionPerformed, false);
});

test('truncated search cannot recommend a path', () => {
  const { QuantumBranchingAdapter } = require('../quantum-branching-adapter');
  const result = new QuantumBranchingAdapter().evaluate({
    graph, startNodeId: 'start', maxExpansions: 1
  });
  assert.equal(result.truncated, true);
  assert.equal(result.recommendation, null);
  assert.equal(result.executionPerformed, false);
});

test('branching input validation rejects malformed requests', async () => {
  await assert.rejects(
    decision.decide('Test objective', { branching: { startNodeId: 'start' } }),
    /Invalid branching input/
  );
});
