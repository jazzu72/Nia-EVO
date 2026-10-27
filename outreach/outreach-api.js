
// NIA_DRAFT_QUEUE_V1
const express = require("express");
const engine = require("./outreach-engine");
const { requireOwnerAuth } = require("../owner-auth-middleware");
const router = express.Router();

router.use(requireOwnerAuth);

router.post("/create", (req, res) => {
  try {
    const result = engine.queueOutreach(req.body);
    return res.status(result.created ? 201 : 200).json({
      ok: true,
      success: true,
      created: result.created,
      duplicate: result.duplicate,
      message: result.draft,
      execution_performed: false
    });
  } catch (error) {
    const status = error.status || 500;
    if (status === 500) console.error("[OUTREACH_CREATE]", error.message);
    return res.status(status).json({
      ok: false,
      error: status === 500 ? "DRAFT_STORAGE_FAILED" : error.message
    });
  }
});

router.get("/queue", (req, res) => {
  try {
    return res.json(engine.getQueue());
  } catch (error) {
    console.error("[OUTREACH_QUEUE]", error.message);
    return res.status(500).json({
      ok: false,
      error: "DRAFT_STORAGE_FAILED"
    });
  }
});

router.post("/approve/:id", (req, res) => {
  return res.status(409).json({
    ok: false,
    blocked: true,
    error: "EXACT_MESSAGE_APPROVAL_NOT_IMPLEMENTED",
    execution_performed: false
  });
});

module.exports = router;
