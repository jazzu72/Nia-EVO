const express = require("express");
const router = express.Router();
const x = require("../design/executive-actions");

router.post("/email/send", async function (req, res) {
  try {
    const r = await x.sendEmail(req.body || {});
    res.status(r.ok ? 200 : 403).json(r);
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

router.post("/grant/queue", async function (req, res) {
  try {
    const r = await x.queueGrantSubmission(req.body || {});
    res.status(r.ok ? 200 : 403).json(r);
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

router.post("/realestate/inquiry", async function (req, res) {
  try {
    const r = await x.sendRealEstateInquiry(req.body || {});
    res.status(r.ok ? 200 : 403).json(r);
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

router.post("/outreach/draft", async function (req, res) {
  try {
    const r = await x.draftOutreach(req.body || {});
    res.status(r.ok ? 200 : 403).json(r);
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

router.get("/queue", function (req, res) {
  const items = x.listQueue({ status: req.query.status, type: req.query.type });
  res.json({ ok: true, count: items.length, actions: items });
});

router.post("/queue/:id/sent", function (req, res) {
  const item = x.markSent(req.params.id);
  if (!item) return res.status(404).json({ ok: false, error: "not_found" });
  res.json({ ok: true, item: item });
});

module.exports = router;
