'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { QuantumBranchingAdapter } = require('../quantum-branching-adapter');

const graph = {
  nodes: {
    start: {
      branches: [
        { id: 'safe', to: 'finish', utility: 8, cost: 1, risk: 0.1 },
        { id: 'risky', to: 'finish', utility: 10, cost: 1, risk: 5 }
      ]
    },
    finish: { terminal: true }
  }
};

test('returns a validated recommendation and audit without executing it', () => {
  const adapter = new QuantumBranchingAdapter();
  const result = adapter.evaluate({
    graph,
    startNodeId: 'start',
    constraints: { maxRisk: 1 },
    weights: { cost: 1, risk: 1 }
  });

  assert.equal(result.algorithm, 'classical-bounded-branch-search-v1');
  assert.equal(result.recommendation.path[0].branchId, 'safe');
  assert.equal(result.auditValid, true);
  assert.equal(result.executionPerformed, false);
  assert.equal(result.truncated, false);
});

test('does not recommend a path when search is truncated', () => {
  const adapter = new QuantumBranchingAdapter();
  const result = adapter.evaluate({
    graph,
    startNodeId: 'start',
    maxExpansions: 1
  });

  assert.equal(result.truncated, true);
  assert.equal(result.recommendation, null);
  assert.equal(result.executionPerformed, false);
});

test('rejects a planner with an invalid audit result', () => {
  const adapter = new QuantumBranchingAdapter({
    plan: () => ({
      audit: [],
      auditValid: false
    })
  });

  assert.throws(
    () => adapter.evaluate({}),
    /invalid audit trail/
  );
});

test('rejects an invalid planner dependency', () => {
  assert.throws(
    () => new QuantumBranchingAdapter({}),
    /planner must provide plan/
  );
});
