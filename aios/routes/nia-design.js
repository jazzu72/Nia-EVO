const express = require("express");
const router = express.Router();
const design = require("../design/vitruvian-ui-ux");
const llm = require("../../tools/llm");

router.get("/lenses", (req, res) => {
  res.json({ ok: true, lenses: design.listLenses() });
});

router.post("/review", async (req, res) => {
  const { surface, goal, audience, constraints } = req.body || {};
  if (!surface) return res.status(400).json({ ok: false, error: "surface required" });

  const prompt = design.buildReviewPrompt({ surface, goal, audience, constraints });
  const result = await llm.generate(prompt, () =>
    "Design review unavailable (LLM offline).\n\n" +
    "Lenses to apply manually:\n" +
    design.listLenses().map(l => "- " + l.name + ": " + l.focus).join("\n")
  );

  res.json({ ok: true, generator: result.generator, review: result.text });
});

module.exports = router;
