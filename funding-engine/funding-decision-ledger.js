const fs = require("fs");
const path = require("path");

const LEDGER_PATH = path.join(
  __dirname,
  "..",
  "data",
  "funding",
  "quality-gated-decision-ledger.json"
);

function loadLedger() {
  if (!fs.existsSync(LEDGER_PATH)) {
    return {
      organization: "House of Jazzu",
      entries: []
    };
  }

  return JSON.parse(fs.readFileSync(LEDGER_PATH, "utf8"));
}

function recordPipeline(result) {
  if (!result || result.organization !== "House of Jazzu") {
    throw new Error("INVALID_PIPELINE_RESULT");
  }

  const ledger = loadLedger();

  const entry = {
    id: `decision-${Date.now()}`,
    recordedAt: new Date().toISOString(),
    organization: result.organization,
    mode: result.mode,
    searchTermCount: result.searchTermCount,
    candidateCount: result.candidateCount,
    evidenceFoundCount: result.evidenceFoundCount,
    needsReviewCount: result.needsReviewCount,
    rejectedCount: result.rejectedCount,
    ownerReviewQueue: result.ownerReviewQueue,
    qualityGate: result.qualityGate,
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

  ledger.organization = "House of Jazzu";
  ledger.entries.push(entry);

  fs.mkdirSync(path.dirname(LEDGER_PATH), { recursive: true });

  fs.writeFileSync(
    LEDGER_PATH,
    JSON.stringify(ledger, null, 2)
  );

  return entry;
}

module.exports = {
  loadLedger,
  recordPipeline
};
