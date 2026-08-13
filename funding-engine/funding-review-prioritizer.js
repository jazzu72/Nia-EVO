const ledger = require("./funding-review-ledger");

function priorityFor(item) {
  if (!item) return "REJECTED";

  const queue = Array.isArray(item.ownerReviewQueue)
    ? item.ownerReviewQueue
    : [];

  if (!queue.length) return "REJECTED";

  const hasHigh = queue.some(x =>
    x &&
    (x.reviewPriority === "HIGH" ||
     x.verificationStatus === "EVIDENCE_FOUND_REQUIRES_REVIEW")
  );

  return hasHigh ? "HIGH" : "LOW";
}

function buildReviewQueue() {
  const data = ledger.loadLedger();
  const entries = Array.isArray(data.entries) ? data.entries : [];

  const queue = entries.map(entry => ({
    id: entry.id,
    recordedAt: entry.recordedAt,
    organization: entry.organization,
    mode: entry.mode,
    candidateCount: entry.candidateCount,
    evidenceFoundCount: entry.evidenceFoundCount,
    reviewPriority: priorityFor(entry),
    ownerApprovalRequired: true,
    ownerSignatureRequired: true,
    submissionAllowed: false,
    signingAllowed: false,
    financialExecutionAllowed: false,
    moneyMovementAllowed: false,
    automaticApprovalAllowed: false
  }));

  return {
    organization: data.organization,
    entryCount: entries.length,
    highPriorityCount: queue.filter(x => x.reviewPriority === "HIGH").length,
    lowPriorityCount: queue.filter(x => x.reviewPriority === "LOW").length,
    rejectedCount: queue.filter(x => x.reviewPriority === "REJECTED").length,
    queue,
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
  priorityFor,
  buildReviewQueue
};
