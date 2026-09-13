const fs = require("fs");

const INPUTS = [
  "data/grant-prepared-applications.json",
  "data/grants/opportunities.json",
  "data/grants.json",
  "data/curated-grants.json"
];

const OUTPUT = "data/grant-drafts-ready-for-owner.json";

function readJson(path) {
  if (!fs.existsSync(path)) return null;
  try {
    return JSON.parse(fs.readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

function extractRecords(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;

  for (const key of [
    "queue",
    "opportunities",
    "grants",
    "applications",
    "packages"
  ]) {
    if (Array.isArray(data[key])) return data[key];
  }

  return [];
}

const records = [];

for (const path of INPUTS.slice(1)) {
  const data = readJson(path);
  for (const item of extractRecords(data)) {
    if (item && typeof item === "object") {
      records.push({
        source: path,
        ...item
      });
    }
  }
}

/*
 * Deduplicate without treating an opportunity as verified.
 */
const seen = new Set();
const unique = records.filter(item => {
  const key = String(
    item.id ||
    item.opportunityId ||
    item.opportunity_id ||
    item.grant ||
    item.title ||
    item.name ||
    ""
  ).trim().toLowerCase();

  if (!key || seen.has(key)) return false;
  seen.add(key);
  return true;
});

/*
 * Preparation-only representation.
 * NIA may organize and draft paperwork.
 * It may NOT submit, sign, approve, or move money.
 */
const drafts = unique.map((item, index) => ({
  draftId: `GRANT-DRAFT-${Date.now()}-${index}`,
  opportunity: {
    id: item.id || item.opportunityId || item.opportunity_id || null,
    title: item.title || item.name || item.grant || "Funding Opportunity",
    agency: item.agency || item.agencyName || null,
    source: item.source
  },

  preparationStatus: "DRAFT_READY_FOR_OWNER",

  application: {
    executiveSummary: "",
    projectDescription: "",
    innovation: "",
    businessNeed: "",
    commercializationPlan: "",
    milestones: "",
    budgetNarrative: "",
    supportingDocuments: []
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

  nextAction: "OWNER_REVIEW_AND_SIGN",

  createdAt: new Date().toISOString()
}));

const output = {
  system: "NIA GRANT DRAFT BUILDER",
  mode: "PREPARATION_ONLY",
  policy: "DRAFT_READY_FOR_OWNER",
  count: drafts.length,
  drafts
};

fs.writeFileSync(
  OUTPUT,
  JSON.stringify(output, null, 2) + "\n"
);

console.log("===== TASK 2 / STEP 6 =====");
console.log("SOURCE RECORDS:", records.length);
console.log("UNIQUE OPPORTUNITIES:", unique.length);
console.log("DRAFTS CREATED:", drafts.length);
console.log("STATUS: DRAFT_READY_FOR_OWNER");
console.log("OWNER REVIEW: REQUIRED");
console.log("OWNER SIGNATURE: REQUIRED");
console.log("AUTOMATIC APPROVAL: BLOCKED");
console.log("SUBMISSION: BLOCKED");
console.log("FINANCIAL EXECUTION: BLOCKED");
console.log("MONEY MOVEMENT: BLOCKED");
console.log("OUTPUT:", OUTPUT);
