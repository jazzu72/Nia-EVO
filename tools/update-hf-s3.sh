#!/data/data/com.termux/files/usr/bin/bash
# Adds HF S3-compatible credentials to secrets.enc — silent input, no echo

set -e
cd "$(dirname "$0")/.."

echo "═══════════════════════════════════════════════════════"
echo "  HF S3 Credentials — Secure Import"
echo "═══════════════════════════════════════════════════════"
echo ""

echo "🔑 Access Key ID (starts with HFAKs...):"
read -s AWS_KEY_ID
echo ""
echo "🔑 Secret Access Key (64 hex chars):"
read -s AWS_SECRET
echo ""

# Validate
if [ ${#AWS_KEY_ID} -lt 20 ]; then
  echo "❌ Access Key ID too short (${#AWS_KEY_ID} chars)"
  unset AWS_KEY_ID AWS_SECRET
  exit 1
fi
if [ ${#AWS_SECRET} -lt 40 ]; then
  echo "❌ Secret Access Key too short (${#AWS_SECRET} chars)"
  unset AWS_KEY_ID AWS_SECRET
  exit 1
fi
echo "✅ Access Key: ${AWS_KEY_ID:0:8}... (${#AWS_KEY_ID} chars)"
echo "✅ Secret Key: ${#AWS_SECRET} chars"
echo ""

if [ -z "$NIA_MASTER_PASSWORD" ]; then
  echo "🔑 Master password for secrets.enc:"
  read -s NIA_MASTER_PASSWORD
  echo ""
  export NIA_MASTER_PASSWORD
fi

echo "⏳ Merging into secrets.enc..."

HF_AWS_KEY="$AWS_KEY_ID" HF_AWS_SECRET="$AWS_SECRET" node <<'NODE_EOF'
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
  t = re.test(t) ? t.replace(re, `${name}=${value}`) : t + `\n${name}=${value}`;
}

setKey("HF_AWS_ACCESS_KEY_ID", process.env.HF_AWS_KEY);
setKey("HF_AWS_SECRET_ACCESS_KEY", process.env.HF_AWS_SECRET);
setKey("HF_S3_ENDPOINT", "https://s3.hf.co");
setKey("HF_S3_BUCKET", "Jazzu-72");
setKey("HF_S3_REGION", "us-east-1");

const key = crypto.scryptSync(process.env.NIA_MASTER_PASSWORD, SALT, 32);
const iv = crypto.randomBytes(12);
const c = crypto.createCipheriv("aes-256-gcm", key, iv);
const enc = Buffer.concat([c.update(Buffer.from(t)), c.final()]);
fs.writeFileSync("secrets.enc", Buffer.concat([iv, c.getAuthTag(), enc]), { mode: 0o600 });

const lines = t.split("\n").filter(l => /^[A-Z_]+=/.test(l));
console.log(`✅ secrets.enc now has ${lines.length} keys`);
lines.forEach(l => {
  const [n, v] = l.split("=");
  const isSecret = /TOKEN|KEY|PASSWORD|SECRET/.test(n);
  console.log(`  ${n}: ${isSecret ? `[${(v||"").length} chars]` : v}`);
});
NODE_EOF

unset AWS_KEY_ID AWS_SECRET
echo ""
echo "═══════════════════════════════════════════════════════"
echo "  New base64 for Render"
echo "═══════════════════════════════════════════════════════"
base64 -w0 secrets.enc
echo ""
echo ""
echo "⚠️  ROTATE these credentials at: https://huggingface.co/settings/tokens"
