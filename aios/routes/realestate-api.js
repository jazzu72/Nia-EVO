const express = require("express");
const router = express.Router();
const re = require("../design/realestate");

router.get("/list", function (req, res) {
  const filter = {};
  if (req.query.verdict) filter.verdict = req.query.verdict;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.min_score) filter.min_score = Number(req.query.min_score);
  const deals = re.listDeals(filter);
  res.json({ ok: true, count: deals.length, deals: deals });
});

router.post("/add", function (req, res) {
  try {
    const deal = re.addDeal(req.body || {});
    res.json({ ok: true, deal: deal });
  } catch (e) { res.status(400).json({ ok: false, error: e.message }); }
});

router.post("/seed", function (req, res) {
  try {
    const r = re.seedDeals();
    res.json(Object.assign({ ok: true }, r));
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

router.post("/inquiry/:dealId", async function (req, res) {
  try {
    const r = await re.sendInquiry(req.params.dealId, (req.body || {}).message);
    res.status(r.ok ? 200 : 403).json(r);
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

router.post("/score", function (req, res) {
  res.json({ ok: true, score: re.scoreDeal(req.body || {}) });
});

module.exports = router;
