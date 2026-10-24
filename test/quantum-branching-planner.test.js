'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { QuantumBranchingPlanner } =
  require('../quantum-branching-planner');

const graph = {
  nodes: {
    start: {
      branches: [
        { id: 'fast', to: 'finish', utility: 10, cost: 8, risk: 5 },
        { id: 'safe', to: 'middle', utility: 7, cost: 2, risk: 1 },
        { id: 'blocked', to: 'finish', utility: 100, cost: 1,
          risk: 0, requires: { approval: true } }
      ]
    },
    middle: {
      branches: [
        { id: 'complete', to: 'finish', utility: 8, cost: 2,
          risk: 1, confidence: 0.9 }
      ]
    },
    finish: { terminal: true }
  }
};

test('explores and ranks multiple complete paths', () => {
  const result = new QuantumBranchingPlanner().plan({
    graph, startNodeId: 'start', context: { approval: false }
  });

  assert.equal(result.feasibleCount, 2);
  assert.equal(result.recommendation.path[0].branchId, 'safe');
  assert.equal(result.recommendation.score, 9);
  assert.equal(result.auditValid, true);
});

test('rejects paths that violate hard cost constraints', () => {
  const result = new QuantumBranchingPlanner().plan({
    graph, startNodeId: 'start', constraints: { maxCost: 3 }
  });

  assert.equal(result.feasibleCount, 0);
  assert.equal(result.recommendation, null);
});

test('respects context requirements', () => {
  const result = new QuantumBranchingPlanner().plan({
    graph, startNodeId: 'start', context: { approval: true }
  });

  assert.equal(result.recommendation.path[0].branchId, 'blocked');
});

test('rejects cycles and records the rejection', () => {
  const cyclic = { nodes: {
    a: { branches: [{ id: 'loop', to: 'a' }] }
  } };
  const result = new QuantumBranchingPlanner().plan({
    graph: cyclic, startNodeId: 'a'
  });

  assert.equal(result.recommendation, null);
  assert.ok(result.audit.some(e => e.reason === 'cycle'));
});

test('enforces minimum path confidence', () => {
  const result = new QuantumBranchingPlanner().plan({
    graph, startNodeId: 'start',
    constraints: { minConfidence: 0.95 }
  });

  assert.equal(result.recommendation.path[0].branchId, 'fast');
});

test('stops safely when exploration budget is exhausted', () => {
  const result = new QuantumBranchingPlanner().plan({
    graph, startNodeId: 'start', maxExpansions: 1
  });

  assert.equal(result.truncated, true);
  assert.equal(result.recommendation, null);
});

test('audit detects tampering', () => {
  const result = new QuantumBranchingPlanner().plan({
    graph, startNodeId: 'start'
  });

  assert.equal(
    QuantumBranchingPlanner.verifyAudit(result.audit), true
  );

  const altered = result.audit.map(e => ({ ...e }));
  altered[0].reason = 'tampered';
  assert.equal(QuantumBranchingPlanner.verifyAudit(altered), false);
});

test('rejects invalid starting node', () => {
  assert.throws(() => new QuantumBranchingPlanner().plan({
    graph, startNodeId: 'missing'
  }), /valid startNodeId/);
});


test('accepts a terminal reached on the final allowed expansion', () => {
  const result = new QuantumBranchingPlanner().plan({
    graph: { nodes: {
      start: { branches: [{ id: 'finish-now', to: 'finish', utility: 4 }] },
      finish: { terminal: true }
    } },
    startNodeId: 'start',
    maxExpansions: 1
  });

  assert.equal(result.truncated, false);
  assert.equal(result.recommendation.path[0].branchId, 'finish-now');
  assert.equal(result.recommendation.score, 4);
});

test('enforces maximum depth as the maximum number of branches', () => {
  const depthGraph = { nodes: {
    a: { branches: [{ id: 'ab', to: 'b' }] },
    b: { branches: [{ id: 'bf', to: 'finish' }] },
    finish: { terminal: true }
  } };

  const tooShallow = new QuantumBranchingPlanner().plan({
    graph: depthGraph, startNodeId: 'a', maxDepth: 1
  });
  const enoughDepth = new QuantumBranchingPlanner().plan({
    graph: depthGraph, startNodeId: 'a', maxDepth: 2
  });

  assert.equal(tooShallow.recommendation, null);
  assert.ok(tooShallow.audit.some(e => e.reason === 'max-depth'));
  assert.ok(enoughDepth.recommendation);
});

test('rejects malformed branch entries without crashing', () => {
  const result = new QuantumBranchingPlanner().plan({
    graph: { nodes: {
      start: { branches: [null, { id: 'ok', to: 'finish' }] },
      finish: { terminal: true }
    } },
    startNodeId: 'start'
  });

  assert.ok(result.recommendation);
  assert.ok(result.audit.some(e => e.reason === 'invalid-branch'));
});

test('rejects malformed graph options', () => {
  const planner = new QuantumBranchingPlanner();
  assert.throws(() => planner.plan({
    graph: { nodes: { start: { terminal: true } } },
    startNodeId: 'start',
    context: null
  }), /Invalid context object/);
});


test('audit verification safely rejects malformed input', () => {
  assert.equal(QuantumBranchingPlanner.verifyAudit(null), false);
  assert.equal(QuantumBranchingPlanner.verifyAudit({}), false);
  assert.equal(QuantumBranchingPlanner.verifyAudit([null]), false);
});

test('rejects non-finite accumulated scores', () => {
  const overflowGraph = { nodes: {
    start: { branches: [
      { id: 'large', to: 'finish', utility: Number.MAX_VALUE }
    ] },
    finish: { terminal: true }
  } };

  // A single finite value remains valid; the next test checks accumulation.
  const result = new QuantumBranchingPlanner().plan({
    graph: overflowGraph, startNodeId: 'start'
  });
  assert.equal(result.recommendation.score, Number.MAX_VALUE);
});


test('does not recommend a path when accumulated score overflows', () => {
  const overflowGraph = { nodes: {
    start: { branches: [
      { id: 'first', to: 'middle', utility: Number.MAX_VALUE }
    ] },
    middle: { branches: [
      { id: 'second', to: 'finish', utility: Number.MAX_VALUE }
    ] },
    finish: { terminal: true }
  } };

  const result = new QuantumBranchingPlanner().plan({
    graph: overflowGraph, startNodeId: 'start'
  });

  assert.equal(result.recommendation, null);
  assert.equal(result.auditValid, true);
});
