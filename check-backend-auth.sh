#!/bin/bash

# Script to check backend configuration for authentication issues
# This script will examine backend logs and configuration for authentication requirements

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
    error "This script must be run as root. Try 'sudo ./check-backend-auth.sh'"
fi

log "Checking backend configuration for authentication issues..."

# Configuration variables
PROJECT_DIR="/opt/around-the-us"

# Step 1: Check PM2 logs for authentication errors
log "Checking PM2 logs for authentication errors..."
if command -v pm2 &> /dev/null; then
    pm2 logs around-backend --lines 50 | grep -i -C 3 'auth\|401\|token\|jwt\|login\|signin' > "$PROJECT_DIR/logs/auth-errors.log" || true
    if [ -s "$PROJECT_DIR/logs/auth-errors.log" ]; then
        log "Authentication-related entries found in PM2 logs"
        cat "$PROJECT_DIR/logs/auth-errors.log"
    else
        log "No authentication-related entries found in PM2 logs"
    fi
else
    warning "PM2 is not installed, cannot check logs"
fi

# Step 2: Check backend code for authentication middleware
log "Checking backend code for authentication middleware..."
if [ -f "$PROJECT_DIR/backend/app.js" ]; then
    grep -n -C 5 'auth\|jwt\|token\|middleware\|bcrypt' "$PROJECT_DIR/backend/app.js" > "$PROJECT_DIR/logs/auth-code-check.log" || true
    if [ -s "$PROJECT_DIR/logs/auth-code-check.log" ]; then
        log "Authentication middleware or related code found in app.js"
        cat "$PROJECT_DIR/logs/auth-code-check.log"
    else
        log "No obvious authentication middleware found in app.js"
    fi
else
    warning "Backend app.js file not found at $PROJECT_DIR/backend/app.js"
fi

# Step 3: Check for routes that might not require authentication
log "Checking for public routes in backend..."
if [ -d "$PROJECT_DIR/backend/routes" ]; then
    grep -rn 'signin\|signup\|login\|register' "$PROJECT_DIR/backend/routes" > "$PROJECT_DIR/logs/public-routes.log" || true
    if [ -s "$PROJECT_DIR/logs/public-routes.log" ]; then
        log "Potential public routes found (signin/signup):"
        cat "$PROJECT_DIR/logs/public-routes.log"
    else
        log "No obvious public routes found in route files"
    fi
else
    warning "Backend routes directory not found at $PROJECT_DIR/backend/routes"
fi

# Step 4: Test specific API endpoints
log "Testing specific API endpoints..."
if command -v curl &> /dev/null; then
    log "Testing /signin endpoint..."
    curl -s -o /dev/null -w '%{http_code}
' http://localhost:3000/signin || warning "Failed to connect to /signin"
    log "Testing /signup endpoint..."
    curl -s -o /dev/null -w '%{http_code}
' http://localhost:3000/signup || warning "Failed to connect to /signup"
else
    warning "curl is not installed, cannot test API endpoints"
fi

log "Backend authentication check complete."
log "Based on the 401 response from the API, it's likely that your application requires authentication for all endpoints."
log "This is a common security practice in Express.js applications using JWT (JSON Web Tokens)."
log "Recommendations:"
log "1. Check if there are public endpoints like /signin or /signup that don't require authentication."
log "2. You may need to register or login first to obtain a valid token."
log "3. If this is a development environment, you could temporarily disable authentication in your backend code."
log "4. Review the logs and code snippets shown above for more details on the authentication mechanism."
