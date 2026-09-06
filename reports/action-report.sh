#!/bin/bash

echo ""
echo "════════════════════════════"
echo "🏰 NIA ACTION QUEUE"
echo "════════════════════════════"

curl -s \
http://localhost:3000/api/actions/pending

echo ""

