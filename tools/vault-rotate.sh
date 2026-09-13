#!/data/data/com.termux/files/usr/bin/bash
# ─────────────────────────────────────────────────────────────
#  NIA VAULT ROTATION — single entry point for all secrets
#  Never accepts pasted credentials. Reads from a local file.
# ─────────────────────────────────────────────────────────────
set -e
cd "$(dirname "$0")/.."

INCOMING="$HOME/.secrets-incoming.env"

echo "═══════════════════════════════════════════════════════"
echo "  NIA VAULT ROTATION"
echo "═══════════════════════════════════════════════════════"
echo ""

if [ ! -f "$INCOMING" ]; then
  echo "❌ Missing: $INCOMING"
  echo ""
  echo "Create it with: nano $INCOMING"
  echo ""
  echo "Add only the keys you want to update, one per line:"
  echo "  OPENAI_API_KEY=sk-proj-..."
  echo "  GEMINI_API_KEY=AIzaSy..."
  echo "  RESEND_API_KEY=re_..."
  echo "  RENDER_API_KEY=rnd_..."
  echo "  GH_TOKEN=ghp_..."
  echo "  HF_TOKEN=hf_..."
  echo "  HF_AWS_ACCESS_KEY_ID=HFAKs..."
  echo "  HF_AWS_SECRET_ACCESS_KEY=..."
  echo "  NIA_OWNER_AUTH_TOKEN=NIA_OWNER_..."
  echo ""
  echo "Save (Ctrl+O, Enter, Ctrl+X), then re-run this script."
  exit 1
fi

chmod 600 "$INCOMING"

# Master password (silent)
if [ -z "$NIA_MASTER_PASSWORD" ]; then
  echo "🔑 Master password for secrets.enc:"
  read -s NIA_MASTER_PASSWORD
  echo ""
  export NIA_MASTER_PASSWORD
fi

echo "⏳ Reading $INCOMING..."
echo ""

# Merge with current secrets.enc
INCOMING_FILE="$INCOMING" node <<'NODE_EOF'
const fs = require("fs");
const crypto = require("crypto");
const SALT = Buffer.from("nia-capital-os-v1");

// Read incoming
const incoming = fs.readFileSync(process.env.INCOMING_FILE, "utf8")
  .split("\n")
  .map(l => l.trim())
  .filter(l => l && !l.startsWith("#") && /^[A-Z_]+=/.test(l))
  .reduce((acc, l) => {
    const i = l.indexOf("=");
    acc[l.slice(0, i)] = l.slice(i + 1);
    return acc;
  }, {});

console.log("📦 Incoming keys:");
Object.keys(incoming).forEach(k => {
  const v = incoming[k];
  const isSecret = /TOKEN|KEY|PASSWORD|SECRET/.test(k);
  console.log(`  ${k}: ${isSecret ? `[${v.length} chars]` : v}`);
});
console.log("");

// Decrypt current
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

// Merge
function setKey(name, value) {
  if (!value) return;
  const re = new RegExp(`^${name}=.*$`, "m");
  t = re.test(t) ? t.replace(re, `${name}=${value}`) : t + `\n${name}=${value}`;
}

Object.entries(incoming).forEach(([k, v]) => setKey(k, v));

// Re-encrypt
const key = crypto.scryptSync(process.env.NIA_MASTER_PASSWORD, SALT, 32);
const iv = crypto.randomBytes(12);
const c = crypto.createCipheriv("aes-256-gcm", key, iv);
const enc = Buffer.concat([c.update(Buffer.from(t)), c.final()]);
fs.writeFileSync("secrets.enc", Buffer.concat([iv, c.getAuthTag(), enc]), { mode: 0o600 });

console.log("═══════════════════════════════════════════════════════");
console.log("  secrets.enc now contains:");
console.log("═══════════════════════════════════════════════════════");
t.split("\n").filter(l => /^[A-Z_]+=/.test(l)).forEach(l => {
  const i = l.indexOf("=");
  const n = l.slice(0, i);
  const v = l.slice(i + 1);
  const isSecret = /TOKEN|KEY|PASSWORD|SECRET/.test(n);
  console.log(`  ${n}: ${isSecret ? `[${v.length} chars]` : v}`);
});
NODE_EOF

# Shred incoming
shred -u "$INCOMING" 2>/dev/null || rm -f "$INCOMING"
echo ""
echo "🗑️  $INCOMING shredded"

# Print base64
echo ""
echo "═══════════════════════════════════════════════════════"
echo "  NEW BASE64 (paste into Render secret file)"
echo "═══════════════════════════════════════════════════════"
base64 -w0 secrets.enc
echo ""
echo ""

# Update Render env vars
echo "═══════════════════════════════════════════════════════"
echo "  Render env-var check"
echo "═══════════════════════════════════════════════════════"
SID="srv-daj9itfqj5pc73cocr40"
RTOKEN="${RENDER_API_KEY:-$(node -e '
  const fs=require("fs"),crypto=require("crypto");
  const SALT=Buffer.from("nia-capital-os-v1");
  const raw=fs.readFileSync("secrets.enc");
  const isB64=!raw.includes(0)&&/^[A-Za-z0-9+/=\s]+$/.test(raw.toString("ascii"));
  const p=isB64?Buffer.from(raw.toString("ascii").replace(/\s/g,""),"base64"):raw;
  const d=crypto.createDecipheriv("aes-256-gcm",crypto.scryptSync(process.env.NIA_MASTER_PASSWORD,SALT,32),p.slice(0,12));
  d.setAuthTag(p.slice(12,28));
  const t=Buffer.concat([d.update(p.slice(28)),d.final()]).toString();
  const m=t.match(/^RENDER_API_KEY=(.*)$/m);
  process.stdout.write(m?m[1].trim():"");
')}"

if [ -n "$RTOKEN" ]; then
  echo "  Updating NIA_MASTER_PASSWORD on Render..."
  curl -sS -X PUT "https://api.render.com/v1/services/$SID/env-vars/NIA_MASTER_PASSWORD" \
    -H "Authorization: Bearer $RTOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"value\":\"$NIA_MASTER_PASSWORD\"}" \
    -o /dev/null -w "  → HTTP %{http_code}\n"
fi

# Restart local
echo ""
echo "═══════════════════════════════════════════════════════"
echo "  Local restart"
echo "═══════════════════════════════════════════════════════"
pm2 flush nia >/dev/null 2>&1 || true
pm2 restart nia --update-env >/dev/null 2>&1 || true
sleep 5
head -2 "$HOME/.pm2/logs/nia-out.log" 2>/dev/null | tail -2

# Wipe history
history -c 2>/dev/null || true
: > ~/.bash_history 2>/dev/null || true

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  ✅ VAULT ROTATION COMPLETE"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo "  1. Copy the base64 above into Render:"
echo "     https://dashboard.render.com/web/$SID/env"
echo "     → Secret Files → secrets.enc → Edit → paste → Save"
echo "  2. Render auto-deploys in ~2 min"
echo "  3. Test:"
echo "     curl -sS 'https://nia-evo-3-0.onrender.com/api/autonomy/draft/<opp-id>'"
echo ""
