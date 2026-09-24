const express = require("express");
const router = express.Router();
const discord = require("../integrations/discord");

router.get("/status", async (_req, res) => {
  try {
    res.json(await discord.status());
  } catch (e) {
    res.status(503).json({ ok: false, connected: false, error: e.message });
  }
});

router.post("/message", async (req, res) => {
  try {
    const { channel_id, content } = req.body || {};
    if (!content) return res.status(400).json({ ok: false, error: "content_required" });
    const result = await discord.sendMessage(channel_id, content);
    res.json({ ok: true, message_id: result.id, channel_id: result.channel_id });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;
