const express = require("express");
const router = express.Router();
const drafter = require("../design/auto-drafter");

router.get("/queue", function (req, res) {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.since) filter.since = req.query.since;
  const drafts = drafter.listDrafts(filter);
  res.json({
    ok: true,
    count: drafts.length,
    pending: drafts.filter(function (d) { return d.status === "PENDING_OWNER_REVIEW"; }).length,
    drafts: drafts.map(function (d) {
      return {
        draft_id: d.draft_id,
        opportunity: d.opportunity_name,
        lane: d.lane,
        amount: d.amount,
        confidence: d.confidence,
        generator: d.generator,
        created_at: d.created_at,
        status: d.status,
      };
    }),
  });
});

router.get("/draft/:draftId", function (req, res) {
  const drafts = drafter.listDrafts({});
  const d = drafts.find(function (x) { return x.draft_id === req.params.draftId; });
  if (!d) return res.status(404).json({ ok: false, error: "draft_not_found" });
  res.json({ ok: true, draft: d });
});

router.post("/run", async function (req, res) {
  const body = req.body || {};
  try {
    const result = await drafter.runAutoDraft({
      daily_cap: body.daily_cap || 5,
      min_confidence: body.min_confidence || 0.6,
      lanes: body.lanes || ["grants", "customer_revenue", "enterprise_sales"],
    });
    res.json(result);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

router.post("/review/:draftId", function (req, res) {
  const action = (req.body || {}).action || "REVIEWED";
  const d = drafter.markReviewed(req.params.draftId, action);
  if (!d) return res.status(404).json({ ok: false, error: "draft_not_found" });
  res.json({ ok: true, draft: d });
});

module.exports = router;
