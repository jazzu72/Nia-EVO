#!/bin/bash

echo ""
echo "════════════════════════════"
echo "🏰 NIA SECURITY STATUS"
echo "════════════════════════════"

curl -s \
http://localhost:3000/api/security/audit

echo ""

