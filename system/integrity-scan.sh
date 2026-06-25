#!/data/data/com.termux/files/usr/bin/bash

BASE="$HOME/nia-capital-os"
CHECKSUMS="$BASE/system/checksums.sha256"

if [ ! -f "$CHECKSUMS" ]; then
  echo "[SELF-HEAL] No checksum file found. Generating baseline..."
  find "$BASE" -type f -not -path "*/node_modules/*" -exec sha256sum {} \; > "$CHECKSUMS"
  exit 0
fi

echo "[SELF-HEAL] Scanning integrity..."
sha256sum -c "$CHECKSUMS" 2>/dev/null | grep -v "OK"
