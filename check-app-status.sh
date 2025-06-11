#!/bin/bash

# Script to check application status and configuration
# This script will verify the status of all components of the Around the U.S. application

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
    error "This script must be run as root. Try 'sudo ./check-app-status.sh'"
fi

log "Checking status of Around the U.S. application components..."

# Configuration variables
FRONTEND_DOMAIN="www.arounadaly.mooo.com"
API_DOMAIN="api.backaround.mooo.com"
PROJECT_DIR="/opt/around-the-us"

# Step 1: Check Nginx status
log "Checking Nginx status..."
systemctl status nginx --no-pager || warning "Nginx service is not running"

# Step 2: Check PM2 and backend status
log "Checking PM2 and backend application status..."
if command -v pm2 &> /dev/null; then
    pm2 list | grep -i "around" || warning "No application named 'around' found in PM2"
else
    warning "PM2 is not installed"
fi

# Step 3: Check MongoDB status
log "Checking MongoDB status..."
if systemctl status mongod --no-pager 2>/dev/null; then
    log "MongoDB (mongod) is running"
elif systemctl status mongodb --no-pager 2>/dev/null; then
    log "MongoDB (mongodb) is running"
else
    ps aux | grep mongod || warning "MongoDB process not found"
    warning "MongoDB service is not running"
fi

# Step 4: Check frontend files
log "Checking frontend files..."
if [ -d "$PROJECT_DIR/frontend/dist" ]; then
    log "Frontend build directory exists"
    ls -l "$PROJECT_DIR/frontend/dist" | head -n 5
else
    warning "Frontend build directory does not exist at $PROJECT_DIR/frontend/dist"
fi

# Step 5: Check API connectivity
log "Checking API connectivity on localhost..."
if command -v curl &> /dev/null; then
    curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || warning "Failed to connect to API on localhost:3000"
else
    warning "curl is not installed, cannot test API connectivity"
fi

# Step 6: Check domain resolution
log "Checking domain resolution..."
if command -v dig &> /dev/null; then
    dig +short $FRONTEND_DOMAIN | grep -v "^;" || warning "Failed to resolve $FRONTEND_DOMAIN"
    dig +short $API_DOMAIN | grep -v "^;" || warning "Failed to resolve $API_DOMAIN"
else
    warning "dig is not installed, cannot check domain resolution"
fi

# Step 7: Check Nginx configuration for domains
log "Checking Nginx configuration for domains..."
find /etc/nginx -type f -name "*.conf" -exec grep -l "$FRONTEND_DOMAIN" {} \; || warning "Frontend domain not found in Nginx config"
find /etc/nginx -type f -name "*.conf" -exec grep -l "$API_DOMAIN" {} \; || warning "API domain not found in Nginx config"

log "Application status check complete."
log "If any warnings were shown above, they may indicate the source of the 401 Unauthorized error."
log "Additional steps to try:"
log "1. Clear browser cache or try incognito mode"
log "2. Check if the application itself requires authentication (check backend logs in $PROJECT_DIR/logs)"
log "3. Verify DNS settings for your domain"
log "4. Ensure SSL certificates are properly configured with Certbot"
