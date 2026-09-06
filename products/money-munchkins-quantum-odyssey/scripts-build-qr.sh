#!/data/data/com.termux/files/usr/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

URL="${MONEY_MUNCHKINS_PUBLIC_URL:-http://127.0.0.1:3310/money-munchkins/}"

command -v qrencode >/dev/null 2>&1 || {
  echo "❌ qrencode is required"
  echo "Run: pkg install qrencode"
  exit 1
}

mkdir -p pilot/qr

python3 - "$URL" <<'PY'
import json,sys
from pathlib import Path

base=sys.argv[1]
if not base.endswith("/"):
    base+="/"

p=Path("content/deck/starter-deck.json")
d=json.loads(p.read_text())

for card in d["cards"]:
    card["qrTarget"]=base+"?card="+card["id"]

p.write_text(json.dumps(d,indent=2))
print("✅ QR targets updated")
print("🌐 Base URL:",base)
PY

rm -f pilot/qr/*.png

python3 - "$URL" <<'PY'
import json,sys,subprocess
from pathlib import Path

base=sys.argv[1]
if not base.endswith("/"):
    base+="/"

d=json.loads(Path("content/deck/starter-deck.json").read_text())
Path("pilot/qr").mkdir(parents=True,exist_ok=True)

for card in d["cards"]:
    target=base+"?card="+card["id"]
    subprocess.run([
        "qrencode","-o",
        f"pilot/qr/{card['id']}.png",
        "-s","8","-m","2",
        target
    ],check=True)

print("✅ QR images generated:",len(d["cards"]))
PY

echo
echo "========================================"
echo "🚀 QR BUILD COMPLETE"
echo "========================================"
echo "URL: $URL"
echo "Cards: $(find pilot/qr -name '*.png' | wc -l)"
echo "Deck: pilot/quantum-odyssey-starter-deck.html"
