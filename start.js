// Wrapper: attempt to load encrypted secrets, then boot the server.
// If secrets fail, fall back to environment variables set on Render.
(async () => {
  try {
    await require("./tools/load-secrets").loadSecrets();
  } catch (e) {
    console.warn("⚠️  Secret load failed — continuing with env vars:", e.message);
  }
  require("./server-watson.js");
})().catch(e => { console.error("❌ Fatal:", e); process.exit(1); });
