#!/bin/bash

# Continuation deployment script for Around the U.S. web application
# This script continues the deployment process from MongoDB setup onwards

# Exit on any error
set -e

# Color codes for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Log function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Check if script is run as root
if [ "$(id -u)" -ne 0 ]; then
    error "This script must be run as root. Try 'sudo ./continue-deploy.sh'"
fi

# Configuration variables
FRONTEND_DOMAIN="www.arounadaly.mooo.com"
API_DOMAIN="api.backaround.mooo.com"
SERVER_IP="34.136.30.19"
PROJECT_DIR="/opt/around-the-us"
JWT_SECRET=$(openssl rand -hex 32) # Generate a secure random JWT secret

log "Continuing deployment of Around the U.S. web application"

# Step 1: Install MongoDB if not already installed
log "Installing MongoDB..."
# Check if MongoDB is already installed
if ! command -v mongod &> /dev/null; then
    log "MongoDB not found, installing..."
    # Import the MongoDB public GPG key
    apt-get update
    apt-get install -y gnupg curl
    curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg --dearmor
    # Add MongoDB repository based on Ubuntu version
    UBUNTU_VERSION=$(lsb_release -sc)
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu $UBUNTU_VERSION/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
    # Update package list
    apt-get updatea
    # Install MongoDB
    apt-get install -y mongodb-org || error "Failed to install MongoDB"
else
    log "MongoDB already installed"
fi

# Step 2: Setup MongoDB service
log "Setting up MongoDB service..."
# Enable and start MongoDB service, trying different service names
if systemctl enable mongod 2>/dev/null; then
    systemctl start mongod || error "Failed to start MongoDB (mongod) service"
elif systemctl enable mongodb 2>/dev/null; then
    systemctl start mongodb || error "Failed to start MongoDB (mongodb) service"
else
    log "Systemd service not found, attempting manual start..."
    mongod --fork --logpath /var/log/mongodb.log --dbpath /var/lib/mongodb || error "Failed to start MongoDB manually"
fi

# Step 3: Setup firewall
log "Configuring firewall..."
apt-get install -y ufw || error "Failed to install UFW"
ufw allow ssh
ufw allow http
ufw allow https
ufw allow 27017/tcp # MongoDB port
ufw --force enable || warning "Failed to enable UFW"

# Step 4: Setup automatic updates
log "Setting up automatic security updates..."
apt-get install -y unattended-upgrades || error "Failed to install unattended-upgrades"
dpkg-reconfigure -plow unattended-upgrades

# Step 5: Setup logrotate for application logs
log "Setting up log rotation..."
cat > /etc/logrotate.d/around-the-us << EOF
$PROJECT_DIR/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 root root
}
EOF

# Final status check
log "Checking deployment status..."
echo "MongoDB status:"
if systemctl status mongod --no-pager 2>/dev/null; then
    echo "MongoDB (mongod) is running"
elif systemctl status mongodb --no-pager 2>/dev/null; then
    echo "MongoDB (mongodb) is running"
else
    ps aux | grep mongod || warning "MongoDB process not found"
    warning "MongoDB service check failed"
fi

echo "Nginx status:"
systemctl status nginx --no-pager || warning "Nginx service check failed"

echo "PM2 status:"
pm2 list || warning "PM2 status check failed"

echo "Firewall status:"
ufw status || warning "UFW status check failed"

log "Deployment continuation completed successfully!"
log "Frontend: https://$FRONTEND_DOMAIN"
log "API: https://$API_DOMAIN"
log "JWT Secret: $JWT_SECRET (Keep this secure!)"

# Save deployment info
cat > $PROJECT_DIR/deployment-info.txt << EOF
Deployment Information
=====================
Date: $(date)
Frontend URL: https://$FRONTEND_DOMAIN
API URL: https://$API_DOMAIN
JWT Secret: $JWT_SECRET

Important Paths:
- Project Directory: $PROJECT_DIR
- Frontend Build: $PROJECT_DIR/frontend/dist
- Backend: $PROJECT_DIR/backend
- PM2 Logs: $PROJECT_DIR/logs

Services:
- MongoDB: Running on default port (27017)
- Nginx: Configured for both frontend and API
- PM2: Managing the backend application

To check status:
- PM2: pm2 list
- Nginx: systemctl status nginx
- MongoDB: systemctl status mongod
EOF

log "Deployment information saved to $PROJECT_DIR/deployment-info.txt"
