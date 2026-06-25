#!/data/data/com.termux/files/usr/bin/bash

BASE="$HOME/nia-capital-os"
SEAL="$HOME/secure-nia/fortknox.sha256"

echo "[FORT KNOX] Verifying integrity..."
sha256sum -c "$SEAL" 2>/dev/null | grep -v "OK"
