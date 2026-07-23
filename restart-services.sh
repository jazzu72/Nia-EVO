#!/bin/bash

echo "🔄 Restarting all services..."

pm2 restart api
pm2 restart ceo
pm2 restart telegram
pm2 restart grants
pm2 restart apps

pm2 save
echo "✅ All services restarted"
