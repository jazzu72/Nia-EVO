#!/bin/bash

# Setup Banner
echo "==================="
echo "   Termux Setup   "
echo "==================="

echo "Updating package lists..."
apt update && apt upgrade -y

echo "Creating directories..."
mkdir -p ~/my_project/{src,bin,venv}

echo "Setting up Python virtual environment..."
python3 -m venv ~/my_project/venv
source ~/my_project/venv/bin/activate

echo "Installing pip dependencies..."
pip install --upgrade pip
pip install requests flask

echo "Installing npm dependencies..."
apt install npm -y
npm install express

echo "Creating .env file with credentials..."
cat <<EOL > ~/my_project/.env
# Credentials
DATABASE_URL='your_database_url'
API_KEY='your_api_key'
EOL

echo "Creating startup scripts..."
echo -e "#!/bin/bash\necho 'Starting the project...'" > ~/my_project/start.sh
echo -e "#!/bin/bash\necho 'Stopping the project...'" > ~/my_project/stop.sh
echo -e "#!/bin/bash\necho 'Restarting the project...'" > ~/my_project/restart.sh
chmod +x ~/my_project/start.sh ~/my_project/stop.sh ~/my_project/restart.sh

echo "Creating quick reference guide..."
cat <<EOL > ~/my_project/TERMUX_QUICKSTART.md
# Termux Quickstart Guide

## Installation
1. Clone the repository.
2. Run the setup script using `bash final-setup.sh`.
3. Follow the prompts to complete setup.

## Startup Commands
- Start: `bash start.sh`
- Stop: `bash stop.sh`
- Restart: `bash restart.sh`
EOL

echo "Verifying setup..."
if [ -d ~/my_project/venv ] && [ -f ~/my_project/.env ]; then
    echo -e "\033[32mSetup completed successfully!\033[0m"
else
    echo -e "\033[31mSetup failed! Please check log for errors.\033[0m"
fi
