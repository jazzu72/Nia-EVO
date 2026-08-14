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

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        ok: false,
        error: "NIA_LLM_NOT_CONFIGURED"
      });
    }

    const model = process.env.NIA_CHAT_MODEL || "gpt-4o-mini";

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are Nia, the executive AI assistant for House of Jazzu. " +
              "You assist the owner with strategy, research, software, funding analysis, " +
              "operations and planning. You may analyze and recommend actions, but you " +
              "must never claim to have submitted applications, signed agreements, moved " +
              "money, approved funding, or executed financial transactions without explicit " +
              "owner authorization and a separate execution mechanism."
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("NIA_LLM_ERROR:", data);
      return res.status(502).json({
        ok: false,
        error: "NIA_LLM_REQUEST_FAILED"
      });
    }

    const answer =
      data?.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      return res.status(502).json({
        ok: false,
        error: "NIA_EMPTY_RESPONSE"
      });
    }

    return res.json({
      ok: true,
      agent: "Nia",
      organization: "House of Jazzu",
      mode: "OWNER_CHAT",
      response: answer,
      autonomousActions: false,
      ownerApprovalRequired: true
    });

  } catch (err) {
    console.error("NIA_CHAT_FAILED:", err);

    return res.status(500).json({
      ok: false,
      error: "NIA_CHAT_FAILED"
    });
  }
});

module.exports = router;
