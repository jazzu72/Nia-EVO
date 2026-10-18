"use strict";

const fs = require("fs");
const file = "runtime/revenue-ops/legacy-followup-queue.json";
const q = JSON.parse(fs.readFileSync(file, "utf8"));

const lanes = {
  "VIPC": [
    "innovation_funding_or_partnership",
    "Verify the original inquiry, relevant program, eligibility and current status."
  ],
  "VIPC comms": [
    "communications_or_referral",
    "Check whether communications is the right contact or can route the inquiry."
  ],
  "VT CECE": [
    "institutional_program_or_partnership",
    "Verify the full organization name, original purpose and relevant program."
  ],
  "Norfolk EconDev": [
    "local_economic_development",
    "Review local business support, referral or partnership options relevant to House of Jazzu."
  ],
  "VA SBDC": [
    "small_business_advisory",
    "Check whether business advising or a referral is appropriate for the original request."
  ],
  "VA Catalyst": [
    "innovation_program_or_funding",
    "Verify the exact organization, program, eligibility and status of the original inquiry."
  ],
  "Hampton Roads CF": [
    "community_foundation_or_grant",
    "Verify the full foundation name, grant focus, eligibility and original inquiry."
  ],
  "Toshiba America Fdn": [
    "education_grant_or_partnership",
    "Verify the specific foundation program, applicant eligibility and project fit."
  ]
};

let changed = 0;

for (const item of q.items) {
  const lane = lanes[item.org];
  if (!lane) {
    item.review_lane = "unclassified";
    item.purpose_status = "owner_verification_required";
    continue;
  }

  item.review_lane = lane[0];
  item.purpose_status = "inferred_from_name_only";
  item.next_action = lane[1];
  item.owner_approval_required = true;
  item.draft_status = "not_approved";
  item.sent_automatically = false;
  changed++;
}

q.updated_at = new Date().toISOString();

const tmp = file + ".tmp";
fs.writeFileSync(tmp, JSON.stringify(q, null, 2), { mode: 0o600 });
fs.renameSync(tmp, file);

console.log("Classified for review:", changed);
console.log("Queue entries:", q.items.length);
console.log("Original outreach file modified: no");
console.log("Sales pipeline modified: no");
console.log("Messages sent: 0");
