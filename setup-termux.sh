#!/bin/bash
# Termux Setup Script for Nia-EVO
set -e
echo "=========================================="
echo "  Nia-EVO: Termux Setup Script"
echo "=========================================="
echo ""
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'
echo -e "${YELLOW}[1/7] Updating Termux packages...${NC}"
apt update && apt upgrade -y
echo -e "${YELLOW}[2/7] Installing Python, Node.js, and Git...${NC}"
apt install -y python python-pip nodejs git
echo -e "${YELLOW}[3/7] Setting up Python virtual environment...${NC}"
if [ ! -d "backend/venv" ]; then
    python -m venv backend/venv
fi
source backend/venv/bin/activate
echo -e "${YELLOW}[4/7] Installing Python dependencies...${NC}"
cd backend
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
cd ..
echo -e "${YELLOW}[5/7] Installing Node dependencies...${NC}"
npm install
echo -e "${YELLOW}[6/7] Setting up environment variables...${NC}"
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file (update with your credentials)${NC}"
fi
echo -e "${YELLOW}[7/7] Initializing backend app package...${NC}"
touch backend/app/__init__.py
echo ""
echo -e "${GREEN}=========================================="
echo "  ✓ Setup Complete!"
echo "==========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Edit .env with your credentials"
echo "2. Run: bash start.sh"