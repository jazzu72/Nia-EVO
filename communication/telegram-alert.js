const https = require("https");

function sendTelegram(message) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chat) {
    console.error("TELEGRAM_NOT_CONFIGURED");
    return Promise.resolve({ sent: false, reason: "missing_credentials" });
  }

  const data = JSON.stringify({
    chat_id: chat,
    text: String(message).slice(0, 4000)
  });

  return new Promise((resolve) => {
    const req = https.request(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data)
        },
        timeout: 10000
      },
      (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", chunk => body += chunk);
        res.on("end", () => {
          try {
            const result = JSON.parse(body);
            if (res.statusCode === 200 && result.ok) {
              console.log("TELEGRAM_DELIVERY_CONFIRMED");
              resolve({ sent: true });
            } else {
              console.error("TELEGRAM_DELIVERY_FAILED", res.statusCode);
              resolve({ sent: false, reason: "telegram_api_error" });
            }
          } catch {
            console.error("TELEGRAM_RESPONSE_INVALID");
            resolve({ sent: false, reason: "invalid_response" });
          }
        });
      }
    );

    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.on("error", () => {
      console.error("TELEGRAM_REQUEST_FAILED");
      resolve({ sent: false, reason: "request_failed" });
    });

    req.end(data);
  });
}

module.exports = { sendTelegram };
