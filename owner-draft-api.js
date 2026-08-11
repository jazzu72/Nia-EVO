const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const DRAFT_FILE = path.join(
  process.cwd(),
  "data/grant-drafts-filled.json"
);

function readDrafts() {
  if (!fs.existsSync(DRAFT_FILE)) {
    return {
      system: "NIA GRANT DRAFTS",
      mode: "OWNER_REVIEW_ONLY",
      drafts: []
    };
  }

  return JSON.parse(fs.readFileSync(DRAFT_FILE, "utf8"));
}

function writeDrafts(data) {
  fs.mkdirSync(path.dirname(DRAFT_FILE), { recursive: true });

  fs.writeFileSync(
    DRAFT_FILE,
    JSON.stringify(data, null, 2) + "\n"
  );
}

/*
 * READ
 */
router.get("/grant-drafts", (req, res) => {
  try {
    const data = readDrafts();

    res.json({
      ok: true,
      mode: "OWNER_REVIEW_ONLY",

      submissionAllowed: false,
      signingAllowed: false,
      financialExecutionAllowed: false,
      moneyMovementAllowed: false,
      automaticApprovalAllowed: false,

      ownerApprovalRequired: true,
      ownerSignatureRequired: true,

      count: Array.isArray(data.drafts)
        ? data.drafts.length
        : 0,

      drafts: data.drafts || []
    });

  } catch (err) {
    console.error("OWNER DRAFT READ ERROR:", err.message);

    res.status(500).json({
      ok: false,
      error: "Unable to read grant drafts"
    });
  }
});

/*
 * SAVE ONE DRAFT
 *
 * This endpoint ONLY edits preparation fields.
 * It cannot approve, sign, submit, or execute money.
 */
router.put("/grant-drafts/:draftId", (req, res) => {
  try {
    const data = readDrafts();

    if (!Array.isArray(data.drafts)) {
      return res.status(400).json({
        ok: false,
        error: "Draft collection is invalid"
      });
    }

    const index = data.drafts.findIndex(
      d => d.draftId === req.params.draftId
    );

    if (index === -1) {
      return res.status(404).json({
        ok: false,
        error: "Draft not found"
      });
    }

    const incoming = req.body || {};
    const current = data.drafts[index];

      if (Object.prototype.hasOwnProperty.call(incoming, "ownerNote")) {
        current.ownerNote = String(incoming.ownerNote ?? "");
      }

    const allowedApplicationFields = [
      "executiveSummary",
      "projectDescription",
      "innovation",
      "businessNeed",
      "commercializationPlan",
      "milestones",
      "budgetNarrative",
      "supportingDocuments"
    ];

    if (!current.application) {
      current.application = {};
    }

    for (const field of allowedApplicationFields) {
      if (Object.prototype.hasOwnProperty.call(incoming, field)) {
        current.application[field] = incoming[field];
      }
    }

    /*
     * Reassert safety controls after every save.
     */
    current.preparationStatus = "DRAFT_READY_FOR_OWNER";

    current.controls = {
      ...(current.controls || {}),

      submissionAllowed: false,
      signingAllowed: false,
      financialExecutionAllowed: false,
      moneyMovementAllowed: false,
      automaticApprovalAllowed: false,

      ownerApprovalRequired: true,
      ownerSignatureRequired: true
    };

    current.nextAction = "OWNER_REVIEW_AND_SIGN";
    current.updatedAt = new Date().toISOString();

    data.drafts[index] = current;

    writeDrafts(data);

    res.json({
      ok: true,
      saved: true,
      draftId: current.draftId,

      mode: "OWNER_REVIEW_ONLY",

      submissionAllowed: false,
      signingAllowed: false,
      financialExecutionAllowed: false,
      moneyMovementAllowed: false,
      automaticApprovalAllowed: false,

      ownerApprovalRequired: true,
      ownerSignatureRequired: true
    });

  } catch (err) {
    console.error("OWNER DRAFT SAVE ERROR:", err.message);

    res.status(500).json({
      ok: false,
      error: "Unable to save grant draft"
    });
  }
});

module.exports = router;
