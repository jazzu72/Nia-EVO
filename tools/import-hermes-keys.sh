#!/data/data/com.termux/files/usr/bin/bash
# Imports HF_TOKEN and OPENROUTER_API_KEY from ~/.hermes/.env into Nia's secrets.enc
# Never echoes actual key values.

set -e
cd "$(dirname "$0")/.."

HERMES_ENV="$HOME/.hermes/.env"
if [ ! -f "$HERMES_ENV" ]; then
  echo "❌ ~/.hermes/.env not found"
  exit 1
fi

# Extract real values (ignore comments)
HF_TOKEN=$(grep -E "^HF_TOKEN=" "$HERMES_ENV" | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'")
OR_KEY=$(grep -E "^OPENROUTER_API_KEY=" "$HERMES_ENV" | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'")

if [ -z "$HF_TOKEN" ] && [ -z "$OR_KEY" ]; then
  echo "❌ No HF_TOKEN or OPENROUTER_API_KEY found in $HERMES_ENV"
  exit 1
fi

echo "📦 Found in Hermes .env:"
[ -n "$HF_TOKEN" ] && echo "  HF_TOKEN: ${#HF_TOKEN} chars (prefix: ${HF_TOKEN:0:6}...)"
[ -n "$OR_KEY" ] && echo "  OPENROUTER_API_KEY: ${#OR_KEY} chars (prefix: ${OR_KEY:0:8}...)"
echo ""

if [ -z "$NIA_MASTER_PASSWORD" ]; then
  echo "🔑 Master password for Nia's secrets.enc:"
  read -s NIA_MASTER_PASSWORD
  echo ""
  export NIA_MASTER_PASSWORD
fi

echo "⏳ Merging keys into secrets.enc..."

HF_TOKEN="$HF_TOKEN" OR_KEY="$OR_KEY" node <<'NODE_EOF'
const fs = require("fs");
const crypto = require("crypto");
const SALT = Buffer.from("nia-capital-os-v1");
const raw = fs.readFileSync("secrets.enc");
const isB64 = !raw.includes(0) && /^[A-Za-z0-9+/=\s]+$/.test(raw.toString("ascii"));
const payload = isB64 ? Buffer.from(raw.toString("ascii").replace(/\s/g, ""), "base64") : raw;

const d = crypto.createDecipheriv(
  "aes-256-gcm",
  crypto.scryptSync(process.env.NIA_MASTER_PASSWORD, SALT, 32),
  payload.slice(0, 12)
);
d.setAuthTag(payload.slice(12, 28));
let t = Buffer.concat([d.update(payload.slice(28)), d.final()]).toString("utf8");

function setKey(name, value) {
  if (!value) return;
  const re = new RegExp(`^${name}=.*$`, "m");
  if (re.test(t)) t = t.replace(re, `${name}=${value}`);
  else t += `\n${name}=${value}`;
}

setKey("HF_TOKEN", process.env.HF_TOKEN);
setKey("HUGGINGFACE_TOKEN", process.env.HF_TOKEN);
setKey("OPENROUTER_API_KEY", process.env.OR_KEY);

const key = crypto.scryptSync(process.env.NIA_MASTER_PASSWORD, SALT, 32);
const iv = crypto.randomBytes(12);
const c = crypto.createCipheriv("aes-256-gcm", key, iv);
const enc = Buffer.concat([c.update(Buffer.from(t)), c.final()]);
const tag = c.getAuthTag();

fs.writeFileSync("secrets.enc", Buffer.concat([iv, tag, enc]), { mode: 0o600 });

// Summary (no values)
const lines = t.split("\n").filter(l => /^[A-Z_]+=/.test(l));
console.log(`✅ secrets.enc now has ${lines.length} keys`);
NODE_EOF

unset HF_TOKEN OR_KEY
echo ""
echo "═══════════════════════════════════════════════════════"
echo "  New base64 (paste into Render secret file)"
echo "═══════════════════════════════════════════════════════"
base64 -w0 secrets.enc
echo ""
