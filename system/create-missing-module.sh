#!/data/data/com.termux/files/usr/bin/bash

NAME="$1"
TARGET="$HOME/nia-capital-os/core/$NAME.js"

if [ -f "$TARGET" ]; then
  echo "[MODULE] Already exists: $NAME.js"
  exit 0
fi

cat > "$TARGET" <<EOF2
// AUTO-GENERATED MISSING MODULE
module.exports = function $NAME() {
  return {
    module: "$NAME",
    status: "auto-generated",
    timestamp: Date.now()
  };
};
EOF2

echo "[MODULE] Created missing module: $NAME.js"
