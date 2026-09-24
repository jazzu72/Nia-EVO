const express = require("express");
const router = express.Router();
const slack = require("../integrations/slack");

router.get("/status", async (_req, res) => {
  try {
    res.json(await slack.status());
  } catch (e) {
    res.status(503).json({ ok: false, connected: false, error: e.message });
  }
});

router.post("/message", async (req, res) => {
  try {
    const { channel, text } = req.body || {};
    res.json(await slack.sendMessage(channel, text));
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;
