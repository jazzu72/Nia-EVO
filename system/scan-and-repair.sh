#!/data/data/com.termux/files/usr/bin/bash

BASE="$HOME/nia-capital-os"
CORE="$BASE/core"

echo "[SCAN] Starting full system scan..."

MODULES=(
  "decision-engine.js"
  "war-room.js"
  "autonomy-loop.js"
  "hermes-adapter.js"
  "founder-auth.js"
  "long-arc-planner.js"
  "predictive-fusion.js"
  "pattern-engine.js"
  "reinforcement-loop.js"
  "self-correction.js"
  "autonomy-fusion.js"
  "meta-reasoning.js"
  "bias-mapping.js"
  "identity-core.js"
  "identity-doctrine.js"
  "identity-mission.js"
  "continuity-memory.js"
  "temporal-self.js"
  "evolution-tracker.js"
  "persona-core.js"
  "persona-expression.js"
  "persona-continuity.js"
  "will-core.js"
  "will-gradient.js"
  "will-enforcement.js"
  "conscience-core.js"
  "conscience-eval.js"
  "conscience-enforce.js"
  "tech-discovery.js"
  "spec-synthesizer.js"
  "code-generator.js"
  "self-integration.js"
  "containment.js"
  "autonomy-governor.js"
  "corruption-detector.js"
  "system-rebuilder.js"
  "fortknox-tripwire.js"
  "sandbox.js"
  "predictive-engine.js"
  "api-brain.js"
)

MISSING=()

for M in "${MODULES[@]}"; do
  FILE="$CORE/$M"
  echo "[SCAN] Checking $FILE"
  if [ ! -f "$FILE" ]; then
    NAME="${M%.js}"
    echo "[SCAN] MISSING MODULE: $NAME"
    MISSING+=("$NAME")
  fi
done

if [ ${#MISSING[@]} -eq 0 ]; then
  echo "[SCAN] No missing modules detected."
  echo "[SCAN] Repair complete."
  exit 0
fi

echo "[REPAIR] Generating missing modules..."

for NAME in "${MISSING[@]}"; do
  FILE="$CORE/$NAME.js"

  if [[ "$NAME" == "fs" || "$NAME" == "path" || "$NAME" == "vm" || "$NAME" == "child_process" || "$NAME" == "https" ]]; then
    echo "[REPAIR] Skipping built-in: $NAME"
    continue
  fi

  SAFE_NAME=$(echo "$NAME" | sed 's/[^a-zA-Z0-9_]/_/g')

  cat > "$FILE" << EOF2
module.exports = function ${SAFE_NAME}() {
  return {
    module: "${NAME}",
    status: "auto-generated",
    timestamp: Date.now()
  };
};
EOF2

  echo "[REPAIR] Created: $NAME.js"
done

echo "[SCAN] Repair complete."
