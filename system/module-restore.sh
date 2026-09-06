#!/data/data/com.termux/files/usr/bin/bash

BASE="$HOME/nia-capital-os"
BACKUP="$BASE/system/backups"

mkdir -p "$BACKUP"

FILE="$1"

if [ ! -f "$BACKUP/$FILE" ]; then
  echo "[SELF-HEAL] No backup found for $FILE"
  exit 1
fi

cp "$BACKUP/$FILE" "$BASE/core/$FILE"
echo "[SELF-HEAL] Restored $FILE from backup."
