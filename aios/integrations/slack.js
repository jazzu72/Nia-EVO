const SLACK_API = "https://slack.com/api";

function token() {
  return process.env.SLACK_BOT_TOKEN || process.env.SLACK_TOKEN || "";
}

async function slack(method, body = {}) {
  const t = token();
  if (!t) throw new Error("SLACK_BOT_TOKEN_NOT_LOADED");

  const r = await fetch(`${SLACK_API}/${method}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${t}`,
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000)
  });

  const data = await r.json();
  if (!data.ok) throw new Error(`Slack ${method}: ${data.error || "request_failed"}`);
  return data;
}

async function status() {
  const data = await slack("auth.test");
  return {
    ok: true,
    connected: true,
    team_id: data.team_id || null,
    team: data.team || null,
    bot_user_id: data.user_id || null,
    url: data.url || null
  };
}

async function sendMessage(channel, text) {
  if (!channel) throw new Error("SLACK_CHANNEL_REQUIRED");
  if (!text) throw new Error("SLACK_MESSAGE_REQUIRED");
  const data = await slack("chat.postMessage", { channel, text });
  return { ok: true, channel: data.channel, timestamp: data.ts };
}

module.exports = { status, sendMessage };
