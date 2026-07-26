#!/bin/bash

echo ""
echo "════════════════════════════"
echo "🏰 NIA ACTIVE WORKFLOWS"
echo "════════════════════════════"

curl -s \
http://localhost:3000/api/workflow/active

echo ""

