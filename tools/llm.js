// Unified LLM layer — provider chain with fallbacks
// Order: HuggingFace → OpenRouter → Gemini → OpenAI → template
const PROVIDERS = ["huggingface", "openrouter", "gemini", "openai", "template"];

function hasRealKey(k){ return k && k.length > 20 && !/XXXXX|PLACEHOLDER|PASTE/i.test(k); }

async function tryHuggingFace(prompt){
  const key = process.env.HF_TOKEN || process.env.HUGGINGFACE_TOKEN;
  if (!hasRealKey(key)) throw new Error("HF_TOKEN not configured");
  // Uses HF's OpenAI-compatible router with Qwen (fast, free-tier available)
  const url = "https://router.huggingface.co/v1/chat/completions";
  const r = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "Qwen/Qwen2.5-72B-Instruct",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.3,
    }),
  });
  if (!r.ok) throw new Error(`HF ${r.status}: ${(await r.text()).slice(0,200)}`);
  const j = await r.json();
  const text = j.choices?.[0]?.message?.content;
  if (!text) throw new Error("HF returned no text");
  return text.trim();
}

async function tryOpenRouter(prompt){
  const key = process.env.OPENROUTER_API_KEY;
  if (!hasRealKey(key)) throw new Error("OPENROUTER_API_KEY not configured");
  // Free model, no credit card required
  const url = "https://openrouter.ai/api/v1/chat/completions";
  const r = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": `Bearer ${key}`,
      "http-referer": "https://nia-capital-os.onrender.com",
      "x-title": "NIA Capital OS",
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3.3-70b-instruct:free",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.3,
    }),
  });
  if (!r.ok) throw new Error(`OpenRouter ${r.status}: ${(await r.text()).slice(0,200)}`);
  const j = await r.json();
  const text = j.choices?.[0]?.message?.content;
  if (!text) throw new Error("OpenRouter returned no text");
  return text.trim();
}

async function tryGemini(prompt){
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_STUDIO_API_KEY;
  if (!hasRealKey(key)) throw new Error("Gemini key not configured");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 500 },
    }),
  });
  if (!r.ok) throw new Error(`Gemini ${r.status}: ${(await r.text()).slice(0,200)}`);
  const j = await r.json();
  const text = j.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no text");
  return text.trim();
}

async function tryOpenAI(prompt){
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

async function generate(prompt, fallbackFn){
  const errors = [];
  for (const p of PROVIDERS) {
    try {
      let text;
      if (p === "huggingface") text = await tryHuggingFace(prompt);
      else if (p === "openrouter") text = await tryOpenRouter(prompt);
      else if (p === "gemini") text = await tryGemini(prompt);
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
