const express = require("express");
const router = express.Router();
const envelopes = require("../design/t2-envelopes");

function requireOwner(req, res, next) {
  const expected = process.env.NIA_OWNER_AUTH_TOKEN;
  if (!expected) return res.status(503).json({ ok: false, error: "OWNER_AUTH_NOT_CONFIGURED" });
  const auth = req.get("authorization") || "";
  const presented = auth.replace(/^Bearer\s+/i, "").trim();
  if (!presented || presented !== expected) return res.status(401).json({ ok: false, error: "OWNER_AUTH_REQUIRED" });
  next();
}

router.get("/list", requireOwner, function (req, res) {
  res.json({ ok: true, envelopes: envelopes.listEnvelopes() });
});

router.post("/sign", requireOwner, function (req, res) {
  try {
    const token = (req.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
    const env = envelopes.signEnvelope(req.body || {}, token);
    res.json({ ok: true, envelope: env });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

router.post("/revoke", requireOwner, function (req, res) {
  try {
    const id = (req.body || {}).id;
    if (!id) return res.status(400).json({ ok: false, error: "id required" });
    const env = envelopes.revokeEnvelope(id, (req.body || {}).reason);
    res.json({ ok: true, envelope: env });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

router.post("/check", function (req, res) {
  const body = req.body || {};
  const action = body.action;
  if (!action) return res.status(400).json({ ok: false, error: "action required" });
  const result = envelopes.checkEnvelope(action, body.amount, body.context || {});
  res.json(Object.assign({ ok: true, action: action, amount: body.amount || 0 }, result));
});

module.exports = router;
