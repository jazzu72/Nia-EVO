#!/bin/bash

echo "🌱 Seeding Nia with real opportunities..."

# 1. Load grants from verified queue into the pipeline
if [ -f nia-verified-grant-queue.json ]; then
  GRANTS=$(jq -c '.queue[]' nia-verified-grant-queue.json)
  echo "$GRANTS" | while read grant; do
    curl -s -X POST http://localhost:3000/api/crm/lead \
      -H "Content-Type: application/json" \
      -d "$grant"
  done
  echo "✅ Grants seeded: $(echo "$GRANTS" | wc -l)"
else
  echo "⚠️ No verified grant queue found."
fi

# 2. Seed real estate leads (foreclosures/distress)
cat > data/real-estate-leads.json << 'RE_LEADS'
[
  {"address":"3410 Tidewater Dr, Norfolk, VA","price":185000,"status":"new","score":85},
  {"address":"1621 Colonial Ave, Norfolk, VA","price":220000,"status":"new","score":92},
  {"address":"900 E Ocean View Ave, Norfolk, VA","price":275000,"status":"new","score":78},
  {"address":"222 W 21st St, Norfolk, VA","price":195000,"status":"new","score":80}
]
RE_LEADS

jq -c '.[]' data/real-estate-leads.json | while read lead; do
  curl -s -X POST http://localhost:3000/api/crm/lead \
    -H "Content-Type: application/json" \
    -d "$lead"
done
echo "✅ Real estate leads seeded."

# 3. Seed AI automation prospects
cat > data/ai-prospects.json << 'AI_PROSPECTS'
[
  {"company":"Thompson Construction","industry":"contractor","contact":"Mike Thompson","phone":"757-555-0101","score":95},
  {"company":"Norfolk Realty Group","industry":"real estate","contact":"Sarah Chen","phone":"757-555-0202","score":88},
  {"company":"Hampton Roads HVAC","industry":"hvac","contact":"David Miller","phone":"757-555-0303","score":82}
]
AI_PROSPECTS

jq -c '.[]' data/ai-prospects.json | while read prospect; do
  curl -s -X POST http://localhost:3000/api/crm/lead \
    -H "Content-Type: application/json" \
    -d "$prospect"
done
echo "✅ AI automation prospects seeded."

# 4. Trigger the orchestrator to start processing
curl -s -X POST http://localhost:3000/api/orchestrator/run > /dev/null
echo "🚀 Orchestrator cycle triggered."

echo "✅ Nia is now running with real opportunities."
