const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const REGISTRY_PATH = path.join(
  __dirname,
  "..",
  "data",
  "funding",
  "opportunity-registry.json"
);

function loadRegistry() {
  if (!fs.existsSync(REGISTRY_PATH)) {
    return {
      organization: "House of Jazzu",
      opportunities: []
    };
  }

  const data = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));

  if (data.organization !== "House of Jazzu")
    throw new Error("REGISTRY_ORGANIZATION_MISMATCH");

  return data;
}

function opportunityId(item) {
  const identity = [
    String(item.name || "").trim().toLowerCase(),
    String(item.officialUrl || "").trim().toLowerCase()
  ].join("|");

  return "opp-" + crypto
    .createHash("sha256")
    .update(identity)
    .digest("hex")
    .slice(0, 24);
}

function upsertQueue(queue) {
  if (!Array.isArray(queue))
    throw new Error("OWNER_REVIEW_QUEUE_REQUIRED");

  const registry = loadRegistry();

  for (const item of queue) {
    if (!item || !item.name || !item.officialUrl)
      continue;

    const id = opportunityId(item);

    const record = {
      id,
      name: item.name,
      officialUrl: item.officialUrl,
      verificationStatus: item.verificationStatus || "UNKNOWN",
      reviewPriority: item.reviewPriority || "REJECTED",
      passedChecks: Number(item.passedChecks || 0),
      ownerReviewOnly: true,
      submissionAllowed: false,
      signingAllowed: false,
      financialExecutionAllowed: false,
      moneyMovementAllowed: false,
      automaticApprovalAllowed: false,
      ownerApprovalRequired: true,
      ownerSignatureRequired: true,
      updatedAt: new Date().toISOString()
    };

    const index = registry.opportunities.findIndex(
      x => x.id === id
    );

    if (index === -1)
      registry.opportunities.push(record);
    else
      registry.opportunities[index] = {
        ...registry.opportunities[index],
        ...record
      };
  }

  fs.mkdirSync(path.dirname(REGISTRY_PATH), {
    recursive: true
  });

  fs.writeFileSync(
    REGISTRY_PATH,
    JSON.stringify(registry, null, 2)
  );

  return registry;
}

module.exports = {
  loadRegistry,
  opportunityId,
  upsertQueue
};
