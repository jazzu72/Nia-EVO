const fs = require("fs");
const path = require("path");
const sourceAdapter = require("./official-source-adapter");

const PROFILE_PATH = path.join(
  __dirname, "..", "data", "funding", "house-of-jazzu-profile.json"
);

const INTAKE_PATH = path.join(
  __dirname, "..", "data", "funding", "verified-opportunity-intake.json"
);

function loadProfile() {
  return JSON.parse(fs.readFileSync(PROFILE_PATH, "utf8"));
}

function verifyCandidate(candidate) {
  const required = [
    "name",
    "source",
    "officialUrl",
    "eligibilityEvidence",
    "deadlineEvidence",
    "fundingAmountEvidence"
  ];

  let sourceRecord;
  try {
    sourceRecord = sourceAdapter.buildSourceRecord(candidate.officialUrl || "");
  } catch {
    sourceRecord = null;
  }

  const missing = required.filter(
    key => !candidate[key] || String(candidate[key]).trim() === ""
  );

  const officialHost =
    candidate.officialUrl &&
    /^https?:\/\/[^/]+/i.test(candidate.officialUrl);

  return {
    verified:
      missing.length === 0 &&
      !!officialHost &&
      !!sourceRecord &&
      sourceRecord.sourceVerified === true,
    missing,
    sourceVerified:
      missing.indexOf("source") === -1 &&
      !!officialHost &&
      !!sourceRecord &&
      sourceRecord.sourceVerified === true,
    eligibilityVerified: missing.indexOf("eligibilityEvidence") === -1,
    deadlineVerified: missing.indexOf("deadlineEvidence") === -1,
    amountVerified: missing.indexOf("fundingAmountEvidence") === -1
  };
}

function intake(candidates) {
  const profile = loadProfile();

  const results = candidates.map(candidate => {
    const verification = verifyCandidate(candidate);

    return {
      name: candidate.name || null,
      source: candidate.source || null,
      officialUrl: candidate.officialUrl || null,
      verification,
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

  const payload = {
    generatedAt: new Date().toISOString(),
    organization: profile.organization.name,
    mode: profile.ownerControls.mode,
    candidateCount: results.length,
    verifiedCount: results.filter(x => x.verification.verified).length,
    rejectedCount: results.filter(x => !x.verification.verified).length,
    results
  };

  fs.writeFileSync(
    INTAKE_PATH,
    JSON.stringify(payload, null, 2)
  );

  return payload;
}

module.exports = {
  loadProfile,
  verifyCandidate,
  intake
};
