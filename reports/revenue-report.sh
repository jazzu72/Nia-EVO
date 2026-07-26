#!/bin/bash

echo ""
echo "════════════════════════════"
echo "🏰 NIA REVENUE SNAPSHOT"
echo "════════════════════════════"

curl -s \
http://localhost:3000/api/revenue/pipeline

echo ""

