#!/bin/bash

echo ""
echo "════════════════════════════"
echo "🏰 NIA FINANCIAL SNAPSHOT"
echo "════════════════════════════"

curl -s \
http://localhost:3000/api/finance/summary

echo ""

