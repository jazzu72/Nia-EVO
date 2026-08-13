const discovery = require("./funding-discovery-engine");
const collector = require("./funding-source-collector");

async function run(candidates = []) {
  const plan = discovery.buildSearchPlan();

  if (!Array.isArray(candidates)) {
    throw new Error("CANDIDATES_MUST_BE_ARRAY");
  }

  const collected = candidates.length
    ? await collector.collect(candidates)
    : {
        organization: discovery.loadProfile().organization.name,
        mode: discovery.loadProfile().ownerControls.mode,
        candidateCount: 0,
        evidenceFoundCount: 0,
        results: []
      };

  const ranked = collected.results
    .map(item => ({
      ...item,
      reviewPriority:
        item.verificationStatus === "EVIDENCE_FOUND_REQUIRES_REVIEW"
          ? "HIGH"
          : item.verificationStatus === "INSUFFICIENT_EVIDENCE"
            ? "LOW"
            : "REJECTED"
    }))
    .sort((a, b) => {
      const rank = { HIGH: 0, LOW: 1, REJECTED: 2 };
      return rank[a.reviewPriority] - rank[b.reviewPriority];
    });

  return {
    ok: true,
    organization: collected.organization,
    mode: collected.mode,
    searchTermCount: plan.length,
    candidateCount: ranked.length,
    evidenceFoundCount: ranked.filter(
      x => x.reviewPriority === "HIGH"
    ).length,
    ownerReviewQueue: ranked,
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

module.exports = { run };
