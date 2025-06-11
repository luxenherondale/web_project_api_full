#!/bin/bash

# Diagnostic script to troubleshoot Nginx authentication issues
# This script will thoroughly check all Nginx configurations for authentication settings

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
    error "This script must be run as root. Try 'sudo ./diagnose-nginx-auth.sh'"
fi

log "Starting comprehensive Nginx authentication diagnosis..."

# Create a temporary directory for storing diagnostic information
temp_dir=$(mktemp -d)
log "Temporary diagnostic files will be stored in: $temp_dir"

# Step 1: Check Nginx version and basic configuration
log "Checking Nginx version and configuration..."
nginx -v 2>&1 | tee "$temp_dir/nginx-version.txt"
nginx -t 2>&1 | tee "$temp_dir/nginx-config-test.txt"

# Step 2: Search all Nginx configuration files for authentication directives
log "Searching for authentication directives in all Nginx configuration files..."
ALL_CONFIG_FILES=$(find /etc/nginx -type f -name "*.conf" -o -name "nginx.conf")
AUTH_FOUND=false

echo "Authentication directive search results:" > "$temp_dir/auth-directives.txt"
for file in $ALL_CONFIG_FILES; do
    if [ -f "$file" ]; then
        if grep -n -i "auth" "$file" || grep -n -i "htpasswd" "$file"; then
            log "Authentication-related directive found in $file"
            AUTH_FOUND=true
            echo "File: $file" >> "$temp_dir/auth-directives.txt"
            grep -n -i -C 3 "auth" "$file" >> "$temp_dir/auth-directives.txt" || true
            grep -n -i -C 3 "htpasswd" "$file" >> "$temp_dir/auth-directives.txt" || true
            echo "---" >> "$temp_dir/auth-directives.txt"
            # Comment out auth_basic and related lines
            sed -i 's/\s*auth_basic\s\+[^;]*;/#&/' "$file"
            sed -i 's/\s*auth_basic_user_file\s\+[^;]*;/#&/' "$file"
            log "Commented out authentication directives in $file"
        fi
    fi
done

if [ "$AUTH_FOUND" = false ]; then
    log "No authentication directives found in any Nginx configuration files"
    warning "The authentication prompt might be caused by browser cache or application-level authentication"
    warning "Try clearing browser cache or accessing from incognito mode"
fi

# Step 3: Check for .htpasswd files
log "Searching for .htpasswd files..."
find /etc/nginx -name ".htpasswd*" -type f > "$temp_dir/htpasswd-files.txt"
if [ -s "$temp_dir/htpasswd-files.txt" ]; then
    log ".htpasswd files found, renaming them to prevent authentication"
    while IFS= read -r file; do
        mv "$file" "$file.backup-$(date +%s)"
        log "Renamed $file to prevent authentication"
    done < "$temp_dir/htpasswd-files.txt"
else
    log "No .htpasswd files found"
fi

# Step 4: Check active Nginx configuration
log "Dumping active Nginx configuration..."
nginx -T > "$temp_dir/nginx-active-config.txt" 2>&1 || warning "Failed to dump active configuration"

grep -n -i "auth" "$temp_dir/nginx-active-config.txt" > "$temp_dir/nginx-active-auth.txt" || true
if [ -s "$temp_dir/nginx-active-auth.txt" ]; then
    log "Authentication directives found in active configuration"
    cat "$temp_dir/nginx-active-auth.txt"
else
    log "No authentication directives in active configuration"
fi

# Step 5: Check Nginx access and error logs for authentication requests
log "Checking Nginx logs for authentication requests..."
NGINX_LOG_DIR="/var/log/nginx"
if [ -d "$NGINX_LOG_DIR" ]; then
    grep -i "401" "$NGINX_LOG_DIR/access.log" | tail -n 10 > "$temp_dir/nginx-401-access.txt" || true
    grep -i "auth" "$NGINX_LOG_DIR/error.log" | tail -n 10 > "$temp_dir/nginx-auth-error.txt" || true
    if [ -s "$temp_dir/nginx-401-access.txt" ] || [ -s "$temp_dir/nginx-auth-error.txt" ]; then
        log "Authentication-related log entries found"
        echo "Access log entries (401 status):" >> "$temp_dir/nginx-log-summary.txt"
        cat "$temp_dir/nginx-401-access.txt" >> "$temp_dir/nginx-log-summary.txt"
        echo "\nError log entries (auth mentions):" >> "$temp_dir/nginx-log-summary.txt"
        cat "$temp_dir/nginx-auth-error.txt" >> "$temp_dir/nginx-log-summary.txt"
    else
        log "No authentication-related entries found in logs"
    fi
else
    warning "Nginx log directory not found at $NGINX_LOG_DIR"
fi

# Step 6: Test Nginx configuration after changes
log "Testing Nginx configuration after changes..."
nginx -t 2>&1 | tee "$temp_dir/nginx-config-test-after.txt" || error "Nginx configuration test failed after changes"

# Step 7: Reload Nginx to apply changes
log "Reloading Nginx to apply changes..."
systemctl reload nginx || error "Failed to reload Nginx"

# Step 8: Check if application is running
log "Checking application status..."
if command -v pm2 &> /dev/null; then
    pm2 list | grep -i "around" > "$temp_dir/pm2-status.txt" || true
    if [ -s "$temp_dir/pm2-status.txt" ]; then
        log "Backend application appears to be running:"
        cat "$temp_dir/pm2-status.txt"
    else
        warning "Backend application not found in PM2 list"
    fi
else
    warning "PM2 not found, cannot check backend status"
fi

# Step 9: Create diagnostic summary
log "Creating diagnostic summary..."
cat > "$temp_dir/diagnostic-summary.txt" << EOF
Nginx Authentication Issue Diagnostic Summary
=====================================
Date: $(date)

1. Nginx Version:
$(cat "$temp_dir/nginx-version.txt")

2. Authentication Directives Found:
$(if [ "$AUTH_FOUND" = true ]; then echo "YES, authentication directives were found and commented out"; else echo "NO authentication directives found"; fi)

3. .htpasswd Files:
$(if [ -s "$temp_dir/htpasswd-files.txt" ]; then echo "Found and renamed"; cat "$temp_dir/htpasswd-files.txt"; else echo "None found"; fi)

4. Application Status:
$(if [ -s "$temp_dir/pm2-status.txt" ]; then cat "$temp_dir/pm2-status.txt"; else echo "Could not determine status"; fi)

5. Recommendations:
- If authentication directives were found, they have been commented out and Nginx reloaded
- If the issue persists, try clearing browser cache or using incognito mode
- Check if the application itself is requesting authentication (check backend code)
- Review full configuration details in $temp_dir for more information
EOF

log "Diagnosis complete. Summary available at $temp_dir/diagnostic-summary.txt"
log "Please review the summary for details and recommendations."
log "If the issue persists after running this script, the authentication might be coming from the application itself."

# Print the summary to console
cat "$temp_dir/diagnostic-summary.txt"
