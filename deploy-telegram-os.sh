#!/bin/bash

echo "🚀 Deploying Telegram Business OS for client..."
cd ~/nia-capital-os
npm install
pm2 start src/api/server-production.js --name api
pm2 start NIA-CEO/autonomous.js --name ceo
pm2 start NIA-CEO/chief-of-staff.js --name cos
pm2 start NIA_GRANTS_AUTONOMOUS.js --name grants
pm2 start modules/career/career-engine.js --name career
node telegram-interface.js &
node telegram-business.js &
pm2 save
echo "✅ Telegram Business OS is running."
