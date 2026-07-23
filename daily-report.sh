#!/data/data/com.termux/files/usr/bin/bash

cd "$HOME/nia-capital-os" || exit 1

echo "=================================="
echo "NIA-EVO Daily Executive Report"
echo "Generated: $(date)"
echo "=================================="

./roadmap/tracker.sh

echo
echo "Health:"
curl -fs http://localhost:3000/health || echo "Health endpoint unavailable"

echo
echo "Sending email..."

# msmtp configuration must already exist
{
echo "Subject: NIA-EVO Daily Report $(date +%F)"
echo "To: your-email@example.com"
echo
./roadmap/tracker.sh
} | msmtp your-email@example.com

echo "Report complete."
