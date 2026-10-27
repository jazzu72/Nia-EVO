// NIA SALES OUTREACH ENGINE

function generate(lead){

    const company =
    lead.company || "Business";


    const service =
    lead.service || "AI Automation";


    return {

        company,

        service,


        email:

`Subject: Helping ${company} save time with AI automation

Hello,

I noticed ${company} may benefit from improving daily workflows.

Nia Capital OS helps businesses automate repetitive tasks, improve customer follow-up, and create better operational visibility.

I would like to show you a simple automation plan customized for your business.

Would you be available for a quick conversation?

Thank you.`,



        sms:

`Hi, this is Nia Capital OS. We help businesses like ${company} automate tasks and improve operations using AI. Would you like a quick demo?`,



        callScript:

`Hello, I am reaching out because we help companies reduce manual work through AI automation.

I wanted to learn how ${company} handles customer follow-up and daily operations.

Would a short 15-minute conversation be useful?`,



        proposal:

{

title:
`${service} Implementation Plan`,

estimatedValue:
lead.value || 2500,

nextStep:
"Schedule discovery call"

}


    };

}


module.exports={
generate
};


// NIA_DRAFT_QUEUE_V1
const queueFS = require("fs");
const queuePath = require("path");
const queueCrypto = require("crypto");
const draftDB = queuePath.resolve(
  __dirname, "../data/revenue/outreach-drafts.json"
);

function queueError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function getQueue() {
  if (!queueFS.existsSync(draftDB)) return [];
  const rows = JSON.parse(queueFS.readFileSync(draftDB, "utf8"));
  if (!Array.isArray(rows) || rows.some(row =>
    !row || typeof row !== "object" || Array.isArray(row)
  )) {
    throw queueError("INVALID_DRAFT_STORE", 500);
  }
  return rows;
}

function queueOutreach(spec) {
  if (!spec || typeof spec !== "object" || Array.isArray(spec)) {
    throw queueError("DRAFT_REQUIRED", 400);
  }

  const fields = ["requestId", "to", "subject", "body"];
  for (const field of fields) {
    if (typeof spec[field] !== "string" || !spec[field].trim()) {
      throw queueError("MISSING_" + field.toUpperCase(), 400);
    }
  }

  if (spec.requestId.length > 200 || spec.to.length > 320 ||
      spec.subject.length > 500 || spec.body.length > 50000 ||
      spec.to.includes(String.fromCharCode(10)) ||
      spec.to.includes(String.fromCharCode(13)) ||
      !spec.to.includes("@")) {
    throw queueError("INVALID_DRAFT_FIELDS", 400);
  }

  const snapshot = {
    channel: "email",
    to: spec.to.trim(),
    subject: spec.subject,
    body: spec.body
  };
  const fingerprint = queueCrypto.createHash("sha256")
    .update(JSON.stringify(snapshot)).digest("hex");

  const rows = getQueue();
  const existing = rows.find(row => row.requestId === spec.requestId);

  if (existing) {
    if (existing.contentFingerprint !== fingerprint) {
      throw queueError("REQUEST_ID_CONTENT_CONFLICT", 409);
    }
    return { created: false, duplicate: true, draft: existing };
  }

  const draft = {
    id: "DRAFT-" + queueCrypto.randomUUID(),
    requestId: spec.requestId,
    schemaVersion: 1,
    channel: "email",
    to: snapshot.to,
    content: {
      email: { subject: snapshot.subject, body: snapshot.body }
    },
    contentFingerprint: fingerprint,
    status: "DRAFT",
    approvedAt: null,
    approvedBy: null,
    sentAt: null,
    createdAt: new Date().toISOString(),
    externalExecutionPerformed: false
  };

  rows.push(draft);
  queueFS.mkdirSync(queuePath.dirname(draftDB), { recursive: true });

  const temp = draftDB + ".tmp-" + queueCrypto.randomUUID();
  try {
    queueFS.writeFileSync(temp, JSON.stringify(rows, null, 2), {
      mode: 0o600,
      flag: "wx"
    });
    queueFS.renameSync(temp, draftDB);
  } finally {
    if (queueFS.existsSync(temp)) queueFS.unlinkSync(temp);
  }

  return { created: true, duplicate: false, draft };
}

module.exports.queueOutreach = queueOutreach;
module.exports.getQueue = getQueue;
