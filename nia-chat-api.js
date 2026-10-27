const express = require("express");
const router = express.Router();

const SYSTEM_PROMPT =
  "You are Nia, the private executive AI assistant for House of Jazzu. " +
  "You assist the owner with strategy, research, software, funding analysis, " +
  "operations and planning. You may analyze and recommend actions, but you " +
  "must never claim to have submitted applications, signed agreements, moved " +
  "money, approved funding, or executed financial transactions without explicit " +
  "owner authorization and a separate execution mechanism. Preserve owner-only " +
  "confidentiality. Never claim an action occurred unless it was actually verified.";

async function askOpenAI(message) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_NOT_CONFIGURED");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: process.env.NIA_CHAT_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message }
      ]
    }),
    signal: AbortSignal.timeout(30000)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(`OPENAI_HTTP_${response.status}`);
    err.status = response.status;
    throw err;
  }

  const answer = data?.choices?.[0]?.message?.content?.trim();
  if (!answer) throw new Error("OPENAI_EMPTY_RESPONSE");
  return answer;
}

async function askGemini(message) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_NOT_CONFIGURED");

  const configuredModel = process.env.NIA_GEMINI_MODEL ||
    (process.env.NIA_AI_MODEL || "").replace(/^models\//, "");
  const model = configuredModel.startsWith("gemini-")
    ? configuredModel
    : "gemini-2.5-flash";

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      contents: [{
        role: "user",
        parts: [{ text: message }]
      }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 2048 }
    }),
    signal: AbortSignal.timeout(30000)
  };

  let response;
  let data = {};
  for (let attempt = 0; attempt < 3; attempt++) {
    response = await fetch(url, requestOptions);
    data = await response.json().catch(() => ({}));
    if (response.status !== 503 || attempt === 2) break;
    console.warn("NIA_GEMINI_RETRY: temporary 503, attempt " + (attempt + 2));
    await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
  }
  if (!response.ok) {
    // Do not log the request URL or credentials.
    console.error("NIA_GEMINI_ERROR:", {
      status: response.status,
      message: data?.error?.message || "Gemini request failed"
    });
    throw new Error(`GEMINI_HTTP_${response.status}`);
  }

  const answer = data?.candidates?.[0]?.content?.parts
    ?.map(part => part.text || "")
    .join("")
    .trim();

  if (!answer) throw new Error("GEMINI_EMPTY_RESPONSE");
  return answer;
}

router.post("/message", async (req, res) => {
  const message = typeof req.body?.message === "string"
    ? req.body.message.trim()
    : "";

  if (!message) {
    return res.status(400).json({ ok: false, error: "MESSAGE_REQUIRED" });
  }

  let answer;
  let provider;


  // Prefer Gemini; use OpenAI only if Gemini is unavailable or fails.
  if (process.env.GEMINI_API_KEY) {
    try {
      answer = await askGemini(message);
      provider = "gemini";
    } catch (err) {
      console.error("NIA_GEMINI_FAILED:", err.message);
    }
  }

  if (!answer && process.env.OPENAI_API_KEY) {
    try {
      answer = await askOpenAI(message);
      provider = "openai";
    } catch (err) {
      console.error("NIA_OPENAI_FAILED:", err.message);
    }
  }

  if (!answer) {
    const configured = Boolean(
      process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY
    );
    return res.status(configured ? 502 : 503).json({
      ok: false,
      error: configured
        ? "NIA_ALL_PROVIDERS_FAILED"
        : "NIA_LLM_NOT_CONFIGURED"
    });
  }

  return res.json({
    ok: true,
    agent: "Nia",
    organization: "House of Jazzu",
    mode: "OWNER_CHAT",
    provider,
    reply: answer,
    response: answer,
    autonomousActions: false,
    ownerApprovalRequired: true
  });
});

module.exports = router;
