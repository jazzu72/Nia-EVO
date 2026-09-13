// NIA LLM layer — auto-discovers working models from live APIs
// Never fails on a retired model name again

let cachedGeminiModel = null;
let cachedOpenRouterModel = null;

function hasRealKey(k){ return k && k.length > 20 && !/XXXXX|PLACEHOLDER|PASTE|_HERE/i.test(k); }

// ─── GEMINI ─────────────────────────────────────────────────
async function discoverGeminiModel(key) {
  if (cachedGeminiModel) return cachedGeminiModel;
  const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + key, { signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error("Gemini list " + r.status);
  const j = await r.json();
  const models = (j.models || []).filter(m => m.supportedGenerationMethods?.includes("generateContent") && m.name?.startsWith("models/gemini"));
  const pick =
    models.find(m => /^models\/gemini-flash-latest$/.test(m.name)) ||
    models.find(m => /^models\/gemini-flash-lite-latest$/.test(m.name)) ||
    models.find(m => /^models\/gemini-3\.5-flash$/.test(m.name)) ||
    models.find(m => /^models\/gemini-3\.6-flash$/.test(m.name)) ||
    models.find(m => /flash-latest/.test(m.name)) ||
    models.find(m => /gemini.*flash/i.test(m.name) && !/2\.5-flash/.test(m.name) && !/preview/.test(m.name) && !/tts/.test(m.name) && !/image/.test(m.name)) ||
    models[0];
  if (!pick) throw new Error("Gemini: no models");
  cachedGeminiModel = pick.name.replace(/^models\//, "");
  console.log("[llm] Gemini classic model:", cachedGeminiModel);
  return cachedGeminiModel;
}

async function tryGemini(prompt) {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GOOGLE_API_KEY;
  if (!hasRealKey(key)) throw new Error("Gemini key not configured");
  const model = await discoverGeminiModel(key);
  const url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + key;
  const r = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    signal: AbortSignal.timeout(8000),
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.3, maxOutputTokens: 500 } }),
  });
  if (!r.ok) { const err = await r.text(); cachedGeminiModel = null; throw new Error("Gemini " + r.status + ": " + err.slice(0,150)); }
  const j = await r.json();
  const text = j.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no text");
  return text.trim();
}

// ─── OPENROUTER ─────────────────────────────────────────────
async function discoverOpenRouterModel(key) {
  if (cachedOpenRouterModel) return cachedOpenRouterModel;
  const r = await fetch("https://openrouter.ai/api/v1/models", { signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error(`OpenRouter list ${r.status}`);
  const j = await r.json();
  const freeModels = (j.data || []).filter(m => {
    const p = m.pricing || {};
    return parseFloat(p.prompt || "1") === 0 && parseFloat(p.completion || "1") === 0;
  });
  if (!freeModels.length) throw new Error("OpenRouter: no free models listed");
  // Prefer larger models; fallback to first
  freeModels.sort((a, b) => (parseInt((b.id.match(/(\d+)b/i)||[0,0])[1]) || 0) - (parseInt((a.id.match(/(\d+)b/i)||[0,0])[1]) || 0));
  cachedOpenRouterModel = freeModels[0].id;
  console.log("[llm] OpenRouter free model discovered:", cachedOpenRouterModel);
  return cachedOpenRouterModel;
}

async function tryOpenRouter(prompt) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!hasRealKey(key)) throw new Error("OPENROUTER_API_KEY not configured");
  const model = await discoverOpenRouterModel(key);
  const r = await fetch("https://openrouter.ai/api/v1/chat/completions", { signal: AbortSignal.timeout(8000),
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": `Bearer ${key}`,
      "http-referer": "https://nia-capital-os.onrender.com",
      "x-title": "NIA Capital OS",
    },
    body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], max_tokens: 500, temperature: 0.3 }),
  });
  if (!r.ok) {
    const err = await r.text();
    cachedOpenRouterModel = null;
    throw new Error(`OpenRouter[${model}] ${r.status}: ${err.slice(0,150)}`);
  }
  const j = await r.json();
  const text = j.choices?.[0]?.message?.content;
  if (!text) throw new Error("OpenRouter returned no text");
  return `[${model}]\n${text.trim()}`;
}

// ─── HUGGINGFACE ────────────────────────────────────────────
async function tryHuggingFace(prompt) {
  const key = process.env.HF_TOKEN || process.env.HUGGINGFACE_TOKEN;
  if (!hasRealKey(key)) throw new Error("HF_TOKEN not configured");
  const r = await fetch("https://router.huggingface.co/v1/chat/completions", { signal: AbortSignal.timeout(8000),
    method: "POST",
    headers: { "content-type": "application/json", "authorization": `Bearer ${key}` },
    body: JSON.stringify({ model: "Qwen/Qwen2.5-72B-Instruct", messages: [{ role: "user", content: prompt }], max_tokens: 500, temperature: 0.3 }),
  });
  if (!r.ok) throw new Error(`HF ${r.status}: ${(await r.text()).slice(0,150)}`);
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
  for (const p of ["gemini", "openrouter", "huggingface", "openai", "template"]) {
    try {
      let text;
      if (p === "gemini") text = await tryGemini(prompt);
      else if (p === "openrouter") text = await tryOpenRouter(prompt);
      else if (p === "huggingface") text = await tryHuggingFace(prompt);
      else if (p === "openai") text = await tryOpenAI(prompt);
      else text = fallbackFn();
      return { text, generator: p === "template" ? "template" : p, errors };
    } catch (e) {
      errors.push(`${p}: ${e.message}`);
    }
  }
  return { text: fallbackFn(), generator: "template", errors };
}

module.exports = { generate };
