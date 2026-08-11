const fs = require("fs");

const INPUT = "nia-owner-approval-queue.json";
const OUTPUT = "nia-verified-grant-queue.json";

const KEYWORDS = [
  "sbir",
  "sttr",
  "grant",
  "funding opportunity",
  "proposal",
  "solicitation",
  "award",
  "research"
];

if (!fs.existsSync(INPUT)) {
  console.log("❌ Owner queue missing");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(INPUT, "utf8"));
const queue = Array.isArray(data.queue) ? data.queue : [];

const classified = queue
  .filter(item => {
    const text = `${item.title || ""} ${item.grant || ""}`.toLowerCase();
    return KEYWORDS.some(k => text.includes(k));
  })
  .map(item => ({
    ...item,
    verificationStatus: "CLASSIFIED",
    submissionAllowed: false,
    financialExecutionAllowed: false,
    moneyMovementAllowed: false,
    ownerApprovalRequired: true
  }));

fs.writeFileSync(
  OUTPUT,
  JSON.stringify({
    system: "NIA VERIFIED GRANT QUEUE",
    count: classified.length,
    queue: classified,
    qualityGate: "EVIDENCE_REQUIRED",
    promotionRule: "OBSERVED->CLASSIFIED->VERIFIED->APPROVED->EXECUTED",
    updated: new Date().toISOString()
  }, null, 2) + "\n"
);

console.log("🧠 GRANT QUALITY FILTER ONLINE");
console.log("CLASSIFIED CANDIDATES:", classified.length);
console.log("VERIFICATION:", "BLOCKED");
console.log("SUBMISSION:", "BLOCKED");
console.log("FINANCIAL EXECUTION:", "BLOCKED");
console.log("OWNER APPROVAL AUTOMATION:", "BLOCKED");
