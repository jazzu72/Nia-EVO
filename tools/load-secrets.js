// Decrypts secrets.enc into process.env — call at top of server-watson.js
const fs = require("fs");
const crypto = require("crypto");
const readline = require("readline");

const ENC_FILE = process.env.SECRETS_PATH || "secrets.enc";
const SALT = Buffer.from("nia-capital-os-v1");

function askPassword(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const stdin = process.stdin;
    process.stdout.write(prompt);
    const onData = (char) => {
      char = char.toString();
      if (char === "\n" || char === "\r") {
        stdin.removeListener("data", onData);
      } else {
        process.stdout.clearLine(0); process.stdout.cursorTo(0);
        process.stdout.write(prompt + "*".repeat(rl.line.length));
      }
    };
    stdin.on("data", onData);
    rl.question("", (a) => { rl.close(); process.stdout.write("\n"); resolve(a); });
  });
}

async function loadSecrets() {
  if (!fs.existsSync(ENC_FILE)) return;
  const password = process.env.NIA_MASTER_PASSWORD || await askPassword("🔑 Master password: ");
  if (!password) throw new Error("No master password");

  const payload = fs.readFileSync(ENC_FILE);
  const iv = payload.slice(0, 12);
  const tag = payload.slice(12, 28);
  const data = payload.slice(28);

  const key = crypto.scryptSync(password, SALT, 32);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");

  for (const line of plaintext.split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  console.log("🔓 Secrets loaded from secrets.enc");
}

module.exports = { loadSecrets };
