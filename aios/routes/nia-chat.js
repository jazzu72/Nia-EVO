const express = require("express");
const path = require("path");
const router = express.Router();
const llm = require("../../tools/llm");
const gate = require("../../tools/autonomy-gate");

let engine = null;
try { engine = require(path.join(__dirname, "..", "capital", "parallel-capital-engine")); } catch (e) {}

const NL = String.fromCharCode(10);
const SYSTEM = "You are NIA, the autonomous capital intelligence for House of Jazzu. Be direct and concise. Only cite data given. Never claim capabilities you don't have. Financial execution is permanently blocked; owner signature is required for submission.";

router.post("/chat", async (req, res) => {
  const message = (req.body || {}).message || "";
  if (!message) return res.status(400).json({ ok: false, error: "message required" });

  let capital = null;
  try {
    if (engine) {
      const sources = await engine.getLiveCapitalSources();
      const result = await engine.discover(sources);
      capital = {
        opportunities: result.summary.total_opportunities,
        total: result.summary.total_amount,
        by_lane: result.summary.by_lane,
      };
    }
  } catch (e) {}

  let autonomy = "unknown";
  try { autonomy = gate.loadConfig().mode; } catch (e) {}

  const context = capital
    ? "Live capital: " + capital.opportunities + " opportunities, $" + capital.total.toLocaleString() + ", by lane: " + JSON.stringify(capital.by_lane) + ". Autonomy mode: " + autonomy + ". Financial execution: BLOCKED (T4 permanent lock). Owner signature: REQUIRED."
    : "Live capital: unavailable. Autonomy mode: " + autonomy + ".";

  const prompt = SYSTEM + NL + NL + context + NL + NL + "Owner: " + message;

  const result = await llm.generate(prompt, function () {
    return "You asked: " + message.slice(0, 100) + ". " +
      "Live pipeline: " + (capital ? capital.opportunities : 0) + " opportunities, $" + ((capital ? capital.total : 0)).toLocaleString() + ". " +
      "(LLM unavailable; template response.)";
  });

  res.json({
    ok: true,
    reply: result.text,
    generator: result.generator,
    context: capital,
    timestamp: new Date().toISOString(),
  });
});

router.get("/chat/health", function (req, res) {
  res.json({ ok: true, service: "nia-chat", provider: process.env.NIA_ENABLE_GEMINI === "true" ? "gemini" : "unknown" });
});

module.exports = router;
