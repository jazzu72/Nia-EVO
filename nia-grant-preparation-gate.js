const fs = require("fs");

const INPUT = "nia-grant-application-builder.js";
const OUTPUT = "nia-grant-prepared-applications.json";

const PREPARATION_POLICY = {
  status: "DRAFT_READY_FOR_OWNER",
  submissionAllowed: false,
  financialExecutionAllowed: false,
  moneyMovementAllowed: false,
  automaticApprovalAllowed: false,
  ownerSignatureRequired: true,
  ownerApprovalRequired: true
};

function run() {
  if (!fs.existsSync(INPUT)) {
    console.error("❌ Application builder missing");
    process.exit(1);
  }

  const source = fs.readFileSync(INPUT, "utf8");

  const result = {
    system: "NIA GRANT APPLICATION PREPARATION",
    mode: "PREPARATION_ONLY",
    policy: PREPARATION_POLICY,
    source: INPUT,
    generatedAt: new Date().toISOString(),
    draft: {
      sourceModulePresent: true,
      applicationPreparationEnabled: true,
      submissionEnabled: false,
      signingEnabled: false,
      financialExecutionEnabled: false
    },
    ownerAction: "REVIEW_AND_SIGN_MANUALLY",
    sourceAudit: {
      builderLoaded: source.length > 0
    }
  };

  fs.writeFileSync(
    OUTPUT,
    JSON.stringify(result, null, 2) + "\n"
  );

  console.log("===== TASK 2 / STEP 5 =====");
  console.log("GRANT PREPARATION: OPEN");
  console.log("DRAFT STATUS: DRAFT_READY_FOR_OWNER");
  console.log("OWNER SIGNATURE: REQUIRED");
  console.log("AUTOMATIC APPROVAL: BLOCKED");
  console.log("SUBMISSION: BLOCKED");
  console.log("FINANCIAL EXECUTION: BLOCKED");
  console.log("MONEY MOVEMENT: BLOCKED");
  console.log("OUTPUT:", OUTPUT);
}

run();
