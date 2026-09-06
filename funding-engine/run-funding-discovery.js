const discovery = require("./funding-discovery-engine");
const intake = require("./verified-funding-intake");

async function main() {
  const plan = await discovery.discover();

  if (plan.organization !== "House of Jazzu")
    throw new Error("PROFILE_BINDING_FAILED");

  if (plan.mode !== "OWNER_REVIEW_ONLY")
    throw new Error("OWNER_MODE_FAILURE");

  const candidates = [];

  for (const item of plan.searchPlan) {
    candidates.push({
      name: `DISCOVERY:${item.query}`,
      source: "DISCOVERY_QUEUE",
      officialUrl: "",
      eligibilityEvidence: "",
      deadlineEvidence: "",
      fundingAmountEvidence: ""
    });
  }

  const result = intake.intake(candidates);

  if (result.organization !== "House of Jazzu")
    throw new Error("INTAKE_PROFILE_FAILURE");

  if (result.verifiedCount !== 0)
    throw new Error("UNVERIFIED_DISCOVERY_ACCEPTED");

  if (result.rejectedCount !== candidates.length)
    throw new Error("DISCOVERY_QUARANTINE_FAILURE");

  for (const item of result.results) {
    if (
      item.verification.verified ||
      item.submissionAllowed !== false ||
      item.signingAllowed !== false ||
      item.financialExecutionAllowed !== false ||
      item.moneyMovementAllowed !== false ||
      item.automaticApprovalAllowed !== false ||
      item.ownerApprovalRequired !== true ||
      item.ownerSignatureRequired !== true
    ) {
      throw new Error("SAFETY_BOUNDARY_FAILURE");
    }
  }

  console.log("DISCOVERY_PROFILE: PASS");
  console.log("DISCOVERY_TERMS:", plan.searchPlan.length);
  console.log("UNVERIFIED_CANDIDATES:", result.candidateCount);
  console.log("VERIFIED_ACCEPTED:", result.verifiedCount);
  console.log("QUARANTINED:", result.rejectedCount);
  console.log("OWNER_REVIEW_ONLY: PASS");
  console.log("SAFETY_LOCKS: PASS");
}

main().catch(err => {
  console.error("STEP_175_FAILED:", err.message);
  process.exit(1);
});
