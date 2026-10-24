'use strict';

const { QuantumBranchingPlanner } = require('./quantum-branching-planner');

class QuantumBranchingAdapter {
  constructor(planner = new QuantumBranchingPlanner()) {
    if (!planner || typeof planner.plan !== 'function') {
      throw new TypeError('planner must provide plan(options)');
    }
    this.planner = planner;
  }

  evaluate(options) {
    const result = this.planner.plan(options);

    if (!result || !Array.isArray(result.audit) ||
        result.auditValid !== true ||
        !QuantumBranchingPlanner.verifyAudit(result.audit)) {
      throw new Error('Branching planner returned an invalid audit trail');
    }

    return Object.freeze({
      algorithm: result.algorithm,
      startNodeId: result.startNodeId,
      expansions: result.expansions,
      truncated: result.truncated,
      feasibleCount: result.feasibleCount,
      recommendation: result.recommendation,
      feasiblePaths: result.feasiblePaths,
      audit: result.audit,
      auditValid: true,
      executionPerformed: false
    });
  }
}

module.exports = { QuantumBranchingAdapter };
