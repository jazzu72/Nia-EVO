const express = require("express");
const router = express.Router();

router.post("/message", async (req, res) => {
  try {
    const message = typeof req.body?.message === "string"
      ? req.body.message.trim()
      : "";

    if (!message) {
      return res.status(400).json({
        ok: false,
        error: "MESSAGE_REQUIRED"
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        ok: false,
        error: "LLM_PROVIDER_NOT_CONFIGURED"
      });
    }

    const { ChatOpenAI } = require("@langchain/openai");

    const model = new ChatOpenAI({
      model: process.env.NIA_CHAT_MODEL || "gpt-4o-mini",
      temperature: 0.2
    });

    const response = await model.invoke([
      {
        role: "system",
        content:
          "You are Nia, the executive AI of House of Jazzu. " +
          "You communicate directly with the owner. " +
          "You may analyze, explain, plan, research, and recommend actions. " +
          "Do not claim to have executed an external action unless the system confirms it. " +
          "Financial execution, signing, money movement, funding submission, or irreversible actions " +
          "require explicit owner approval."
      },
      {
        role: "user",
        content: message
      }
    ]);

    return res.json({
      ok: true,
      agent: "Nia",
      organization: "House of Jazzu",
      mode: "OWNER_CHAT",
      response: response.content,
      autonomousActions: false,
      ownerApprovalRequired: true
    });

  } catch (err) {
    console.error("NIA_CHAT_FAILED:", err);

    return res.status(500).json({
      ok: false,
      error: "NIA_CHAT_FAILED",
      message: err.message
    });
  }
});

module.exports = router;
