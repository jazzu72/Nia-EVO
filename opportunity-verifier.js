const REQUIRED = [
  "identifiable_opportunity",
  "official_source",
  "eligibility_evidence",
  "deadline_evidence",
  "application_path"
];

function verify(candidate = {}) {
  const missing = REQUIRED.filter(k =>
    !candidate[k] || String(candidate[k]).trim() === ""
  );

  return {
    status: missing.length ? "CLASSIFIED" : "VERIFIED",
    verified: missing.length === 0,
    missingEvidence: missing,
    submissionAllowed: false,
    financialExecutionAllowed: false,
    moneyMovementAllowed: false,
    ownerApprovalRequired: true
  };
}

module.exports = { verify, REQUIRED };
