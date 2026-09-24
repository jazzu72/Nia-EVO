/*
  NIA LLM — parallel provider race
  Fires all enabled providers simultaneously, returns first successful response.
  Falls back to template only if ALL providers fail.
*/

let cachedGeminiModel = null;
let cachedOpenRouterModel = null;

function hasRealKey(k) {
  return k && k.length > 20 && !/XXXXX|PLACEHOLDER|PASTE|_HERE/i.test(k);
}

const PROVIDERS = {
  gemini: false,
  openrouter: hasRealKey(process.env.OPENROUTER_API_KEY) && process.env.NIA_ENABLE_OPENROUTER !== "false",
  huggingface: false,
  openai: false,
};

function errorCategory(message) {
  const v = String(message || "").toLowerCase();
  if (v.includes("not configured")) return "credential_missing";
  if (v.includes("401") || v.includes("403")) return "unauthorized";
  if (v.includes("404")) return "model_not_found";
  if (v.includes("429")) return "rate_limited";
  if (v.includes("503")) return "upstream_unavailable";
  if (v.includes("timeout") || v.includes("aborted")) return "timeout";
  return "provider_error";
}

async function discoverGeminiModel(key) {
  if (cachedGeminiModel) return cachedGeminiModel;
  const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + key, { signal: AbortSignal.timeout(6000) });
  if (!r.ok) throw new Error("Gemini list " + r.status);
  const j = await r.json();
  const models = (j.models || []).filter(m => m.supportedGenerationMethods?.includes("generateContent"));
  const pick =
    models.find(m => /^models\/gemini-flash-latest$/.test(m.name)) ||
    models.find(m => /^models\/gemini-flash-lite-latest$/.test(m.name)) ||
    models.find(m => /flash-latest/.test(m.name)) ||
    models.find(m => /gemini.*flash/i.test(m.name) && !/2\.5-flash/.test(m.name) && !/preview/.test(m.name) && !/tts/.test(m.name) && !/image/.test(m.name)) ||
    models[0];
  if (!pick) throw new Error("Gemini: no model");
  cachedGeminiModel = pick.name.replace(/^models\//, "");
  return cachedGeminiModel;
}

async function tryGemini(prompt) {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!hasRealKey(key)) throw new Error("Gemini key not configured");
  const model = await discoverGeminiModel(key);
  const url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + key;
  const r = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    signal: AbortSignal.timeout(12000),
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.3, maxOutputTokens: 500 } }),
  });
  if (!r.ok) throw new Error("Gemini " + r.status + ": " + (await r.text()).slice(0, 100));
  const j = await r.json();
  const text = j.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini no text");
  return { text: text.trim(), provider: "gemini", model: model };
}

async function discoverOpenRouterModel(key) {
  const r = await fetch("https://openrouter.ai/api/v1/models", {
    headers: { authorization: "Bearer " + key },
    signal: AbortSignal.timeout(6000),
  });
  if (!r.ok) throw new Error("OpenRouter list " + r.status);
  const j = await r.json();
  const free = (j.data || [])
    .filter(m => parseFloat(m.pricing?.prompt || "1") === 0 && parseFloat(m.pricing?.completion || "1") === 0)
    .filter(m => !/(image|audio|embed|tts|whisper)/i.test(m.id))
    .sort((a, b) => {
      const score = id => /qwen|llama|mistral|gemma/i.test(id) ? 0 : 1;
      return score(a.id) - score(b.id);
    });
  if (!free.length) throw new Error("OpenRouter: no free models");
  return free;
}

async function tryOpenRouter(prompt) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!hasRealKey(key)) throw new Error("OpenRouter key not configured");

  const models = await discoverOpenRouterModel(key);
  let lastError = "no usable model";

  for (const model of models.slice(0, 12)) {
    try {
      const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "authorization": "Bearer " + key,
          "http-referer": "https://nia-evo-3-0.onrender.com",
          "x-title": "NIA Capital OS",
        },
        signal: AbortSignal.timeout(12000),
        body: JSON.stringify({
          model: model.id,
          messages: [{ role: "user", content: prompt }],
          max_tokens: 500,
          temperature: 0.3,
        }),
      });

      const body = await r.text();

      if (!r.ok) {
        lastError = model.id + " HTTP " + r.status;
        continue;
      }

      let j;
      try { j = JSON.parse(body); } catch {
        lastError = model.id + " invalid JSON";
        continue;
      }

      const text = j.choices?.[0]?.message?.content;
      if (typeof text === "string" && text.trim()) {
        return {
          text: text.trim(),
          provider: "openrouter",
          model: model.id,
        };
      }

      lastError = model.id + " returned no text";
    } catch (e) {
      lastError = model.id + ": " + e.message;
    }
  }

  throw new Error("OpenRouter exhausted: " + lastError);
}

async function tryHuggingFace(prompt) {
  const key = process.env.HF_TOKEN;
  if (!hasRealKey(key)) throw new Error("HF_TOKEN not configured");
  const r = await fetch("https://router.huggingface.co/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", "authorization": "Bearer " + key },
    signal: AbortSignal.timeout(12000),
    body: JSON.stringify({ model: "Qwen/Qwen2.5-72B-Instruct", messages: [{ role: "user", content: prompt }], max_tokens: 500, temperature: 0.3 }),
  });
  if (!r.ok) throw new Error("HF " + r.status);
  const j = await r.json();
  const text = j.choices?.[0]?.message?.content;
  if (!text) throw new Error("HF no text");
  return { text: text.trim(), provider: "huggingface", model: "Qwen2.5-72B" };
}

async function tryOpenAI(prompt) {
  const key = process.env.OPENAI_API_KEY;
  if (!hasRealKey(key)) throw new Error("OpenAI key not configured");
  const OpenAI = require("openai");
  const client = new OpenAI({ apiKey: key });
  const r = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 500,
    temperature: 0.3,
  });
  return { text: r.choices[0].message.content.trim(), provider: "openai", model: "gpt-4o-mini" };
}

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(label + " timeout")), ms)),
  ]);
}

async function generate(prompt, fallbackFn) {
  const errors = [];

  // Priority order: Gemini first, then OpenRouter, then HF, then OpenAI, then template
  const order = [];
  if (PROVIDERS.gemini) order.push("gemini");
  if (PROVIDERS.openrouter) order.push("openrouter");
  if (PROVIDERS.huggingface) order.push("huggingface");
  if (PROVIDERS.openai) order.push("openai");

  for (const provider of order) {
    try {
      let result;
      if (provider === "gemini") result = await tryGemini(prompt);
      else if (provider === "openrouter") result = await tryOpenRouter(prompt);
      else if (provider === "huggingface") result = await tryHuggingFace(prompt);
      else if (provider === "openai") result = await tryOpenAI(prompt);

      if (result && result.text) {
        return { text: result.text, generator: result.provider, provider: result.provider, model: result.model, fallback: false, errorCategory: null, errors };
      }
    } catch (e) {
      errors.push(provider + ": " + e.message);
    }
  }

  return { text: fallbackFn(), generator: "template", provider: null, model: null, fallback: true, errorCategory: "all_providers_unavailable", errors };
}

module.exports = { generate };
