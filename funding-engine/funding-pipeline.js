const discovery = require("./funding-discovery-engine");
const deduplicator = require("./funding-deduplicator");
const collector = require("./funding-source-collector");
const gate = require("./funding-evidence-quality-gate");

async function run(candidates) {
  const deduplication = deduplicator.deduplicate(candidates);
  const uniqueCandidates = deduplication.unique;

  const discoveryResult = await discovery.discover();
  const collected = await collector.collect(candidates || []);
  const quality = gate.evaluateQueue(collected.results || []);

  const ownerReviewQueue = quality.results.map(item => {
    let reviewPriority = "REJECTED";

    if (item.quality.status === "VERIFIED") {
      reviewPriority = "HIGH";
    } else if (item.quality.status === "NEEDS_REVIEW") {
      reviewPriority = "LOW";
    }

    return {
      name: item.name,
      officialUrl: item.officialUrl,
      verificationStatus: item.quality.status,
      passedChecks: item.quality.passedChecks,
      reviewPriority,
      ownerReviewOnly: true,
      submissionAllowed: false,
      signingAllowed: false,
      financialExecutionAllowed: false,
      moneyMovementAllowed: false,
      automaticApprovalAllowed: false,
      ownerApprovalRequired: true,
      ownerSignatureRequired: true
    };
  });

  return {
    deduplication: {
      inputCount: deduplication.inputCount,
      uniqueCount: deduplication.uniqueCount,
      duplicateCount: deduplication.duplicateCount
    },
    ok: true,
    organization: discoveryResult.organization,
    mode: discoveryResult.mode,
    generatedAt: new Date().toISOString(),
    searchTermCount: discoveryResult.searchPlan.length,
    candidateCount: ownerReviewQueue.length,
    evidenceFoundCount: quality.verifiedCount,
    needsReviewCount: quality.needsReviewCount,
    rejectedCount: quality.rejectedCount,
    ownerReviewQueue,
    qualityGate: {
      verifiedCount: quality.verifiedCount,
      needsReviewCount: quality.needsReviewCount,
      rejectedCount: quality.rejectedCount
    },
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
  run
};
