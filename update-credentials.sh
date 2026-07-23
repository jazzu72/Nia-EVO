#!/bin/bash

echo "Enter your Twilio Account SID (starts with AC):"
read ACCT_SID

echo "Enter your Twilio Auth Token:"
read AUTH_TOKEN

echo "Enter your Twilio Phone Number (+1XXXXXXXXXX):"
read PHONE

# Update .env
cd ~/nia-capital-os

# Backup old .env
cp .env .env.backup

# Update credentials
sed -i "s/TWILIO_ACCOUNT_SID=.*/TWILIO_ACCOUNT_SID=$ACCT_SID/" .env
sed -i "s/TWILIO_AUTH_TOKEN=.*/TWILIO_AUTH_TOKEN=$AUTH_TOKEN/" .env
sed -i "s/TWILIO_PHONE_NUMBER=.*/TWILIO_PHONE_NUMBER=$PHONE/" .env

echo ""
echo "✅ Updated .env with new credentials"
echo ""
echo "Verify:"
grep "TWILIO" .env

