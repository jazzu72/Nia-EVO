function normalize(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function evaluate(item) {
  const eligibility = normalize(item.eligibilityEvidence);
  const deadline = normalize(item.deadlineEvidence);
  const amount = normalize(item.fundingAmountEvidence);
  const url = normalize(item.officialUrl);

  const checks = {
    officialUrl: /^https:\/\//i.test(url),
    eligibilityEvidence: eligibility.length >= 30,
    deadlineEvidence: deadline.length >= 20,
    fundingAmountEvidence: amount.length >= 10
  };

  const passed = Object.values(checks).filter(Boolean).length;

  let status = "REJECTED";

  if (passed === 4) {
    status = "VERIFIED";
  } else if (passed >= 2) {
    status = "NEEDS_REVIEW";
  }

  return {
    status,
    checks,
    passedChecks: passed,
    totalChecks: 4,
    ownerReviewOnly: true,
    submissionAllowed: false,
    signingAllowed: false,
    financialExecutionAllowed: false,
    moneyMovementAllowed: false,
    automaticApprovalAllowed: false,
    ownerApprovalRequired: true,
    ownerSignatureRequired: true
  };
}

function evaluateQueue(items) {
  const results = (Array.isArray(items) ? items : []).map(item => ({
    name: item.name || null,
    officialUrl: item.officialUrl || null,
    quality: evaluate(item)
  }));

  return {
    organization: "House of Jazzu",
    candidateCount: results.length,
    verifiedCount: results.filter(x => x.quality.status === "VERIFIED").length,
    needsReviewCount: results.filter(x => x.quality.status === "NEEDS_REVIEW").length,
    rejectedCount: results.filter(x => x.quality.status === "REJECTED").length,
    results,
    safety: {
      submissionAllowed: false,
      signingAllowed: false,
      financialExecutionAllowed: false,
      moneyMovementAllowed: false,
      automaticApprovalAllowed: false,
      ownerApprovalRequired: true,
      ownerSignatureRequired: true
    }
  };
}

module.exports = {
  evaluate,
  evaluateQueue
};
