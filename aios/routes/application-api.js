const express = require("express");
const router = express.Router();
const apps = require("../design/grant-application");

router.get("/list", function (req, res) {
  res.json({ ok: true, applications: apps.listApplications() });
});

router.post("/generate", async function (req, res) {
  const body = req.body || {};
  if (!body.opportunity || !body.opportunity.id) {
    return res.status(400).json({ ok: false, error: "opportunity required" });
  }
  try {
    const app = await apps.generateApplication(body.opportunity);
    res.json({ ok: true, application: {
      application_id: app.application_id,
      opportunity: app.opportunity.name,
      status: app.status,
      sections: app.sections.length,
      words: app.total_word_count,
    }});
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

router.get("/view/:id", function (req, res) {
  const app = apps.loadApplication(req.params.id);
  if (!app) return res.status(404).json({ ok: false, error: "not_found" });
  res.json({ ok: true, application: app });
});

router.get("/submission/:id", function (req, res) {
  const app = apps.loadApplication(req.params.id);
  if (!app) return res.status(404).json({ ok: false, error: "not_found" });
  res.type("text/plain").send(apps.toSubmissionText(app));
});

router.post("/sign/:id", function (req, res) {
  const body = req.body || {};
  const app = apps.signApplication(req.params.id, body.owner_note);
  if (!app) return res.status(404).json({ ok: false, error: "not_found" });
  res.json({ ok: true, application: { application_id: app.application_id, status: app.status, signed_at: app.signed_at } });
});

module.exports = router;
