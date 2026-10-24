'use strict';

const crypto = require('node:crypto');

function isObject(value) {
  return value !== null && typeof value === 'object' &&
    !Array.isArray(value);
}

function stable(value) {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return '[' + value.map(stable).join(',') + ']';
  }
  return '{' + Object.keys(value).sort().map(
    key => JSON.stringify(key) + ':' + stable(value[key])
  ).join(',') + '}';
}

function digest(value) {
  return crypto.createHash('sha256').update(stable(value)).digest('hex');
}

class QuantumBranchingPlanner {
  plan({
    graph,
    startNodeId,
    context = {},
    constraints = {},
    weights = {},
    maxExpansions = 1000,
    maxDepth = 50,
    topN = 5
  } = {}) {
    if (!isObject(graph) || !isObject(graph.nodes)) {
      throw new Error('Invalid graph object');
    }
    if (typeof startNodeId !== 'string' ||
        !Object.hasOwn(graph.nodes, startNodeId)) {
      throw new Error('A valid startNodeId is required');
    }
    if (!isObject(context)) throw new Error('Invalid context object');
    if (!isObject(constraints)) throw new Error('Invalid constraints object');
    if (!isObject(weights)) throw new Error('Invalid weights object');

    for (const [name, value] of Object.entries({
      maxExpansions, maxDepth, topN
    })) {
      if (!Number.isSafeInteger(value) || value < 1) {
        throw new Error(`Invalid ${name}`);
      }
    }

    const maxCost = constraints.maxCost ?? Infinity;
    const maxRisk = constraints.maxRisk ?? Infinity;
    const minConfidence = constraints.minConfidence ?? 0;
    const costWeight = weights.cost ?? 1;
    const riskWeight = weights.risk ?? 1;

    if (typeof maxCost !== 'number' || Number.isNaN(maxCost) ||
        maxCost < 0 ||
        typeof maxRisk !== 'number' || Number.isNaN(maxRisk) ||
        maxRisk < 0 ||
        typeof minConfidence !== 'number' ||
        !Number.isFinite(minConfidence) ||
        minConfidence < 0 || minConfidence > 1) {
      throw new Error('Invalid constraints values');
    }
    if (![costWeight, riskWeight].every(
      value => typeof value === 'number' &&
        Number.isFinite(value) && value >= 0
    )) {
      throw new Error('Invalid weights values');
    }

    const nodes = graph.nodes;
    const candidates = [];
    const audit = [];
    let previousHash = 'GENESIS';
    let expansions = 0;
    let truncated = false;

    const record = event => {
      const entry = {
        sequence: audit.length + 1,
        previousHash,
        ...event
      };
      entry.hash = digest(entry);
      previousHash = entry.hash;
      audit.push(entry);
    };

    const walk = (nodeId, path, visited, totals, confidence) => {
      if (path.length > maxDepth) {
        record({ type: 'rejected', nodeId, reason: 'max-depth' });
        return;
      }

      const node = nodes[nodeId];
      if (!isObject(node)) {
        record({ type: 'rejected', nodeId, reason: 'missing-or-invalid-node' });
        return;
      }

      if (node.terminal === true) {
        if (confidence < minConfidence) {
          record({ type: 'rejected', nodeId, reason: 'min-confidence' });
          return;
        }

        const score = totals.utility -
          costWeight * totals.cost -
          riskWeight * totals.risk;

        if (![totals.utility, totals.cost, totals.risk,
          confidence, score].every(Number.isFinite)) {
          record({ type: 'rejected', nodeId, reason: 'numeric-overflow' });
          return;
        }

        candidates.push({
          path: path.map(edge => ({ ...edge })),
          terminalNodeId: nodeId,
          utility: totals.utility,
          cost: totals.cost,
          risk: totals.risk,
          confidence,
          score
        });
        record({ type: 'candidate', terminalNodeId: nodeId, score });
        return;
      }

      if (path.length >= maxDepth) {
        record({ type: 'rejected', nodeId, reason: 'max-depth' });
        return;
      }

      if (expansions >= maxExpansions) {
        truncated = true;
        return;
      }

      if (!Array.isArray(node.branches) || node.branches.length === 0) {
        record({ type: 'rejected', nodeId, reason: 'dead-end' });
        return;
      }

      for (const branch of node.branches) {
        if (expansions >= maxExpansions) {
          truncated = true;
          break;
        }
        expansions++;

        if (!isObject(branch)) {
          record({ type: 'rejected', nodeId, reason: 'invalid-branch' });
          continue;
        }

        const branchId = branch.id;
        const target = branch.to;
        const edge = {
          utility: branch.utility ?? 0,
          cost: branch.cost ?? 0,
          risk: branch.risk ?? 0,
          confidence: branch.confidence ?? 1
        };

        if (typeof branchId !== 'string' || !branchId ||
            typeof target !== 'string' || !target ||
            !Object.values(edge).every(
              value => typeof value === 'number' &&
                Number.isFinite(value)
            ) ||
            edge.cost < 0 || edge.risk < 0 ||
            edge.confidence < 0 || edge.confidence > 1 ||
            (branch.requires !== undefined &&
              !isObject(branch.requires))) {
          record({
            type: 'rejected', nodeId,
            branchId: branchId ?? null,
            reason: 'invalid-branch'
          });
          continue;
        }

        if (branch.requires && Object.entries(branch.requires).some(
          ([key, value]) => context[key] !== value
        )) {
          record({ type: 'rejected', nodeId, branchId,
            reason: 'context-requirement' });
          continue;
        }

        if (visited.has(target)) {
          record({ type: 'rejected', nodeId, branchId, reason: 'cycle' });
          continue;
        }

        if (!Object.hasOwn(nodes, target)) {
          record({ type: 'rejected', nodeId, branchId,
            reason: 'missing-or-invalid-node' });
          continue;
        }

        const nextTotals = {
          utility: totals.utility + edge.utility,
          cost: totals.cost + edge.cost,
          risk: totals.risk + edge.risk
        };
        const nextConfidence = confidence * edge.confidence;

        if (![nextTotals.utility, nextTotals.cost,
          nextTotals.risk, nextConfidence].every(Number.isFinite)) {
          record({ type: 'rejected', nodeId, branchId,
            reason: 'numeric-overflow' });
          continue;
        }

        if (nextTotals.cost > maxCost || nextTotals.risk > maxRisk) {
          record({ type: 'rejected', nodeId, branchId,
            reason: 'hard-constraint' });
          continue;
        }

        record({ type: 'explored', nodeId, branchId, target });

        const nextVisited = new Set(visited);
        nextVisited.add(target);

        walk(
          target,
          [...path, { nodeId, branchId, target, ...edge }],
          nextVisited,
          nextTotals,
          nextConfidence
        );
      }
    };

    walk(startNodeId, [], new Set([startNodeId]), {
      utility: 0, cost: 0, risk: 0
    }, 1);

    candidates.sort((a, b) => {
      if (a.score !== b.score) return a.score > b.score ? -1 : 1;
      return stable(a.path.map(edge => edge.branchId)).localeCompare(
        stable(b.path.map(edge => edge.branchId))
      );
    });

    const feasiblePaths = candidates.slice(0, topN);
    const recommendation = truncated ? null : (feasiblePaths[0] ?? null);

    record({
      type: 'result',
      expansions,
      truncated,
      feasibleCount: candidates.length,
      recommendationScore: recommendation?.score ?? null
    });

    return {
      algorithm: 'classical-bounded-branch-search-v1',
      startNodeId,
      expansions,
      truncated,
      feasibleCount: candidates.length,
      feasiblePaths,
      recommendation,
      audit,
      auditValid: QuantumBranchingPlanner.verifyAudit(audit)
    };
  }

  static verifyAudit(entries) {
    if (!Array.isArray(entries)) return false;
    let previousHash = 'GENESIS';

    for (let index = 0; index < entries.length; index++) {
      const entry = entries[index];
      if (!isObject(entry)) return false;

      const { hash: suppliedHash, ...payload } = entry;
      if (payload.sequence !== index + 1 ||
          payload.previousHash !== previousHash ||
          typeof suppliedHash !== 'string' ||
          !/^[a-f0-9]{64}$/.test(suppliedHash) ||
          digest(payload) !== suppliedHash) {
        return false;
      }
      previousHash = suppliedHash;
    }
    return true;
  }
}

module.exports = { QuantumBranchingPlanner };
