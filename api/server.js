const express = require("express");
const bodyParser = require("body-parser");
const apiBrain = require("../core/api-brain");
const tools = require("../core/tools");

const app = express();
app.use(bodyParser.json());

app.post("/nia/think", async (req, res) => {
  try {
    const prompt = req.body.prompt || "Think.";
    const output = await apiBrain(prompt);
    res.json({ ok: true, output });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

app.post("/nia/tool", async (req, res) => {
  try {
    const { tool, payload } = req.body;
    const result = await tools.use(tool, payload);
    res.json(result);
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

app.listen(3000, () => {
  console.log("NIA-EVO REAL AUTONOMOUS API running on http://localhost:3000");
});
