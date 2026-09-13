#!/data/data/com.termux/files/usr/bin/bash

echo "=================================================="
echo "☁️  NIA-EVO: AWS CREDENTIAL AUDIT                  "
echo "=================================================="

cd ~/nia-capital-os || exit

echo -e "\n[1] CREDENTIAL SOURCE:"
aws configure list 2>&1

echo -e "\n[2] PROFILES:"
aws configure list-profiles 2>&1

echo -e "\n[3] CONFIGURATION FILES:"
if [ -f ~/.aws/config ]; then
  echo "  ✅ config: FOUND"
else
  echo "  ❌ config: MISSING"
fi

if [ -f ~/.aws/credentials ]; then
  echo "  ✅ credentials: FOUND"
else
  echo "  ❌ credentials: MISSING"
fi

echo -e "\n[4] IDENTITY TEST (STS):"
# This will safely fail and output the error if credentials are bad
aws sts get-caller-identity 2>&1 || echo "  ❌ AUTHENTICATION FAILED"

echo -e "\n=================================================="
echo "✅ AUDIT COMPLETE"
echo "=================================================="
