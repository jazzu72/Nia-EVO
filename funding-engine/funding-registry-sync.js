const registry = require("./funding-opportunity-registry");
const prioritizer = require("./funding-review-prioritizer");

function syncReviewQueue() {
  const queue = prioritizer.buildReviewQueue();

  if (!queue || queue.organization !== "House of Jazzu") {
    throw new Error("INVALID_REVIEW_QUEUE_ORGANIZATION");
  }

  const saved = registry.upsertQueue(queue.entries || []);

  return {
    ok: true,
    organization: saved.organization,
    opportunityCount: saved.opportunities.length,
    reviewQueueCount: (queue.entries || []).length,
    synchronizedAt: new Date().toISOString(),
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
  syncReviewQueue
};
