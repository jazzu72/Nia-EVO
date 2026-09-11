// Wrapper: load encrypted secrets, then boot server-watson.js
(async () => {
  try {
    await require("./tools/load-secrets").loadSecrets();
  } catch (e) {
    console.error("❌ Secret load failed:", e.message);
    process.exit(1);
  }
  // Secrets now in process.env — safe to require the real server
  require("./server-watson.js");
})().catch(e => { console.error("❌ Fatal:", e); process.exit(1); });
