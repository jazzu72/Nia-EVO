#!/bin/bash

echo ""
echo "════════════════════════════"
echo "🏰 NIA COMMUNICATION QUEUE"
echo "════════════════════════════"

curl -s \
http://localhost:3000/api/communication/messages

echo ""

