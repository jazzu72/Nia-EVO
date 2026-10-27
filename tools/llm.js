"use strict";

/*

* NIA LLM ROUTER — CLEAN REPLACEMENT
* Provider keys are read at request time, after startup secret loading.
* Providers run in priority order; template fallback is last.
* Never logs or returns API keys.
  */

function hasRealKey(value) {
return typeof value === "string" &&
value.length > 20 &&
!/XXXXX|PLACEHOLDER|PASTE|_HERE/i.test(value);
}


function errorCategory(message) {
const value = String(message || "").toLowerCase();
if (value.includes("not configured")) return "credential_missing";
if (value.includes("401") || value.includes("403")) return "unauthorized";
if (value.includes("404")) return "model_not_found";
if (value.includes("429")) return "rate_limited";
if (value.includes("503") || value.includes("502") || value.includes("504")) return "upstream_unavailable";
if (value.includes("timeout") || value.includes("aborted")) return "timeout";
return "provider_error";
}

async function fetchWithTimeout(url, options, timeoutMs) {
const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), timeoutMs);
try {
return await fetch(url, { ...options, signal: controller.signal });
} finally {
clearTimeout(timer);
}
}

async function readJson(response, provider) {
if (!response.ok) {
// Do not expose raw provider response bodies, which may contain sensitive data.
throw new Error(provider + " HTTP " + response.status);
}
return response.json();
}

async function tryGemini(prompt) {
const key =
process.env.GEMINI_API_KEY ||
process.env.GOOGLE_AI_STUDIO_API_KEY ||
process.env.GOOGLE_API_KEY;

if (!hasRealKey(key)) throw new Error("Gemini key not configured");

const models = [
"gemini-flash-latest",
"gemini-2.5-flash",
"gemini-2.5-flash-lite",
"gemini-flash-lite-latest"
];
let lastError;

for (const model of models) {
try {
const response = await fetchWithTimeout(
"https://generativelanguage.googleapis.com/v1beta/models/" +
model + ":generateContent?key=" + encodeURIComponent(key),
{
method: "POST",
headers: { "content-type": "application/json" },
body: JSON.stringify({
contents: [{ parts: [{ text: String(prompt) }] }],
generationConfig: { temperature: 0.3, maxOutputTokens: 800 }
})
},
30000
);

  if (response.status === 404) {
    lastError = new Error("Gemini model unavailable");
    continue;
  }

  const data = await readJson(response, "Gemini");
  const text = data.candidates?.[0]?.content?.parts
    ?.map(part => part.text || "")
    .join("")
    .trim();

  if (text) return { text, provider: "gemini", model };
  lastError = new Error("Gemini returned no text");
} catch (error) {
  lastError = error;
  const message = String(error.message || "");
  if (/HTTP (401|403)/.test(message)) break;
}

}

throw lastError || new Error("Gemini unavailable");
}

async function tryOpenAI(prompt) {
const key = process.env.OPENAI_API_KEY;
if (!hasRealKey(key)) throw new Error("OpenAI key not configured");

const response = await fetchWithTimeout(
"https://api.openai.com/v1/chat/completions",
{
method: "POST",
headers: {
"content-type": "application/json",
authorization: "Bearer " + key
},
body: JSON.stringify({
model: process.env.NIA_OPENAI_MODEL || "gpt-4o-mini",
messages: [{ role: "user", content: String(prompt) }],
max_tokens: 500,
temperature: 0.3
})
},
30000
);

const data = await readJson(response, "OpenAI");
const text = data.choices?.[0]?.message?.content?.trim();
if (!text) throw new Error("OpenAI returned no text");

return {
text,
provider: "openai",
model: process.env.NIA_OPENAI_MODEL || "gpt-4o-mini"
};
}

async function tryOpenRouter(prompt) {
const key = process.env.OPENROUTER_API_KEY;
if (!hasRealKey(key)) throw new Error("OpenRouter key not configured");

const model = process.env.NIA_OPENROUTER_MODEL || "openai/gpt-4o-mini";
const response = await fetchWithTimeout(
"https://openrouter.ai/api/v1/chat/completions",
{
method: "POST",
headers: {
"content-type": "application/json",
authorization: "Bearer " + key
},
body: JSON.stringify({
model,
messages: [{ role: "user", content: String(prompt) }],
max_tokens: 500,
temperature: 0.3
})
},
30000
);

const data = await readJson(response, "OpenRouter");
const text = data.choices?.[0]?.message?.content?.trim();
if (!text) throw new Error("OpenRouter returned no text");

return { text, provider: "openrouter", model };
}

async function tryHuggingFace(prompt) {
const key = process.env.HF_TOKEN;
if (!hasRealKey(key)) throw new Error("HF_TOKEN not configured");

const response = await fetchWithTimeout(
"https://router.huggingface.co/v1/chat/completions",
{
method: "POST",
headers: {
"content-type": "application/json",
authorization: "Bearer " + key
},
body: JSON.stringify({
model: process.env.NIA_HF_MODEL || "Qwen/Qwen2.5-72B-Instruct",
messages: [{ role: "user", content: String(prompt) }],
max_tokens: 500,
temperature: 0.3
})
},
15000
);

const data = await readJson(response, "HuggingFace");
const text = data.choices?.[0]?.message?.content?.trim();
if (!text) throw new Error("HuggingFace returned no text");

return {
text,
provider: "huggingface",
model: process.env.NIA_HF_MODEL || "Qwen/Qwen2.5-72B-Instruct"
};
}

async function generate(prompt, fallbackFn) {
const providers = [
["gemini", tryGemini, hasRealKey(
process.env.GEMINI_API_KEY ||
process.env.GOOGLE_AI_STUDIO_API_KEY ||
process.env.GOOGLE_API_KEY
)],
["openrouter", tryOpenRouter,
hasRealKey(process.env.OPENROUTER_API_KEY) &&
process.env.NIA_ENABLE_OPENROUTER !== "false"],
["huggingface", tryHuggingFace, hasRealKey(process.env.HF_TOKEN)],
["openai", tryOpenAI, hasRealKey(process.env.OPENAI_API_KEY)]
];

const errors = [];

for (const [name, run, enabled] of providers) {
if (!enabled) continue;

try {
  const result = await run(prompt);
  if (result && typeof result.text === "string" && result.text.trim()) {
    return {
      text: result.text.trim(),
      generator: result.provider,
      provider: result.provider,
      model: result.model,
      fallback: false,
      errorCategory: null,
      errors
    };
  }
  errors.push(name + ": empty response");
} catch (error) {
  const category = errorCategory(error.message);
  errors.push(name + ": " + category);
}

}

let fallbackText;
try {
fallbackText = typeof fallbackFn === "function"
? fallbackFn()
: "An AI provider is unavailable. Please try again shortly.";
} catch (_) {
fallbackText = "An AI provider is unavailable. Please try again shortly.";
}

return {
text: String(fallbackText),
generator: "template",
provider: null,
model: null,
fallback: true,
errorCategory: errors.length ? "all_providers_unavailable" : "credential_missing",
errors
};
}

module.exports = { generate };
