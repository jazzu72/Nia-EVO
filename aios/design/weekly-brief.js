/*
  NIA WEEKLY BRIEF — Monday morning letter
  Generated automatically, delivered to runtime/memory/briefs/
*/

const fs = require("fs");
const path = require("path");

async function generateBrief() {
  const llm = require("../../tools/llm");
  const gate = require("../../tools/autonomy-gate");
  const memory = require("./nia-memory");

  let engine = null;
  try { engine = require(path.join(__dirname, "..", "capital", "parallel-capital-engine")); } catch (e) {}

  let plan = null;
  try { plan = await require("./revenue-plan").buildPlan(); } catch (e) {}

  let capital = null;
  try {
    if (engine) {
      const sources = await engine.getLiveCapitalSources();
      const result = await engine.discover(sources);
      capital = result.summary || {};
    }
  } catch (e) {}

  const memoryBlock = memory.buildMemoryBlock(30);
  const autonomy = (() => { try { return gate.loadConfig().mode; } catch (e) { return "unknown"; } })();

  const context = [
    "Weekly brief context:",
    "Capital: " + JSON.stringify(capital),
    "Revenue plan: " + (plan ? JSON.stringify(plan.progress) : "unavailable"),
    "Autonomy: " + autonomy,
    "Recent activity: " + memoryBlock.slice(0, 800),
  ].join("\n");

  const prompt = [
    "You are NIA writing a Monday morning brief to Jason, the owner of House of Jazzu.",
    "Tone: direct, warm, honest. 3-5 short paragraphs.",
    "Structure: (1) what changed this week, (2) what stalled, (3) the single highest-leverage move this week, (4) one honest concern.",
    "Never invent numbers. Only use the data provided. End with one sentence of encouragement.",
    "",
    context,
  ].join("\n");

  const result = await llm.generate(prompt, function () {
    return "Weekly brief generated in template mode. Capital: " + JSON.stringify(capital) + ". Autonomy: " + autonomy + ".";
  });

  const brief = {
    ts: new Date().toISOString(),
    generator: result.generator,
    content: result.text,
  };

  const dir = "runtime/memory/briefs";
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "brief-" + Date.now() + ".json"), JSON.stringify(brief, null, 2));
  fs.writeFileSync(path.join(dir, "latest.json"), JSON.stringify(brief, null, 2));

  return brief;
}

module.exports = { generateBrief };
