#!/data/data/com.termux/files/usr/bin/bash
# Securely update OPENAI_API_KEY inside secrets.enc
# No key is echoed, logged, or stored in plaintext.

set -e

cd "$(dirname "$0")/.."

echo "═══════════════════════════════════════════════════════"
echo "  NIA — Secure OpenAI Key Rotation"
echo "═══════════════════════════════════════════════════════"
echo ""

# Check secrets.enc exists
if [ ! -f secrets.enc ]; then
  echo "❌ secrets.enc not found in $(pwd)"
  exit 1
fi

# Check master password
if [ -z "$NIA_MASTER_PASSWORD" ]; then
  echo "🔑 Enter master password for secrets.enc:"
  read -s NIA_MASTER_PASSWORD
  echo ""
  export NIA_MASTER_PASSWORD
fi

# Prompt for new OpenAI key (silent)
echo "🔑 Paste your NEW OpenAI key (starts with sk-proj- or sk-):"
read -s NEW_OPENAI_KEY
echo ""

# Validate format (no echo of full key)
case "$NEW_OPENAI_KEY" in
  sk-proj-*|sk-*)
    if [ ${#NEW_OPENAI_KEY} -lt 40 ]; then
      echo "❌ Key too short (${#NEW_OPENAI_KEY} chars). Aborting."
      unset NEW_OPENAI_KEY
      exit 1
    fi
    echo "✅ Key format valid (${#NEW_OPENAI_KEY} chars, prefix: ${NEW_OPENAI_KEY:0:8}...)"
    ;;
  *)
    echo "❌ Key does not start with sk-proj- or sk-. Aborting."
    unset NEW_OPENAI_KEY
    exit 1
    ;;
esac

echo ""
echo "⏳ Re-encrypting secrets.enc..."

# Re-encrypt with new key — passed via env var, never in argv
NEW_KEY="$NEW_OPENAI_KEY" node <<'NODE_EOF'
const fs = require("fs");
const crypto = require("crypto");

const SALT = Buffer.from("nia-capital-os-v1");
const raw = fs.readFileSync("secrets.enc");
const isB64 = !raw.includes(0) && /^[A-Za-z0-9+/=\s]+$/.test(raw.toString("ascii"));
const payload = isB64
  ? Buffer.from(raw.toString("ascii").replace(/\s/g, ""), "base64")
  : raw;

// Decrypt with master password
const d = crypto.createDecipheriv(
  "aes-256-gcm",
  crypto.scryptSync(process.env.NIA_MASTER_PASSWORD, SALT, 32),
  payload.slice(0, 12)
);
d.setAuthTag(payload.slice(12, 28));
let plaintext = Buffer.concat([d.update(payload.slice(28)), d.final()]).toString("utf8");

// Replace OPENAI_API_KEY line
if (/^OPENAI_API_KEY=/m.test(plaintext)) {
  plaintext = plaintext.replace(/^OPENAI_API_KEY=.*$/m, "OPENAI_API_KEY=" + process.env.NEW_KEY);
} else {
  plaintext += "\nOPENAI_API_KEY=" + process.env.NEW_KEY;
}

// Re-encrypt with same master password
const key = crypto.scryptSync(process.env.NIA_MASTER_PASSWORD, SALT, 32);
const iv = crypto.randomBytes(12);
const c = crypto.createCipheriv("aes-256-gcm", key, iv);
const enc = Buffer.concat([c.update(Buffer.from(plaintext)), c.final()]);
const tag = c.getAuthTag();

fs.writeFileSync("secrets.enc", Buffer.concat([iv, tag, enc]), { mode: 0o600 });
console.log("✅ secrets.enc updated");
NODE_EOF

# Clear the key from the shell environment
unset NEW_OPENAI_KEY
unset NEW_KEY

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  New base64 for Render Secret File"
echo "═══════════════════════════════════════════════════════"
echo ""
base64 -w0 secrets.enc
echo ""
echo ""
echo "═══════════════════════════════════════════════════════"
echo "  Next Steps"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "1. Copy the base64 above"
echo "2. Open Render → Environment → Secret Files → secrets.enc → Edit"
echo "3. Replace contents with the new base64 → Save"
echo "4. Render will auto-deploy"
echo ""
echo "5. Verify locally with:"
echo "   pm2 restart nia --update-env && sleep 3"
echo "   curl -sS http://127.0.0.1:3000/api/capital/health"
echo ""
echo "6. Wipe shell history for this session:"
echo "   history -c && history -w"
echo ""

# Clear shell history containing any sensitive typing
history -c 2>/dev/null || true
