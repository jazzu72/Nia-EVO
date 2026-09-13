const prioritizer = require("./funding-review-prioritizer");

function decide(item) {
  if (!item) {
    return {
      decision: "REJECT",
      reason: "NO_REVIEW_ITEM",
      ownerAction: "NONE"
    };
  }

  if (item.reviewPriority === "REJECTED") {
    return {
      decision: "REJECT",
      reason: "INSUFFICIENT_VERIFIED_EVIDENCE",
      ownerAction: "DO_NOT_PURSUIT"
    };
  }

  if (item.reviewPriority === "HIGH") {
    return {
      decision: "OWNER_REVIEW",
      reason: "VERIFIED_FUNDING_SIGNAL_REQUIRES_OWNER_REVIEW",
      ownerAction: "REVIEW_OPPORTUNITY"
    };
  }

  return {
    decision: "OWNER_REVIEW",
    reason: "POTENTIAL_FIT_REQUIRES_OWNER_REVIEW",
    ownerAction: "REVIEW_OPPORTUNITY"
  };
}

function buildDecisionQueue() {
  const result = prioritizer.buildReviewQueue();

  const queue = result.queue.map(item => ({
    ...item,
    ...decide(item),
    execution: {
      submissionAllowed: false,
      signingAllowed: false,
      financialExecutionAllowed: false,
      moneyMovementAllowed: false,
      automaticApprovalAllowed: false,
      ownerApprovalRequired: true,
      ownerSignatureRequired: true
    }
  }));

  return {
    organization: result.organization,
    entryCount: result.entryCount,
    decisionCount: queue.length,
    decisions: queue,
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
  decide,
  buildDecisionQueue
};
