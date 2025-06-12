#!/bin/bash

# Color output functions
print_progress() {
  echo -e "\033[34m[PROGRESS] $1\033[0m"
}

print_success() {
  echo -e "\033[32m[SUCCESS] $1\033[0m"
}

print_error() {
  echo -e "\033[31m[ERROR] $1\033[0m"
}

# Debug and Test Script for Around the US Deployment
print_progress "Starting debug and test for Around the US deployment on the server..."

# Check basic network connectivity
print_progress "Checking basic network connectivity from the server..."
ping -c 4 8.8.8.8
if [ $? -eq 0 ]; then
  print_success "Network connectivity is working (can ping Google's DNS server)."
else
  print_error "Network connectivity issue: Cannot ping Google's DNS server (8.8.8.8). Check your server's internet connection."
fi

# Check DNS resolution
print_progress "Checking DNS resolution from the server..."
if command -v dig &> /dev/null; then
  dig +short google.com
  if [ $? -eq 0 ]; then
    print_success "DNS resolution is working (can resolve google.com using dig)."
  else
    print_error "DNS resolution issue: Cannot resolve google.com using dig. Check your server's DNS settings in /etc/resolv.conf."
  fi
elif command -v host &> /dev/null; then
  host google.com
  if [ $? -eq 0 ]; then
    print_success "DNS resolution is working (can resolve google.com using host)."
  else
    print_error "DNS resolution issue: Cannot resolve google.com using host. Check your server's DNS settings in /etc/resolv.conf."
  fi
else
  ping -c 1 google.com
  if [ $? -eq 0 ]; then
    print_success "DNS resolution is working (can ping google.com as fallback test)."
  else
    print_error "DNS resolution issue: Cannot ping google.com. Check your server's DNS settings in /etc/resolv.conf."
  fi
fi

# Check server IP and listening ports
print_progress "Checking server IP and listening ports..."
ip addr show | grep inet
print_progress "Displaying open ports on the server..."
netstat -tuln | grep -E '80|443|3000'
if [ $? -eq 0 ]; then
  print_success "Ports are open for web services."
else
  print_error "No relevant ports (80, 443, 3000) are open. Services may not be running or firewall may be blocking them."
  print_error "Checking firewall status..."
  ufw status
fi

# Check Node.js version
print_progress "Checking Node.js version..."
node -v
if [ $? -eq 0 ]; then
  print_success "Node.js is installed correctly."
else
  print_error "Node.js is not installed or not functioning correctly."
fi

# Check MongoDB status
print_progress "Checking MongoDB status..."
systemctl is-active --quiet mongod
if [ $? -eq 0 ]; then
  print_success "MongoDB is running."
else
  print_error "MongoDB is not running. Attempting to start..."
  systemctl start mongod
  if [ $? -eq 0 ]; then
    print_success "MongoDB started successfully."
  else
    print_error "Failed to start MongoDB. Check logs with 'journalctl -u mongod' for details."
  fi
fi

# Check Nginx status
print_progress "Checking Nginx status..."
systemctl is-active --quiet nginx
if [ $? -eq 0 ]; then
  print_success "Nginx is running."
else
  print_error "Nginx is not running. Attempting to start..."
  systemctl start nginx
  if [ $? -eq 0 ]; then
    print_success "Nginx started successfully."
  else
    print_error "Failed to start Nginx. Check logs with 'journalctl -u nginx' for details."
  fi
fi

# Check PM2 status
print_progress "Checking PM2 status..."
pm2 status
if [ $? -eq 0 ]; then
  print_success "PM2 is installed and running."
else
  print_error "PM2 is not functioning correctly. Attempting to restart..."
  pm2 resurrect
  if [ $? -eq 0 ]; then
    print_success "PM2 resurrected successfully."
  else
    print_error "Failed to resurrect PM2. Check if PM2 is installed with 'npm install -g pm2'."
  fi
fi

# Check Backend API
print_progress "Checking Backend API..."
if curl -s -f http://localhost:3000/health > /dev/null; then
  print_success "Backend API is running correctly on localhost:3000."
else
  print_error "Backend API is not responding on localhost:3000."
  print_error "This could be due to authentication requirements for the health endpoint. Checking if server is responding at all..."
  if curl -s -f http://localhost:3000/ > /dev/null; then
    print_success "Server responds on localhost:3000, but health endpoint may require authentication or may not be configured correctly."
  else
    print_error "Server does not respond on localhost:3000 at all."
    print_error "Checking if anything is listening on port 3000..."
    netstat -tuln | grep 3000
    if [ $? -eq 0 ]; then
      print_success "Something is listening on port 3000, issue might be with the application."
    else
      print_error "Nothing is listening on port 3000. The backend may have failed to start or bind to the port."
    fi
    print_error "Attempting to access other potential endpoints that may not require authentication..."
    if curl -s -f http://localhost:3000/api/health > /dev/null; then
      print_success "Found accessible endpoint at /api/health without authentication."
    elif curl -s -f http://localhost:3000/status > /dev/null; then
      print_success "Found accessible endpoint at /status without authentication."
    else
      print_error "No accessible endpoints found on localhost:3000. Application may require authentication for all endpoints."
    fi
  fi
  print_error "Checking PM2 logs for backend issues..."
  pm2 logs around-backend --lines 30
  print_error "Please review the logs above for specific errors. Common issues include missing dependencies, incorrect environment variables, or MongoDB connection issues."
  print_error "Attempting to restart backend..."
  cd /opt/around-the-us/backend
  pm2 restart ecosystem.config.js
  if [ $? -eq 0 ]; then
    print_success "Backend restarted. Rechecking API..."
    sleep 5
    if curl -s -f http://localhost:3000/health > /dev/null; then
      print_success "Backend API is now running correctly after restart."
    elif curl -s -f http://localhost:3000/ > /dev/null; then
      print_success "Server responds after restart, but health endpoint may require authentication."
    elif curl -s -f http://localhost:3000/api/health > /dev/null; then
      print_success "Found accessible endpoint at /api/health after restart."
    elif curl -s -f http://localhost:3000/status > /dev/null; then
      print_success "Found accessible endpoint at /status after restart."
    else
      print_error "Backend API still not responding after restart. Please check logs for persistent issues."
    fi
  else
    print_error "Failed to restart backend. Check PM2 configuration and logs."
  fi
fi

# Check API domain accessibility internally
print_progress "Checking API domain accessibility from server..."
if curl -s -f http://api.backaround.mooo.com/health > /dev/null; then
  print_success "API domain is accessible internally without SSL."
elif curl -s -f http://api.backaround.mooo.com/ > /dev/null; then
  print_success "API root endpoint is accessible internally without SSL, but health may require authentication."
elif curl -s -f http://api.backaround.mooo.com/api/health > /dev/null; then
  print_success "API /api/health endpoint is accessible internally without SSL."
else
  print_error "API domain is not accessible internally. This could be due to Nginx configuration or DNS issues."
  print_error "Checking Nginx configuration..."
  nginx -t
  if [ $? -eq 0 ]; then
    print_success "Nginx configuration is valid."
  else
    print_error "Nginx configuration has errors. Please review the output above and fix configuration files in /etc/nginx/sites-available/."
  fi
  print_error "Checking hosts file for local domain mapping..."
  cat /etc/hosts | grep backaround
fi

# Check frontend domain accessibility internally
print_progress "Checking frontend domain accessibility from server..."
if curl -s -f http://www.arounadaly.mooo.com > /dev/null; then
  print_success "Frontend domain is accessible internally without SSL."
else
  print_error "Frontend domain is not accessible internally. This could be due to Nginx configuration or missing frontend files."
  print_error "Check if frontend files are deployed to /var/www/html."
  ls -l /var/www/html
fi

print_success "Debug and test completed. Review the output above for detailed status and troubleshooting information."
