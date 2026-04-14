// config/env.js
// ╔══════════════════════════════════════════════════════════════╗
// ║  NIA-EVO  ·  Environment Configuration & Validation         ║
// ║  Fail fast on bad config — never deploy with missing keys    ║
// ╚══════════════════════════════════════════════════════════════╝
"use strict";

require("dotenv").config();

// ── Variable definitions ──────────────────────────────────────────
// required: true  → process exits if missing or placeholder
// required: false → warn only
const SCHEMA = [
  // AI
  { key: "OPENAI_API_KEY",      required: true,  type: "string",  secret: true,
    validate: v => v !== "YOUR_OPENAI_KEY_HERE" && v.startsWith("sk-"),
    hint: "Get from https://platform.openai.com/api-keys" },

  // Server
  { key: "PORT",                required: false, type: "number",  default: 4000,
    validate: v => v >= 1024 && v <= 65535 },
  { key: "NODE_ENV",            required: false, type: "string",  default: "development",
    validate: v => ["development", "staging", "production"].includes(v) },
  { key: "LOG_LEVEL",           required: false, type: "string",  default: "info",
    validate: v => ["error", "warn", "info", "debug"].includes(v) },

  // Vault
  { key: "VAULT_INITIAL_BALANCE", required: false, type: "number", default: 10_000_000,
    validate: v => v > 0 },
  { key: "VAULT_MAX_PER_DEAL",    required: false, type: "number", default: 500_000 },
  { key: "VAULT_MAX_TOTAL",       required: false, type: "number", default: 5_000_000 },

  // Security
  { key: "API_SECRET",          required: false, type: "string",  secret: true,
    hint: "Random 32+ char string for request signing" },
  { key: "RATE_LIMIT_MAX",      required: false, type: "number",  default: 60 },
  { key: "RATE_LIMIT_WINDOW_MS",required: false, type: "number",  default: 60_000 },

  // Data services
  { key: "CENSUS_API_KEY",      required: false, type: "string",  secret: true,
    hint: "https://api.census.gov/data/key_signup.html — improves market data quality" },

  // Monitoring
  { key: "MONITOR_PORT",        required: false, type: "number",  default: 4001 },
  { key: "ALERT_WEBHOOK_URL",   required: false, type: "string",
    hint: "Slack/Discord webhook for system alerts" },
];

// ── Validation ────────────────────────────────────────────────────
function loadAndValidate() {
  const config  = {};
  const errors  = [];
  const warnings = [];

  for (const def of SCHEMA) {
    let raw = process.env[def.key];

    // Apply default if not set
    if (raw === undefined || raw === "") {
      if (def.default !== undefined) {
        raw = String(def.default);
      } else if (def.required) {
        errors.push(`[MISSING] ${def.key}${def.hint ? ` — ${def.hint}` : ""}`);
        continue;
      } else {
        warnings.push(`[OPTIONAL] ${def.key} not set`);
        continue;
      }
    }

    // Type coercion
    let value;
    if (def.type === "number") {
      value = Number(raw);
      if (isNaN(value)) { errors.push(`[INVALID] ${def.key} must be a number, got: ${raw}`); continue; }
    } else if (def.type === "boolean") {
      value = raw.toLowerCase() === "true";
    } else {
      value = raw;
    }

    // Custom validation
    if (def.validate && !def.validate(value)) {
      const msg = `[INVALID] ${def.key}${def.hint ? ` — ${def.hint}` : ""}`;
      if (def.required) { errors.push(msg); continue; }
      else warnings.push(msg);
    }

    config[def.key] = value;
  }

  // ── Report ──────────────────────────────────────────────────────
  if (warnings.length > 0) {
    console.warn("\n⚠️  Config warnings:");
    warnings.forEach(w => console.warn(`   ${w}`));
  }

  if (errors.length > 0) {
    console.error("\n❌ Config errors — cannot start:");
    errors.forEach(e => console.error(`   ${e}`));
    console.error("\nFix .env and restart.\n");
    process.exit(1);
  }

  return config;
}

// ── Singleton config object ───────────────────────────────────────
const config = loadAndValidate();

module.exports = {
  // Server
  PORT:              config.PORT             || 4000,
  NODE_ENV:          config.NODE_ENV         || "development",
  IS_PRODUCTION:     (config.NODE_ENV        || "") === "production",
  IS_DEVELOPMENT:    (config.NODE_ENV        || "development") === "development",
  LOG_LEVEL:         config.LOG_LEVEL        || "info",

  // AI
  OPENAI_API_KEY:    config.OPENAI_API_KEY   || null,
  AI_MODEL:          "gpt-4.1-mini",
  AI_MAX_TOKENS:     1000,

  // Vault
  VAULT_INITIAL_BALANCE: config.VAULT_INITIAL_BALANCE || 10_000_000,
  VAULT_MAX_PER_DEAL:    config.VAULT_MAX_PER_DEAL    || 500_000,
  VAULT_MAX_TOTAL:       config.VAULT_MAX_TOTAL       || 5_000_000,

  // Security
  API_SECRET:           config.API_SECRET          || null,
  RATE_LIMIT_MAX:       config.RATE_LIMIT_MAX       || 60,
  RATE_LIMIT_WINDOW_MS: config.RATE_LIMIT_WINDOW_MS || 60_000,

  // Data
  CENSUS_API_KEY:    config.CENSUS_API_KEY   || null,

  // Monitoring
  MONITOR_PORT:      config.MONITOR_PORT     || 4001,
  ALERT_WEBHOOK_URL: config.ALERT_WEBHOOK_URL || null,
};
