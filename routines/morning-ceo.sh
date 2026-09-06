#!/bin/bash

echo ""
echo "🏰 NIA MORNING CEO ROUTINE"
echo "=========================="

curl -s \
-X POST \
http://localhost:3000/api/tasks/generate


echo ""

echo "Today's tasks generated."

