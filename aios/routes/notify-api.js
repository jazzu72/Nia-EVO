const express = require("express");
const router = express.Router();
const n = require("../design/notify");

router.post("/daily-summary", async function (req, res) {
  try { res.json(Object.assign({ ok: true }, await n.sendDailySummary())); }
  catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

router.post("/test", async function (req, res) {
  try { res.json(Object.assign({ ok: true }, await n.notifyOwner("Test notification", "If you receive this, notifications are working."))); }
  catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

module.exports = router;
