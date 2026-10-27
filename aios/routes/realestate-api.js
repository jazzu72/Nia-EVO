const express = require("express");
const router = express.Router();
const re = require("../design/realestate");
const verification = require("../design/realestate-verification").createVerificationStore();

function validateDealInput(body) {
  if (!body || typeof body !== "object" || Array.isArray(body))
    return "Request body must be an object.";
  if (typeof body.address !== "string" || !body.address.trim() || body.address.trim().length > 300)
    return "Address is required and must be 300 characters or fewer.";
  for (const key of ["price", "rent", "repairs"]) {
    const v = body[key];
    if (v === undefined || v === null || v === "" || !Number.isFinite(Number(v)))
      return key + " must be a valid number.";
    if (key === "price" ? Number(v) <= 0 : Number(v) < 0)
      return key + (key === "price" ? " must be greater than zero." : " cannot be negative.");
  }
  for (const key of ["arv", "ARV"]) {
    const v = body[key];
    if (v !== undefined && v !== null && v !== "" &&
        (!Number.isFinite(Number(v)) || Number(v) <= 0))
      return "ARV, when supplied, must be greater than zero.";
  }
  if (body.assumptions !== undefined &&
      (!body.assumptions || typeof body.assumptions !== "object" || Array.isArray(body.assumptions)))
    return "Assumptions must be an object.";
  const a = body.assumptions || {};
  for (const [key, min, max] of [
    ["operating_expense_ratio", 0, 0.9],
    ["down_payment_ratio", 0, 1],
    ["annual_interest_rate", 0, 0.3]
  ]) {
    if (a[key] === undefined) continue;
    if (a[key] === null || a[key] === "" || !Number.isFinite(Number(a[key])) ||
        Number(a[key]) < min || Number(a[key]) > max)
      return key + " is outside its permitted range.";
  }
  if (a.loan_term_years !== undefined &&
      (!Number.isInteger(Number(a.loan_term_years)) ||
       Number(a.loan_term_years) < 1 || Number(a.loan_term_years) > 40))
    return "loan_term_years must be an integer from 1 to 40.";
  return null;
}


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
    const error = validateDealInput(req.body);
    if (error) return res.status(400).json({ ok: false, error });
    const input = Object.assign({}, req.body, {
      address: req.body.address.trim(),
      verificationStatus: "UNVERIFIED",
      dataClassification: "UNVERIFIED_USER_SUBMITTED"
    });
    const deal = re.addDeal(input);
    res.json({ ok: true, deal: deal });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
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
  try {
    const error = validateDealInput(req.body);
    if (error) return res.status(400).json({ ok: false, error });
    return res.json({ ok: true, score: re.scoreDeal(req.body) });
  } catch (e) {
    return res.status(400).json({ ok: false, error: e.message });
  }
});


function verificationErrorStatus(error) {
  const code = error && error.message;
  if (code === "DEAL_NOT_FOUND") return 404;
  if ([
    "DEMO_RECORD_CANNOT_BE_VERIFIED",
    "DEAL_CLASSIFICATION_NOT_ELIGIBLE",
    "DEAL_ALREADY_VERIFIED",
    "DEAL_NOT_VERIFIED"
  ].includes(code)) return 409;
  if ([
    "DEAL_ID_INVALID",
    "OWNER_ACTOR_REQUIRED",
    "EVIDENCE_REQUIRED",
    "EVIDENCE_URL_INVALID",
    "EVIDENCE_DESCRIPTION_INVALID",
    "EVIDENCE_DATE_INVALID",
    "OWNER_ATTESTATION_REQUIRED"
  ].includes(code)) return 400;
  return 500;
}

router.post("/:dealId/verify", function (req, res) {
  try {
    const result = verification.verify(
      req.params.dealId,
      req.body && req.body.evidence,
      "Jason LeSane",
      req.ownerAuthMethod
    );
    return res.json(result);
  } catch (error) {
    const status = verificationErrorStatus(error);
    if (status === 500) {
      console.error("[REALESTATE_VERIFY] Verification failed");
      return res.status(500).json({ ok: false, error: "VERIFICATION_FAILED" });
    }
    return res.status(status).json({ ok: false, error: error.message });
  }
});

router.post("/:dealId/revoke", function (req, res) {
  try {
    const result = verification.revoke(
      req.params.dealId,
      "Jason LeSane",
      req.ownerAuthMethod
    );
    return res.json(result);
  } catch (error) {
    const status = verificationErrorStatus(error);
    if (status === 500) {
      console.error("[REALESTATE_VERIFY] Revocation failed");
      return res.status(500).json({ ok: false, error: "VERIFICATION_FAILED" });
    }
    return res.status(status).json({ ok: false, error: error.message });
  }
});

router.validateDealInput = validateDealInput;

module.exports = router;
