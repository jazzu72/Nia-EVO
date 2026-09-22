/* NIA CHAT — frontend with inline token input */
(function () {
  const TOKEN_KEY = "nia-owner-token";
  const messagesEl = document.getElementById("messages");
  const inputEl = document.getElementById("input");
  const sendEl = document.getElementById("send");
  const statusEl = document.getElementById("status");
  const clearEl = document.getElementById("clear");

  // Use localStorage (persists between sessions) instead of sessionStorage
  function getToken() { return localStorage.getItem(TOKEN_KEY); }
  function setToken(t) { localStorage.setItem(TOKEN_KEY, t.trim()); }
  function clearToken() { localStorage.removeItem(TOKEN_KEY); }

  // Show a token prompt inside the messages area if no token
  function showTokenPrompt() {
    const existing = document.querySelector(".token-prompt");
    if (existing) return;

    const wrap = document.createElement("div");
    wrap.className = "token-prompt";
    wrap.innerHTML = `
      <div class="token-label">Owner token required</div>
      <div class="token-hint">Paste your NIA_OWNER_... token (from <code>cat ~/.nia-owner-token</code>)</div>
      <input type="password" id="token-input" placeholder="NIA_OWNER_..." autocomplete="off">
      <button id="token-save">Save</button>
    `;
    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    document.getElementById("token-save").addEventListener("click", function () {
      const v = document.getElementById("token-input").value.trim();
      if (v && v.startsWith("NIA_OWNER_")) {
        setToken(v);
        wrap.remove();
        addMsg("Token saved. You can chat now.", "nia", "SYSTEM");
        inputEl.focus();
      } else {
        alert("Invalid format. Should start with NIA_OWNER_");
      }
    });

    document.getElementById("token-input").addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        document.getElementById("token-save").click();
      }
    });
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
      showTokenPrompt();
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
        if (data.error === "OWNER_AUTH_REQUIRED" || data.error === "OWNER_AUTH_NOT_CONFIGURED") {
          clearToken();
          addMsg("Your token was rejected. Please paste it again below.", "nia error");
          showTokenPrompt();
        } else {
          addMsg("Error: " + (data.error || "unknown"), "nia error");
        }
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

  inputEl.addEventListener("input", function () {
    inputEl.style.height = "auto";
    inputEl.style.height = Math.min(140, inputEl.scrollHeight) + "px";
  });

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
    clearToken();
    location.reload();
  });

  // Init
  if (!getToken()) {
    showTokenPrompt();
  }
  healthCheck();
  setInterval(healthCheck, 30000);
  inputEl.focus();
  window.addMsg = addMsg;
})();
