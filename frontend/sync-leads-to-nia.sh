#!/usr/bin/env bash
set -euo pipefail

# ─── Paths ────────────────────────────────────────────────────
BASE_DIR="${BIRD_DOG_DIR:-$HOME/bird_dog}"
LEADS_CSV="$BASE_DIR/leads.csv"
NIA_MEMORY="$HOME/nia-capital-os/memory.json"

# ─── Check if Nia memory exists ──────────────────────────────
if [[ ! -f "$NIA_MEMORY" ]]; then
  echo "❌ Nia memory.json not found at: $NIA_MEMORY"
  echo "   Run this from within nia-capital-os, or create memory.json first."
  exit 1
fi

# ─── Check if we have new leads to sync ──────────────────────
if [[ ! -f "$LEADS_CSV" ]]; then
  echo "❌ No leads.csv found at: $LEADS_CSV"
  exit 1
fi

# ─── Read last synced line ──────────────────────────────────
SYNC_MARKER="$BASE_DIR/.last_synced_line"
if [[ -f "$SYNC_MARKER" ]]; then
  LAST_SYNCED=$(cat "$SYNC_MARKER")
else
  LAST_SYNCED=0
fi

# ─── Count total lines ──────────────────────────────────────
TOTAL_LINES=$(wc -l < "$LEADS_CSV")
if [[ "$TOTAL_LINES" -le "$LAST_SYNCED" ]]; then
  echo "✅ No new leads to sync."
  exit 0
fi

echo "📦 Syncing leads from line $((LAST_SYNCED + 1)) to $TOTAL_LINES..."

# ─── Read the CSV and build new memory entries ──────────────
NEW_LEADS_JSON=""
LINE_NUM=0
while IFS=',' read -r date lead_name property_address city state zip phone email source condition asking_price notes status; do
  ((LINE_NUM++))
  if [[ "$LINE_NUM" -eq 1 ]]; then
    continue  # skip header
  fi
  if [[ "$LINE_NUM" -le "$LAST_SYNCED" ]]; then
    continue  # already synced
  fi

  # Build a minimal lead object for Nia
  NEW_LEADS_JSON+="$(cat <<JSON
    "$phone": {
      "stage": "new",
      "history": ["Bird dog lead added via CSV: $property_address"],
      "lastContact": "$(date -Iseconds)",
      "note": "From $source | $condition | Asking: \$$asking_price"
    },
JSON
)"
done < "$LEADS_CSV"

# ─── Merge into Nia's memory.json ────────────────────────────
if [[ -n "$NEW_LEADS_JSON" ]]; then
  echo "📝 Updating Nia memory..."

  # Use Node.js to merge safely
  node -e "
    const fs = require('fs');
    const mem = JSON.parse(fs.readFileSync('$NIA_MEMORY', 'utf8'));
    const newLeads = {
      $NEW_LEADS_JSON
    };
    Object.assign(mem.leads, newLeads);
    fs.writeFileSync('$NIA_MEMORY', JSON.stringify(mem, null, 2));
    console.log('✅ Synced ' + Object.keys(newLeads).length + ' new lead(s) to Nia.');
  "

  # ─── Update sync marker ──────────────────────────────────────
  echo "$TOTAL_LINES" > "$SYNC_MARKER"
else
  echo "⚠️ No valid leads found to sync."
fi
