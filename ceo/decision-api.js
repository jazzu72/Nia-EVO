const express = require("express");
const router = express.Router();
const { requireOwnerAuth } = require("../owner-auth-middleware");
const orchestrator = require("../grants-engine/funding-orchestrator");
const submission = require("../grants-engine/submission-engine");
const actionQueue = require("./action-queue-engine");

// Read-only decision endpoint: never create records on GET.
router.get("/decision", (req, res) => {
  const fundingDecision = orchestrator.orchestrate();
  res.json({
    system: "NIA CEO CAPITAL ALLOCATION ENGINE",
    status: "ONLINE",
    fundingDecision,
    execution: { performed: false, message: "Read-only decision; no package or action was created." },
    generated: new Date().toISOString()
  });
});

// Owner authentication is required for local package/action creation.
router.post("/decision/execute", requireOwnerAuth, (req, res) => {
  const fundingDecision = orchestrator.orchestrate();
  const submissionPackage = submission.createSubmission({
    name: "Virginia Innovation Partnership Corporation",
    amount: 250000
  });
  const action = actionQueue.createAction({
    title: "Complete Virginia Innovation Partnership Corporation submission",
    priority: "CRITICAL",
    category: "GRANT_FUNDING"
  });
  res.json({
    system: "NIA CEO CAPITAL ALLOCATION ENGINE",
    status: "ONLINE",
    fundingDecision,
    submissionPackage,
    actionQueue: action,
    externalSubmissionPerformed: false,
    humanSubmissionRequired: true,
    generated: new Date().toISOString()
  });
});

module.exports = router;
