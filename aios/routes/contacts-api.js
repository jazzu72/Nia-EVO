const express = require("express");
const fs = require("fs");
const router = express.Router();

const FILE = "data/contacts/contacts.json";

router.get("/", function (req, res) {
  try { res.json({ ok: true, data: JSON.parse(fs.readFileSync(FILE, "utf8")) }); }
  catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

router.post("/add", function (req, res) {
  try {
    const data = JSON.parse(fs.readFileSync(FILE, "utf8"));
    const lane = (req.body || {}).lane || "businesses";
    if (!data[lane]) data[lane] = [];
    data[lane].push(req.body);
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
    res.json({ ok: true, contact: req.body });
  } catch (e) { res.status(400).json({ ok: false, error: e.message }); }
});

module.exports = router;
