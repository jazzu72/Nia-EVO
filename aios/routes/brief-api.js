const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const brief = require("../design/weekly-brief");

router.get("/latest", (req, res) => {
  const p = "runtime/memory/briefs/latest.json";
  if (!fs.existsSync(p)) return res.json({ ok: false, error: "no_brief_yet" });
  try { res.json({ ok: true, brief: JSON.parse(fs.readFileSync(p, "utf8")) }); }
  catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

router.post("/generate", async (req, res) => {
  try {
    const result = await brief.generateBrief();
    res.json({ ok: true, brief: result });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;
