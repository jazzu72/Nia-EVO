// Autonomy Gate — checks if an action is permitted under the current tier
const fs = require("fs");
const path = require("path");

const CONFIG_PATH = process.env.AUTONOMY_CONFIG || "config/autonomy.json";
let config = null;

function loadConfig(){
  if (config) return config;
  try { config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8")); }
  catch (e) { config = { mode: "LOCKED", tiers: {}, reason: "config missing" }; }
  return config;
}

function findTierForAction(action){
  const c = loadConfig();
  for (const [tierName, tier] of Object.entries(c.tiers || {})) {
    if (tier.enabled && Array.isArray(tier.actions) && tier.actions.includes(action)) {
      return { tier: tierName, ...tier };
    }
  }
  for (const [tierName, tier] of Object.entries(c.tiers || {})) {
    if (Array.isArray(tier.blocked_actions) && tier.blocked_actions.includes(action)) {
      return { tier: tierName, blocked: true, ...tier };
    }
  }
  return null;
}

function isAllowed(action){
  const tier = findTierForAction(action);
  if (!tier) return { allowed: false, reason: "action not recognized", action };
  if (tier.blocked) return { allowed: false, reason: tier.reason || "blocked by policy", action, tier: tier.tier };
  if (tier.requires_owner_click_to_send) {
    return { allowed: true, action, tier: tier.tier, requiresOwnerClick: true };
  }
  return { allowed: true, action, tier: tier.tier };
}

function auditLog(action, decision, actor = "nia"){
  const entry = {
    ts: new Date().toISOString(),
    action,
    actor,
    allowed: decision.allowed,
    tier: decision.tier || null,
    reason: decision.reason || null,
    requiresOwnerClick: decision.requiresOwnerClick || false,
  };
  try {
    const logPath = path.join("runtime", "autonomy-audit.log");
    fs.mkdirSync("runtime", { recursive: true });
    fs.appendFileSync(logPath, JSON.stringify(entry) + "\n");
  } catch {}
  return entry;
}

module.exports = { loadConfig, isAllowed, auditLog, findTierForAction };
