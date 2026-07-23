#!/bin/bash

echo "🚀 Deploying Nia Capital OS for client..."
mkdir -p ~/nia-client
cd ~/nia-client
git clone https://github.com/your-repo/nia-capital-os.git .
npm install
pm2 start src/api/server.js --name api
pm2 start NIA-CEO/autonomous.js --name ceo
pm2 start NIA-CEO/chief-of-staff.js --name cos
pm2 start NIA_GRANTS_AUTONOMOUS.js --name grants
pm2 start reply-parser.js --name ai-negotiator
pm2 start orchestrator.js --name orchestrator
pm2 start watcher.js --name watcher
pm2 save
echo "✅ Nia is running for client."
