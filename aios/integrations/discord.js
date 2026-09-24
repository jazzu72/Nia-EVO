const DISCORD_API = "https://discord.com/api/v10";

function config() {
  return {
    token: process.env.DISCORD_BOT_TOKEN || "",
    applicationId: process.env.DISCORD_APPLICATION_ID || "",
    guildId: process.env.DISCORD_GUILD_ID || "",
    ownerUserId: process.env.DISCORD_OWNER_USER_ID || "",
  };
}

function headers() {
  const { token } = config();
  if (!token) throw new Error("DISCORD_BOT_TOKEN_NOT_LOADED");
  return {
    Authorization: `Bot ${token}`,
    "Content-Type": "application/json",
  };
}

async function discord(path, options = {}) {
  const r = await fetch(`${DISCORD_API}${path}`, {
    ...options,
    headers: { ...headers(), ...(options.headers || {}) },
    signal: AbortSignal.timeout(10000),
  });

  const text = await r.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }

  if (!r.ok) throw new Error(`Discord ${r.status}: ${text.slice(0, 200)}`);
  return body;
}

async function status() {
  const me = await discord("/users/@me");
  return {
    ok: true,
    connected: true,
    bot_id: me.id,
    username: me.username,
    application_id: config().applicationId || null,
    guild_id: config().guildId || null,
    owner_configured: Boolean(config().ownerUserId),
  };
}

async function sendMessage(channelId, content) {
  if (!channelId) throw new Error("DISCORD_CHANNEL_ID_REQUIRED");
  return discord(`/channels/${channelId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

module.exports = { config, status, sendMessage };
