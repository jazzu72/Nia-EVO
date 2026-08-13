const express = require("express");
const router = express.Router();

router.post("/message", async (req, res) => {
  try {
    const message = typeof req.body?.message === "string"
      ? req.body.message.trim()
      : "";

    if (!message) {
      return res.status(400).json({
        ok: false,
        error: "MESSAGE_REQUIRED"
      });
    }

    return res.json({
      ok: true,
      agent: "Nia",
      organization: "House of Jazzu",
      message: `Nia received: ${message}`,
      mode: "OWNER_CHAT",
      autonomousActions: false,
      ownerApprovalRequired: true
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: "NIA_CHAT_FAILED"
    });
  }
});

module.exports = router;
