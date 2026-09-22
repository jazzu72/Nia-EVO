/* NIA VOICE CLIENT — ElevenLabs Conversational AI */
(function () {
  let conversation = null;
  let active = false;

  function getToken() { return localStorage.getItem("nia-owner-token"); }

  async function fetchSession() {
    const token = getToken();
    if (!token) throw new Error("No owner token");
    const r = await fetch("/api/owner/voice/session", {
      method: "POST",
      headers: { "authorization": "Bearer " + token },
    });
    if (!r.ok) throw new Error("Session HTTP " + r.status);
    return r.json();
  }

  async function start() {
    if (active) return stop();
    const btn = document.getElementById("voice-btn");
    if (btn) btn.textContent = "◉";

    try {
      const session = await fetchSession();
      if (!session.ok) throw new Error(session.error || "session failed");

      if (!window.__ElevenClient) {
        const mod = await import("https://esm.sh/@elevenlabs/client@latest");
        window.__ElevenClient = mod.Conversation;
      }

      conversation = await window.__ElevenClient.startSession({
        signedUrl: session.signed_url,
        onConnect: () => { active = true; if (btn) { btn.textContent = "◼"; btn.classList.add("active"); } },
        onDisconnect: () => { active = false; if (btn) { btn.textContent = "🎙"; btn.classList.remove("active"); } },
        onError: (err) => {
          console.error("[voice]", err);
          if (btn) btn.textContent = "🎙";
          active = false;
          if (window.addMsg) window.addMsg("Voice error: " + (err?.message || err), "nia error");
        },
        onMessage: (msg) => {
          const text = msg?.message || msg?.text || "";
          const source = msg?.source || "ai";
          if (window.addMsg && text) window.addMsg(text, source === "user" ? "user" : "nia", source === "ai" ? "VOICE" : null);
        },
      });
    } catch (e) {
      console.error("[voice]", e);
      if (window.addMsg) window.addMsg("Voice unavailable: " + e.message, "nia error");
      const btn = document.getElementById("voice-btn");
      if (btn) btn.textContent = "🎙";
    }
  }

  async function stop() {
    if (conversation) { try { await conversation.endSession(); } catch (e) {} conversation = null; }
    active = false;
    const btn = document.getElementById("voice-btn");
    if (btn) { btn.textContent = "🎙"; btn.classList.remove("active"); }
  }

  window.niaVoice = { start, stop, isActive: () => active };
})();
