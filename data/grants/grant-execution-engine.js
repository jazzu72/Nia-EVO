const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const CAMPAIGN = path.join(ROOT, "applications", "money-munchkins-2-grant-campaign.json");

function loadCampaign() {
  return JSON.parse(fs.readFileSync(CAMPAIGN, "utf8"));
}

function saveEvidence(grantId, evidence) {
  const file = path.join(ROOT, "evidence", `${grantId}.json`);
  fs.writeFileSync(file, JSON.stringify({
    grantId,
    createdAt: new Date().toISOString(),
    evidence
  }, null, 2));
  return file;
}

function createSubmissionGate(grant) {
  return {
    grantId: grant.id,
    grantName: grant.name,
    amount: grant.amount,
    status: "OWNER_APPROVAL_REQUIRED",
    submitAllowed: false,
    paymentAllowed: false,
    legalCertificationAllowed: false,
    generatedAt: new Date().toISOString()
  };
}

function buildQueue() {
  const campaign = loadCampaign();

  return campaign.grants
    .sort((a, b) => a.priority - b.priority)
    .map(grant => ({
      id: grant.id,
      name: grant.name,
      amount: grant.amount,
      deadline: grant.deadline,
      priority: grant.priority,
      status: grant.status,
      nextAction: "VERIFY_ELIGIBILITY",
      submissionGate: createSubmissionGate(grant)
    }));
}

if (require.main === module) {
  console.log("=== NIA GRANT EXECUTION ENGINE ===");
  console.log(JSON.stringify({
    campaign: loadCampaign().campaign,
    queue: buildQueue()
  }, null, 2));
  console.log("==================================");
}

module.exports = {
  loadCampaign,
  saveEvidence,
  createSubmissionGate,
  buildQueue
};
