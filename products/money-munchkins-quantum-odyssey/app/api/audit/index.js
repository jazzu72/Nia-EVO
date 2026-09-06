const express = require("express");
const ledger = require("../../../platform/audit/event-ledger");

const router = express.Router();

router.get("/verify", (req, res) => {
  const result = ledger.verify();

  res.status(result.valid ? 200 : 500).json({
    success: result.valid,
    audit: result
  });
});

router.post("/event", (req, res) => {
  try {
    const { type, payload } = req.body || {};

    const event = ledger.append(type, payload);

    res.status(201).json({
      success: true,
      event: {
        id: event.id,
        type: event.type,
        timestamp: event.timestamp,
        hash: event.hash
      }
    });
  } catch {
    res.status(400).json({
      success: false,
      error: "INVALID_AUDIT_EVENT"
    });
  }
});

module.exports = router;
