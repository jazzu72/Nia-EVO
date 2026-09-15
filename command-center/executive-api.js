const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "executive-api",
    mode: "READ_ONLY",
    execution_allowed: false,
    autonomous_execution: false,
    human_approval_required: true,
    links: {
      capital: "/api/capital/hunt",
      owner: "/api/owner/grant-drafts",
      autonomy: "/api/autonomy/status",
    },
    timestamp: new Date().toISOString(),
  });
});

router.get("/health", (req, res) => {
  res.json({ ok: true, service: "executive-api", status: "ONLINE" });
});

module.exports = router;
