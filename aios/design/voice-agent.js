const ELEVEN_BASE = "https://api.elevenlabs.io/v1";
const agentId = () => process.env.ELEVENLABS_AGENT_ID || "agent_5801k3vc89hqenaszpyprrc7k53q";
const getKey = () => process.env.ELEVENLABS_API_KEY || "";
async function getAgentConfig() {
  if (!getKey()) throw new Error("ELEVENLABS_API_KEY_NOT_LOADED");
  const r = await fetch(`${ELEVEN_BASE}/convai/agents/${agentId()}`, {headers: {"xi-api-key": getKey()}, signal: AbortSignal.timeout(8000)});
  if (!r.ok) throw new Error(`agent_config ${r.status}`);
  return r.json();
}
async function getSignedUrl() {
  if (!getKey()) throw new Error("ELEVENLABS_API_KEY_NOT_LOADED");
  const r = await fetch(`${ELEVEN_BASE}/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agentId())}`, {headers: {"xi-api-key": getKey()}, signal: AbortSignal.timeout(8000)});
  if (!r.ok) throw new Error(`signed_url ${r.status}`);
  return (await r.json()).signed_url;
}
async function buildNiaContext() {
  const ctx = {capital: null, autonomy: "unknown"};
  try {
    const engine = require("../capital/parallel-capital-engine");
    const sources = await engine.getLiveCapitalSources();
    const result = await engine.discover(sources);
    ctx.capital = {opportunities: result.summary.total_opportunities, total: result.summary.total_amount, by_lane: result.summary.by_lane};
  } catch {}
  try { ctx.autonomy = require("../../tools/autonomy-gate").loadConfig().mode; } catch {}
  return ctx;
}
module.exports = {getAgentConfig, getSignedUrl, buildNiaContext, agentId};
