#!/bin/bash

# Script to fix Nginx authentication issues
# This script will check and remove any unintended basic auth configurations

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
    error "This script must be run as root. Try 'sudo ./fix-nginx-auth.sh'"
fi

log "Checking Nginx configuration for authentication issues..."

# Check Nginx configuration files for auth_basic directives
CONFIG_FILES="/etc/nginx/sites-available/* /etc/nginx/conf.d/*"
AUTH_FOUND=false

for file in $CONFIG_FILES; do
    if [ -f "$file" ]; then
        if grep -q "auth_basic" "$file"; then
            log "Authentication directive found in $file"
            AUTH_FOUND=true
            # Comment out auth_basic lines
            sed -i 's/\s*auth_basic\s\+[^;]*;/#&/' "$file"
            log "Commented out auth_basic directive in $file"
        fi
    fi
done

if [ "$AUTH_FOUND" = false ]; then
    log "No authentication directives found in Nginx configuration"
    log "Checking if .htpasswd file exists..."
    if [ -f "/etc/nginx/.htpasswd" ]; then
        mv /etc/nginx/.htpasswd /etc/nginx/.htpasswd.backup
        log "Moved .htpasswd file to backup"
    fi
    warning "Authentication issue might be caused by browser cache or another issue"
    warning "Try clearing browser cache or accessing from incognito mode"
fi

# Test Nginx configuration
log "Testing Nginx configuration..."
nginx -t || error "Nginx configuration test failed"

# Reload Nginx
log "Reloading Nginx..."
systemctl reload nginx || error "Failed to reload Nginx"

log "Nginx authentication fix completed!"
log "Please try accessing the website again."
log "If the issue persists, try clearing your browser cache or using incognito mode."
