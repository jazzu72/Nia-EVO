#!/bin/bash

pm2 start src/api/server.js --name api --log logs/api.log
pm2 start NIA-CEO/autonomous.js --name ceo --log logs/ceo.log
pm2 start NIA-CEO/chief-of-staff.js --name cos --log logs/cos.log
pm2 start NIA_GRANTS_AUTONOMOUS.js --name grants -- run --log logs/grants.log
pm2 start reply-parser.js --name ai-negotiator --log logs/ai-negotiator.log
pm2 start orchestrator.js --name orchestrator --log logs/orchestrator.log
pm2 start watcher.js --name watcher --log logs/watcher.log
pm2 save
