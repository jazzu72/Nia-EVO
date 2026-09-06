#!/bin/bash

echo ""
echo "════════════════════════════"
echo "🏰 NIA FOLLOW-UP QUEUE"
echo "════════════════════════════"

curl -s \
http://localhost:3000/api/outreach/followups

echo ""

