#!/bin/bash

DATE=$(date +%Y-%m-%d)

mkdir -p backups/memory

cp data/memory/knowledge.json \
backups/memory/knowledge-$DATE.json

echo "🧠 Nia memory backed up"

