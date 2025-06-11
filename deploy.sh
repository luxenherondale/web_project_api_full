e#!/bin/bash

# Deployment script for Around the U.S. web application
# This script will install all dependencies and configure the server for deployment

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
    error "This script must be run as root. Try 'sudo ./deploy.sh'"
fi

# Configuration variables
FRONTEND_DOMAIN="www.arounadaly.mooo.com"
API_DOMAIN="api.backaround.mooo.com"
SERVER_IP="34.136.30.19"
PROJECT_DIR="/opt/around-the-us"
JWT_SECRET=$(openssl rand -hex 32) # Generate a secure random JWT secret

log "Starting deployment of Around the U.S. web application"
log "Frontend domain: $FRONTEND_DOMAIN"
log "API domain: $API_DOMAIN"
log "Server IP: $SERVER_IP"

# Step 1: Update system packages
log "Updating system packages..."
apt-get update && apt-get upgrade -y || error "Failed to update system packages"

# Step 2: Install required system dependencies
log "Installing system dependencies..."
apt-get install -y curl git build-essential nginx certbot python3-certbot-nginx mongodb || error "Failed to install system dependencies"

# Step 3: Install Node.js and npm
log "Installing Node.js and npm..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs || error "Failed to install Node.js"

# Check Node.js and npm versions
node_version=$(node -v)
npm_version=$(npm -v)
log "Node.js version: $node_version"
log "npm version: $npm_version"

# Step 4: Install PM2 globally
log "Installing PM2..."
npm install -g pm2 || error "Failed to install PM2"

# Step 5: Create project directory and clone repository
log "Setting up project directory..."
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

if [ -d ".git" ]; then
    log "Git repository already exists, pulling latest changes..."
    git pull
else
    log "Cloning project repository..."
    git clone https://github.com/luxenherondale/web_project_api_full.git .
fi

# Step 6: Setup backend
log "Setting up backend..."
cd $PROJECT_DIR/backend
npm install || error "Failed to install backend dependencies"

# Create .env file for backend
log "Creating .env file for backend..."
cat > .env << EOF
NODE_ENV=production
JWT_SECRET=$JWT_SECRET
EOF

# Step 7: Setup frontend
log "Setting up frontend..."
cd $PROJECT_DIR/frontend
npm install || error "Failed to install frontend dependencies"

# Build frontend
log "Building frontend..."
npm run build || error "Failed to build frontend"

# Step 8: Configure Nginx
log "Configuring Nginx..."

# Create Nginx configuration for frontend
cat > /etc/nginx/sites-available/frontend << EOF
server {
    listen 80;
    server_name $FRONTEND_DOMAIN;

    root $PROJECT_DIR/frontend/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
        expires max;
        log_not_found off;
    }
}
EOF

# Create Nginx configuration for API
cat > /etc/nginx/sites-available/api << EOF
server {
    listen 80;
    server_name $API_DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable sites by creating symbolic links
ln -sf /etc/nginx/sites-available/frontend /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/api /etc/nginx/sites-enabled/

# Remove default site if it exists
if [ -f /etc/nginx/sites-enabled/default ]; then
    rm /etc/nginx/sites-enabled/default
fi

# Test Nginx configuration
nginx -t || error "Nginx configuration test failed"

# Restart Nginx
systemctl restart nginx || error "Failed to restart Nginx"

# Step 9: Setup SSL with Certbot
log "Setting up SSL certificates with Certbot..."
certbot --nginx -d $FRONTEND_DOMAIN --non-interactive --agree-tos --email admin@$FRONTEND_DOMAIN || warning "Failed to setup SSL for frontend"
certbot --nginx -d $API_DOMAIN --non-interactive --agree-tos --email admin@$API_DOMAIN || warning "Failed to setup SSL for API"

# Step 10: Setup PM2 for backend
log "Setting up PM2 for backend..."
cd $PROJECT_DIR

# Copy ecosystem.config.js if it doesn't exist
if [ ! -f ecosystem.config.js ]; then
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: "around-backend",
      script: "./backend/app.js",
      watch: false,
      env: {
        NODE_ENV: "production",
        JWT_SECRET: "$JWT_SECRET"
      },
      instances: "max",
      exec_mode: "cluster",
      max_memory_restart: "300M",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      merge_logs: true,
      restart_delay: 3000,
      max_restarts: 10,
      autorestart: true,
    }
  ]
};
EOF
fi

# Create logs directory
mkdir -p $PROJECT_DIR/logs

# Start backend with PM2
log "Starting backend with PM2..."
pm2 start ecosystem.config.js || error "Failed to start backend with PM2"
pm2 save || error "Failed to save PM2 configuration"
pm2 startup || error "Failed to setup PM2 startup script"

# Step 11: Setup MongoDB
log "Setting up MongoDB..."
systemctl enable mongod || error "Failed to enable MongoDB service"
systemctl start mongod || error "Failed to start MongoDB service"

# Step 12: Setup firewall
log "Configuring firewall..."
apt-get install -y ufw || error "Failed to install UFW"
ufw allow ssh
ufw allow http
ufw allow https
ufw allow 27017/tcp # MongoDB port
ufw --force enable || warning "Failed to enable UFW"

# Step 13: Setup automatic updates
log "Setting up automatic security updates..."
apt-get install -y unattended-upgrades || error "Failed to install unattended-upgrades"
dpkg-reconfigure -plow unattended-upgrades

# Step 14: Setup logrotate for application logs
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
systemctl status mongod --no-pager || warning "MongoDB service check failed"

echo "Nginx status:"
systemctl status nginx --no-pager || warning "Nginx service check failed"

echo "PM2 status:"
pm2 list || warning "PM2 status check failed"

echo "Firewall status:"
ufw status || warning "UFW status check failed"

log "Deployment completed successfully!"
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
