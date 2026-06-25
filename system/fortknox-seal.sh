#!/data/data/com.termux/files/usr/bin/bash

BASE="$HOME/nia-capital-os"
SEAL="$BASE/system/fortknox.sha256"

find "$BASE/core" -type f -exec sha256sum {} \; > "$SEAL"

echo "[FORT KNOX] Integrity seal created."
