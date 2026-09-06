#!/data/data/com.termux/files/usr/bin/bash
set -e

BASE="http://127.0.0.1:3310/api/money-munchkins"

echo "🔐 PARENT GATE TEST"

CODE="${MONEY_MUNCHKINS_PARENT_CODE:-MM-PARENT-2026}"

HTTP=$(curl -s -o /tmp/mm-parent-test.json -w "%{http_code}"   -X POST "$BASE/parent/gate"   -H "Content-Type: application/json"   -d "{\"parentCode\":\"$CODE\"}")

if [ "$HTTP" != "200" ]; then
  echo "❌ Valid parent code rejected: HTTP $HTTP"
  cat /tmp/mm-parent-test.json
  exit 1
fi

echo "✅ Valid parent code accepted"

HTTP=$(curl -s -o /tmp/mm-parent-wrong.json -w "%{http_code}"   -X POST "$BASE/parent/gate"   -H "Content-Type: application/json"   -d '{"parentCode":"WRONG-CODE"}')

if [ "$HTTP" != "401" ]; then
  echo "❌ Wrong parent code was not rejected: HTTP $HTTP"
  cat /tmp/mm-parent-wrong.json
  exit 1
fi

echo "✅ Wrong parent code rejected: HTTP 401"
echo "🏆 PARENT SECURITY TEST PASSED"
