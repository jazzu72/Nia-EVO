#!/bin/bash

echo ""
echo "════════════════════════════"
echo "🏰 NIA SENTINEL HEALTH REPORT"
echo "════════════════════════════"

curl -s \
http://localhost:3000/api/system/health

echo ""

