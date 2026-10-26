/* Nia Legacy Command Adapter

* Routes owner commands through the authenticated, verified Nia chat API.
  */
  (function () {
  "use strict";

const TOKEN_KEY = "nia-owner-token";

async function sendNiaCommand() {
const input = document.getElementById("nia-command");
const output = document.getElementById("nia-response");

if (!input || !output) return;

const message = String(input.value || "").trim();
if (!message) return;

let token = localStorage.getItem(TOKEN_KEY);

if (!token) {
  token = window.prompt("Enter your Nia owner token:");
  if (!token || !token.trim()) {
    output.textContent = "Owner authorization is required.";
    return;
  }
  token = token.trim();
  localStorage.setItem(TOKEN_KEY, token);
}

output.textContent = "Nia is thinking…";

try {
  const response = await fetch("/api/nia/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ message })
  });

  const data = await response.json().catch(() => ({}));

  if (
    response.status === 401 ||
    response.status === 403 ||
    data.error === "OWNER_AUTH_REQUIRED" ||
    data.error === "OWNER_AUTH_NOT_CONFIGURED"
  ) {
    localStorage.removeItem(TOKEN_KEY);
    output.textContent =
      "Owner authorization failed. Reload this page and enter a valid owner token.";
    return;
  }

  if (!response.ok || !data.ok) {
    output.textContent =
      "Nia request failed: " + String(data.error || ("HTTP " + response.status));
    return;
  }

  output.textContent = "Nia: " + String(data.reply || "Nia returned an empty response.");
} catch (error) {
  output.textContent = "Nia connection error. No external action was taken.";
  console.error("[Nia Command Adapter] Request failed:", error.message);
}

}

window.sendNiaCommand = sendNiaCommand;
})();
