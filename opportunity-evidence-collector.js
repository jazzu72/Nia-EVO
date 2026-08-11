const fs = require('fs');

const SPEC = require('./opportunity-evidence-collector-spec.json');

function collect(candidate = {}) {
  const evidence = {
    identifiable_opportunity: candidate.identifiable_opportunity || null,
    official_source: candidate.official_source || null,
    eligibility_evidence: candidate.eligibility_evidence || null,
    deadline_evidence: candidate.deadline_evidence || null,
    application_path: candidate.application_path || null
  };

  const missing = Object.entries(evidence)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  return {
    system: SPEC.system,
    mode: SPEC.mode,
    evidence,
    complete: missing.length === 0,
    missingEvidence: missing,
    submissionAllowed: false,
    financialExecutionAllowed: false,
    moneyMovementAllowed: false,
    ownerApprovalRequired: true
  };
}

module.exports = { collect };
