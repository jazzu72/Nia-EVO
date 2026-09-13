const fs = require("fs");

const INPUT = "data/grant-drafts-ready-for-owner.json";
const OUTPUT = "data/grant-drafts-filled.json";

if (!fs.existsSync(INPUT)) {
  console.error("❌ Draft file missing");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(INPUT, "utf8"));
const drafts = Array.isArray(data.drafts) ? data.drafts : [];

function evidenceText(opportunity) {
  return Object.entries(opportunity || {})
    .filter(([k, v]) => k !== "source" && v !== null && v !== undefined)
    .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`)
    .join("\n");
}

const filled = drafts.map(draft => {
  const evidence = evidenceText(draft.opportunity);

  return {
    ...draft,

    preparationStatus: "DRAFT_READY_FOR_OWNER",

    evidence: {
      source: draft.opportunity.source || null,
      suppliedOpportunityData: evidence,
      evidenceOnly: true,
      unsupportedClaimsGenerated: false
    },

    application: {
      ...draft.application,

      /*
       * Only fields directly supported by supplied opportunity data
       * are populated automatically. Everything else remains blank.
       */
      projectDescription:
        draft.opportunity.description ||
        draft.opportunity.projectDescription ||
        "",

      innovation:
        draft.opportunity.innovation ||
        draft.opportunity.technology ||
        "",

      businessNeed:
        draft.opportunity.businessNeed ||
        draft.opportunity.need ||
        "",

      milestones:
        draft.opportunity.milestones ||
        "",

      commercializationPlan:
        draft.opportunity.commercializationPlan ||
        "",

      budgetNarrative:
        draft.opportunity.budgetNarrative ||
        ""
    },

    controls: {
      submissionAllowed: false,
      signingAllowed: false,
      financialExecutionAllowed: false,
      moneyMovementAllowed: false,
      automaticApprovalAllowed: false,
      ownerApprovalRequired: true,
      ownerSignatureRequired: true
    },

    nextAction: "OWNER_REVIEW_AND_SIGN"
  };
});

fs.writeFileSync(
  OUTPUT,
  JSON.stringify({
    system: "NIA GRANT EVIDENCE FILLER",
    mode: "PREPARATION_ONLY",
    policy: "EVIDENCE_REQUIRED",
    count: filled.length,
    drafts: filled,
    generatedAt: new Date().toISOString()
  }, null, 2) + "\n"
);

console.log("===== TASK 2 / STEP 7 =====");
console.log("DRAFTS PROCESSED:", filled.length);
console.log("EVIDENCE-ONLY FILLING: ENABLED");
console.log("UNSUPPORTED CLAIM GENERATION: BLOCKED");
console.log("OWNER REVIEW: REQUIRED");
console.log("OWNER SIGNATURE: REQUIRED");
console.log("SUBMISSION: BLOCKED");
console.log("FINANCIAL EXECUTION: BLOCKED");
console.log("MONEY MOVEMENT: BLOCKED");
console.log("OUTPUT:", OUTPUT);
