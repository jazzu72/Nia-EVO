const { readVaultJSON } = require("./tools/vault-helpers");
const fs = require("fs");
const path = require("path");

const EXECUTION_QUEUE = "nia-grant-execution-queue.json";
const FUNDING_QUEUE = "data/funding/owner-funding-action-queue.json";
const PROFILE_FILE = "data/funding/house-of-jazzu-profile.json";
const OUTPUT = "nia-grant-application-packages.json";

function readJson(file, fallback) {
try {
return JSON.parse(fs.readFileSync(file, "utf8"));
} catch (e) {
if (fallback !== undefined) return fallback;
throw new Error("Cannot read valid JSON: " + file + " — " + e.message);
}
}

function listFromQueue(data) {
if (Array.isArray(data)) return data;
if (data && Array.isArray(data.queue)) return data.queue;
if (data && Array.isArray(data.candidates)) return data.candidates;
return [];
}

function keyOf(g) {
return String(g.grantId || g.id || g.applicationId || g.name || g.source || "")
.trim();
}

function build() {
const profile = readVaultJSON(path.resolve(__dirname, PROFILE_FILE));
const oldOutput = readJson(OUTPUT, {});
const existingPackages = Array.isArray(oldOutput.packages)
? oldOutput.packages : [];
const oldById = new Map(existingPackages.map(p => [p.applicationId, p]));

const executionData = readJson(EXECUTION_QUEUE, { queue: [] });
const fundingData = readJson(FUNDING_QUEUE, { candidates: [] });
const merged = new Map();

for (const g of [...listFromQueue(executionData), ...listFromQueue(fundingData)]) {
const id = keyOf(g);
if (!id) continue;
const prev = merged.get(id) || {};
merged.set(id, { ...prev, ...g });
}

const org = profile.organization || {};
const mission = profile.fundingMission || {};
const packages = [];

for (const [id, grant] of merged) {
const applicationId = "APP-" + id.replace(/[^a-z0-9_-]/gi, "_");
const old = oldById.get(applicationId) || {};
const oldSections = old.sections || {};
const title = grant.name || grant.title || grant.source || id;
const deadline = grant.deadline || null;
const evidence = [
"Verify the official program page, current deadline, award amount and application route",
"Confirm legal entity status, ownership and applicant eligibility",
"Verify current product stage, revenue, traction and pilot evidence",
"Prepare a justified project budget and milestones",
"Collect required registrations, certifications and supporting documents",
"Owner review and signature before any submission"
];

const sections = {
  companyProfile: {
    name: org.name || "House of Jazzu",
    owner: org.owner || "Jason LeSane",
    location: org.location || "Norfolk, Virginia",
    mission: mission.primaryObjective || ""
  },
  project: {
    flagship: "Money Munchkins: Quantum Odyssey",
    summary: "Children's financial-literacy educational game.",
    currentStage: "REQUIRES_OWNER_VERIFICATION",
    technicalInnovation: "",
    targetUsers: "Children ages 8–11; verify intended pilot and customer evidence."
  },
  innovationSummary: "",
  problemStatement: "",
  solution: "",
  commercializationPlan: "",
  milestones: [],
  useOfFunds: [],
  budget: {
    status: "REQUIRES_VERIFIED_COSTS",
    currency: "USD",
    items: []
  },
  eligibility: {
    status: "NOT_VERIFIED",
    checks: evidence.slice(0, 3)
  },
  requiredEvidence: evidence,
  reviewStatus: "PENDING_HUMAN_APPROVAL"
};

const mergedSections = { ...sections, ...oldSections };
mergedSections.project = { ...sections.project, ...(oldSections.project || {}) };
mergedSections.companyProfile = {
  ...sections.companyProfile,
  ...(typeof oldSections.companyProfile === "object" ? oldSections.companyProfile : {})
};
mergedSections.budget = { ...sections.budget, ...(oldSections.budget || {}) };
mergedSections.eligibility = {
  ...sections.eligibility,
  ...(oldSections.eligibility || {}),
  status: oldSections.eligibility?.status || "NOT_VERIFIED"
};
mergedSections.requiredEvidence = Array.isArray(oldSections.requiredEvidence)
  ? [...new Set([...evidence, ...oldSections.requiredEvidence])]
  : evidence;

packages.push({
  ...old,
  applicationId,
  grant: id,
  name: title,
  source: grant.source || grant.funder || grant.url || null,
  officialUrl: grant.officialUrl || grant.url || null,
  deadline,
  listedAmount: grant.amount || grant.awardAmount || null,
  status: "DRAFT_REQUIRES_OWNER_REVIEW",
  sections: mergedSections,
  submission: {
    allowed: false,
    verifiedSubmitted: false,
    evidence: null
  },
  created: old.created || new Date().toISOString(),
  updated: new Date().toISOString()
});

}

const output = {
system: "NIA GRANT APPLICATION BUILDER",
version: "2.0.0",
mode: "FUNDING_FIRST",
generatedAt: new Date().toISOString(),
safety: {
autoSubmit: false,
ownerApprovalRequired: true,
ownerSignatureRequired: true,
eligibilityMustBeVerified: true,
submissionRequiresPortalEvidence: true
},
inputSources: [EXECUTION_QUEUE, FUNDING_QUEUE, PROFILE_FILE],
packageCount: packages.length,
packages
};

const tmp = OUTPUT + ".tmp";
fs.writeFileSync(tmp, JSON.stringify(output, null, 2) + "\n");
JSON.parse(fs.readFileSync(tmp, "utf8"));
fs.renameSync(tmp, OUTPUT);
require("child_process").execFileSync(
  process.execPath,
  [path.join(__dirname, "nia-grant-application-completion.js")],
  { stdio: "inherit" }
);

console.log(JSON.stringify({
ok: true,
output: OUTPUT,
packages: packages.length,
autoSubmit: false,
ownerReviewRequired: true,
submissionPerformed: false
}, null, 2));
}

if (require.main === module) build();
module.exports = { build };
