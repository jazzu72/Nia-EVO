const REQUIRED = [
  "identifiable_opportunity",
  "official_source",
  "eligibility_evidence",
  "deadline_evidence",
  "application_path"
];

function normalize(candidate) {
  const evidence = candidate.evidence || {};

  const missing = REQUIRED.filter(k => {
    const value = evidence[k];
    return !value || String(value).trim() === "";
  });

  return {
    opportunity: candidate.title || candidate.grant || null,
    evidence,
    requiredEvidence: REQUIRED,
    missingEvidence: missing,
    complete: missing.length === 0,
    submissionAllowed: false,
    financialExecutionAllowed: false,
    moneyMovementAllowed: false,
    ownerApprovalRequired: true
  };
}

module.exports = { REQUIRED, normalize };
