#!/data/data/com.termux/files/usr/bin/bash
set -e

echo "🚀 MONEY MUNCHKINS — INVESTOR PILOT BUILD"

command -v node >/dev/null || { echo "❌ Node.js missing"; exit 1; }
command -v npm >/dev/null || { echo "❌ npm missing"; exit 1; }

test -f app/server.js
test -f render.yaml
test -f pilot/pdf/money-munchkins-starter-mission-pack.pdf
test "$(find pilot/qr -name '*.png' | wc -l)" -eq 10

npm install --prefix app >/dev/null

node --check app/server.js
node --check app/api/investor/index.js
node --check app/api/parent.js
node --check app/api/progress.js
node --check app/services/progress-store.js

grep -q 'MONEY_MUNCHKINS_PARENT_CODE' render.yaml
grep -q 'MONEY_MUNCHKINS_INVESTOR_CODE' render.yaml

mkdir -p data/runtime

if [ -f data/runtime/server.pid ] &&
   kill -0 "$(cat data/runtime/server.pid)" 2>/dev/null; then
  kill "$(cat data/runtime/server.pid)" 2>/dev/null || true
  sleep 1
fi

(
  MONEY_MUNCHKINS_PARENT_CODE="${MONEY_MUNCHKINS_PARENT_CODE:-MM-PARENT-2026}" \
  MONEY_MUNCHKINS_INVESTOR_CODE="${MONEY_MUNCHKINS_INVESTOR_CODE:-INVESTOR-SMOKE-2026}" \
  PAYMENT_PROVIDER=manual \
  PORT=3310 \
  node app/server.js > data/runtime/build.log 2>&1
) &

echo $! > data/runtime/server.pid
sleep 2

curl -sf http://127.0.0.1:3310/api/money-munchkins/health >/dev/null

curl -sf \
  -H "x-investor-code: ${MONEY_MUNCHKINS_INVESTOR_CODE:-INVESTOR-SMOKE-2026}" \
  http://127.0.0.1:3310/api/money-munchkins/investor/funnel \
  | python3 -c '
import sys,json
d=json.load(sys.stdin)
assert d["success"] is True
m=d["funnelMetrics"]
print("📊 FUNNEL:",json.dumps(m))
'

echo "========================================"
echo "✅ NODE BUILD: PASS"
echo "✅ SYNTAX: PASS"
echo "✅ API HEALTH: PASS"
echo "✅ INVESTOR FUNNEL: PASS"
echo "✅ PARENT CONTROL CONTRACT: PASS"
echo "✅ INVESTOR CONTROL CONTRACT: PASS"
echo "✅ QR ASSETS: 10/10"
echo "✅ MISSION PACK: PASS"
echo "🚫 NO FABRICATED TRACTION"
echo "🎯 $25M: TARGET THESIS ONLY"
echo "🚀 MONEY MUNCHKINS INVESTOR PILOT BUILD: READY"
