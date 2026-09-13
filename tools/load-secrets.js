// Decrypts secrets.enc into process.env — call at top of server-watson.js
// Supports both raw binary and base64-encoded .enc files (Render secret file path)
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
      if (char === "\n" || char === "\r") stdin.removeListener("data", onData);
      else { process.stdout.clearLine(0); process.stdout.cursorTo(0); process.stdout.write(prompt + "*".repeat(rl.line.length)); }
    };
    stdin.on("data", onData);
    rl.question("", (a) => { rl.close(); process.stdout.write("\n"); resolve(a); });
  });
}

function loadPayload(filePath) {
  const raw = fs.readFileSync(filePath);
  // Heuristic: base64 file is all ASCII and length % 4 === 0 with no NUL bytes
  const isProbablyBase64 =
    raw.length > 0 &&
    !raw.includes(0) &&
    /^[A-Za-z0-9+/=\s]+$/.test(raw.toString("ascii"));
  if (isProbablyBase64) {
    const decoded = Buffer.from(raw.toString("ascii").replace(/\s/g, ""), "base64");
    if (decoded.length >= 28) {
      console.log("🔐 secrets.enc: base64 payload detected, decoded", decoded.length, "bytes");
      return decoded;
    }
  }
  return raw;
}

async function loadSecrets() {
  if (!fs.existsSync(ENC_FILE)) {
    console.warn("⚠️  secrets file not found at", ENC_FILE, "— falling back to shell env");
    return;
  }
  const password = process.env.NIA_MASTER_PASSWORD || await askPassword("🔑 Master password: ");
  if (!password) throw new Error("No master password");

  const payload = loadPayload(ENC_FILE);
  const iv = payload.slice(0, 12);
  const tag = payload.slice(12, 28);
  const data = payload.slice(28);

  const key = crypto.scryptSync(password, SALT, 32);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");

  let count = 0;
  for (const line of plaintext.split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) { process.env[m[1]] = m[2].replace(/^["']|["']$/g, ""); count++; }
  }
  console.log("🔓 Secrets loaded from", ENC_FILE, "—", count, "keys");
}

module.exports = { loadSecrets };
