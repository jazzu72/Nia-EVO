const REQUIRED = [
  "identifiable_opportunity",
  "official_source",
  "eligibility_evidence",
  "deadline_evidence",
  "application_path"
];

function evaluate(evidence = {}) {
  const missing = REQUIRED.filter(
    key => !evidence[key] || String(evidence[key]).trim() === ""
  );

  return {
    status: missing.length === 0 ? "VERIFIED" : "CLASSIFIED",
    missingEvidence: missing,
    verified: missing.length === 0,
    submissionAllowed: false,
    financialExecutionAllowed: false,
    moneyMovementAllowed: false,
    ownerApprovalRequired: true
  };
}

module.exports = { evaluate, REQUIRED };
