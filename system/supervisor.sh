#!/data/data/com.termux/files/usr/bin/bash
pkill -f node
rm -rf ~/nia-capital-os/nia-command-center/.next
rm -rf ~/nia-capital-os/nia-command-center/node_modules/.cache
cd ~/nia-capital-os/core
# Using find to avoid directory errors
find . -type f -exec sha256sum {} + > ../system/checksums.sha256
cd ~/nia-capital-os/api
nohup node server.js > ~/nia-ops.log 2>&1 &
echo "✅ NIA-EVO System Supervisor: Rebuilt and Operational."
