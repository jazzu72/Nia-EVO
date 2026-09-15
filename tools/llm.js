// NIA LLM layer — feature-flagged provider chain with structured errors
// Provider order: openrouter → huggingface → openai → gemini → template
// Enable providers via env vars: NIA_ENABLE_GEMINI, NIA_ENABLE_HUGGINGFACE, NIA_ENABLE_OPENAI
// OpenRouter is enabled by default unless NIA_ENABLE_OPENROUTER=false

let cachedGeminiModel = null;
let cachedOpenRouterModel = null;

function hasRealKey(k) {
  return k && k.length > 20 && !/XXXXX|PLACEHOLDER|PASTE|_HERE/i.test(k);
}

const PROVIDERS = {
  gemini: process.env.NIA_ENABLE_GEMINI === "true" || (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 20),
  openrouter: process.env.NIA_ENABLE_OPENROUTER !== "false" && !!process.env.OPENROUTER_API_KEY,
  huggingface: process.env.NIA_ENABLE_HUGGINGFACE === "true",
  openai: process.env.NIA_ENABLE_OPENAI === "true",
};

function enabledProviderOrder() {
  const order = [];
  if (PROVIDERS.gemini) order.push("gemini");
  if (PROVIDERS.openrouter) order.push("openrouter");
  if (PROVIDERS.huggingface) order.push("huggingface");
  if (PROVIDERS.openai) order.push("openai");
  order.push("template");
  return order;
}

function errorCategory(message = "") {
  const value = String(message).toLowerCase();
  if (value.includes("not configured")) return "credential_missing";
  if (value.includes("401") || value.includes("403")) return "unauthorized";
  if (value.includes("404")) return "model_not_found";
  if (value.includes("429")) return "rate_limited";
  if (value.includes("503")) return "upstream_unavailable";
  if (value.includes("timeout") || value.includes("aborted")) return "timeout";
  return "provider_error";
}

// ─── GEMINI ─────────────────────────────────────────────────
async function discoverGeminiModel(key) {
  if (cachedGeminiModel) return cachedGeminiModel;
  const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + key, { signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error("Gemini list " + r.status);
  const j = await r.json();
  const models = (j.models || []).filter(m => m.supportedGenerationMethods?.includes("generateContent"));
  const pick =
    models.find(m => /^models\/gemini-flash-latest$/.test(m.name)) ||
    models.find(m => /^models\/gemini-flash-lite-latest$/.test(m.name)) ||
    models.find(m => /flash-latest/.test(m.name)) ||
    models.find(m => /gemini.*flash/i.test(m.name) && !/2\.5-flash/.test(m.name) && !/preview/.test(m.name) && !/tts/.test(m.name) && !/image/.test(m.name)) ||
    models[0];
  if (!pick) throw new Error("Gemini: no generateContent model available");
  cachedGeminiModel = pick.name.replace(/^models\//, "");
  console.log("[llm] Gemini model selected:", cachedGeminiModel);
  return cachedGeminiModel;
}

async function tryGemini(prompt) {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GOOGLE_API_KEY;
  if (!hasRealKey(key)) throw new Error("Gemini key not configured");
  const model = await discoverGeminiModel(key);
  const url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + key;
  const body = JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.3, maxOutputTokens: 500 } });

  for (let attempt = 1; attempt <= 3; attempt++) {
    const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, signal: AbortSignal.timeout(45000), body });
    if (r.ok) {
      const j = await r.json();
      const text = j.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text.trim();
    }
    const errText = await r.text();
    if (r.status === 503 && attempt < 3) {
      const wait = attempt * 2000;
      console.log("[llm] Gemini 503, retrying in " + wait + "ms (attempt " + attempt + "/3)");
      await new Promise(rs => setTimeout(rs, wait));
      continue;
    }
    throw new Error("Gemini " + r.status + " (attempt " + attempt + "): " + errText.slice(0, 150));
  }
  throw new Error("Gemini: all retries failed");
}

// ─── OPENROUTER ─────────────────────────────────────────────
async function discoverOpenRouterModel(key) {
  if (cachedOpenRouterModel) return cachedOpenRouterModel;
  const r = await fetch("https://openrouter.ai/api/v1/models", { signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error("OpenRouter list " + r.status);
  const j = await r.json();
  const freeModels = (j.data || []).filter(m => {
    const p = m.pricing || {};
    return parseFloat(p.prompt || "1") === 0 && parseFloat(p.completion || "1") === 0;
  });
  if (!freeModels.length) throw new Error("OpenRouter: no free models");

  const sizeOf = (id) => {
    const m = id.match(/(\d+(?:\.\d+)?)b/i);
    return m ? parseFloat(m[1]) : 999;
  };
  const usable = freeModels.filter(m => sizeOf(m.id) >= 7 && sizeOf(m.id) <= 70);
  const anyUsable = usable.length ? usable : freeModels.filter(m => sizeOf(m.id) >= 7);
  cachedOpenRouterModel = (anyUsable[0] || freeModels[0]).id;
  console.log("[llm] OpenRouter model selected:", cachedOpenRouterModel, "(size " + sizeOf(cachedOpenRouterModel) + "B)");
  return cachedOpenRouterModel;
}

async function tryOpenRouter(prompt) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!hasRealKey(key)) throw new Error("OPENROUTER_API_KEY not configured");
  const model = await discoverOpenRouterModel(key);
  const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": "Bearer " + key,
      "http-referer": "https://nia-capital-os.onrender.com",
      "x-title": "NIA Capital OS",
    },
    signal: AbortSignal.timeout(25000),
    body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], max_tokens: 500, temperature: 0.3 }),
  });
  if (!r.ok) {
    const err = await r.text();
    cachedOpenRouterModel = null;
    throw new Error("OpenRouter[" + model + "] " + r.status + ": " + err.slice(0, 150));
  }
  const j = await r.json();
  const text = j.choices?.[0]?.message?.content;
  if (!text) throw new Error("OpenRouter returned no text");
  return "[" + model + "]\n" + text.trim();
}

// ─── HUGGINGFACE ────────────────────────────────────────────
async function tryHuggingFace(prompt) {
  const key = process.env.HF_TOKEN || process.env.HUGGINGFACE_TOKEN;
  if (!hasRealKey(key)) throw new Error("HF_TOKEN not configured");
  const r = await fetch("https://router.huggingface.co/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", "authorization": "Bearer " + key },
    signal: AbortSignal.timeout(15000),
    body: JSON.stringify({ model: "Qwen/Qwen2.5-72B-Instruct", messages: [{ role: "user", content: prompt }], max_tokens: 500, temperature: 0.3 }),
  });
  if (!r.ok) throw new Error("HF " + r.status + ": " + (await r.text()).slice(0, 150));
  const j = await r.json();
  const text = j.choices?.[0]?.message?.content;
  if (!text) throw new Error("HF returned no text");
  return text.trim();
}

// ─── OPENAI ─────────────────────────────────────────────────
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
  return r.choices[0].message.content.trim();
}

// ─── ORCHESTRATOR ───────────────────────────────────────────
async function generate(prompt, fallbackFn) {
  const errors = [];

  for (const provider of enabledProviderOrder()) {
    try {
      if (provider === "openrouter") {
        const text = await tryOpenRouter(prompt);
        return { text, generator: "openrouter", provider: "openrouter", model: cachedOpenRouterModel || null, fallback: false, errorCategory: null, errors };
      }
      if (provider === "huggingface") {
        const text = await tryHuggingFace(prompt);
        return { text, generator: "huggingface", provider: "huggingface", model: "Qwen/Qwen2.5-72B-Instruct", fallback: false, errorCategory: null, errors };
      }
      if (provider === "openai") {
        const text = await tryOpenAI(prompt);
        return { text, generator: "openai", provider: "openai", model: "gpt-4o-mini", fallback: false, errorCategory: null, errors };
      }
      if (provider === "gemini") {
        const text = await tryGemini(prompt);
        return { text, generator: "gemini", provider: "gemini", model: cachedGeminiModel || null, fallback: false, errorCategory: null, errors };
      }
      return {
        text: fallbackFn(),
        generator: "template",
        provider: null,
        model: null,
        fallback: true,
        errorCategory: errors.length ? errorCategory(errors[0]) : "template_selected",
        errors,
      };
    } catch (error) {
      const message = provider + ": " + (error?.message || "unknown error");
      errors.push(message);
      console.log(JSON.stringify({
        component: "nia-llm",
        event: "provider_failed",
        provider,
        errorCategory: errorCategory(error?.message),
      }));
    }
  }

  return { text: fallbackFn(), generator: "template", provider: null, model: null, fallback: true, errorCategory: "all_providers_unavailable", errors };
}

module.exports = { generate };
