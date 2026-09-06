#!/bin/bash

echo ""
echo "════════════════════════════"
echo "🏰 NIA DECISION REPORT"
echo "════════════════════════════"

curl -s \
http://localhost:3000/api/decision/history

echo ""

