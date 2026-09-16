/* NIA CHAT — frontend */
(function () {
  const TOKEN_KEY = "nia-owner-token";
  const messagesEl = document.getElementById("messages");
  const inputEl = document.getElementById("input");
  const sendEl = document.getElementById("send");
  const statusEl = document.getElementById("status");
  const clearEl = document.getElementById("clear");

  // Try to get token: prompt once, save to sessionStorage
  function getToken() {
    let t = sessionStorage.getItem(TOKEN_KEY);
    if (!t) {
      t = prompt("Enter your owner token (NIA_OWNER_...):");
      if (t) sessionStorage.setItem(TOKEN_KEY, t.trim());
    }
    return t ? t.trim() : null;
  }

  async function healthCheck() {
    try {
      const r = await fetch("/api/capital/health");
      if (r.ok) {
        statusEl.textContent = "online";
        statusEl.className = "brand-sub online";
      } else {
        statusEl.textContent = "degraded";
        statusEl.className = "brand-sub offline";
      }
    } catch (e) {
      statusEl.textContent = "offline";
      statusEl.className = "brand-sub offline";
    }
  }

  function addMsg(text, kind, meta) {
    const el = document.createElement("div");
    el.className = "msg " + kind;
    el.textContent = text;
    if (meta) {
      const m = document.createElement("div");
      m.className = "msg-meta";
      m.textContent = meta;
      el.appendChild(m);
    }
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return el;
  }

  function clearWelcome() {
    const w = messagesEl.querySelector(".welcome");
    if (w) w.remove();
  }

  async function send(message) {
    const token = getToken();
    if (!token) {
      addMsg("Owner token required. Refresh and enter it when prompted.", "error");
      return;
    }

    clearWelcome();
    addMsg(message, "user");

    const thinking = addMsg("Nia is thinking", "nia thinking");
    inputEl.value = "";
    inputEl.style.height = "auto";
    sendEl.disabled = true;

    try {
      const r = await fetch("/api/nia/chat", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "authorization": "Bearer " + token,
        },
        body: JSON.stringify({ message: message }),
      });
      const data = await r.json();
      thinking.remove();

      if (!data.ok) {
        addMsg("Error: " + (data.error || "unknown"), "nia error");
      } else {
        const meta = (data.generator || "template").toUpperCase();
        addMsg(data.reply || "(empty reply)", "nia", meta);
      }
    } catch (e) {
      thinking.remove();
      addMsg("Network error: " + e.message, "nia error");
    } finally {
      sendEl.disabled = false;
      inputEl.focus();
    }
  }

  // Auto-grow textarea
  inputEl.addEventListener("input", function () {
    inputEl.style.height = "auto";
    inputEl.style.height = Math.min(140, inputEl.scrollHeight) + "px";
  });

  // Enter to send (Shift+Enter for newline)
  inputEl.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const v = inputEl.value.trim();
      if (v) send(v);
    }
  });

  sendEl.addEventListener("click", function () {
    const v = inputEl.value.trim();
    if (v) send(v);
  });

  document.querySelectorAll(".suggestion").forEach(function (btn) {
    btn.addEventListener("click", function () {
      send(btn.dataset.msg);
    });
  });

  clearEl.addEventListener("click", function () {
    messagesEl.innerHTML = "";
    location.reload();
  });

  // Init
  healthCheck();
  setInterval(healthCheck, 30000);
  inputEl.focus();
})();
