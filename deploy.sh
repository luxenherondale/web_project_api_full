#!/bin/bash

# Deployment script for Around the US project on Debian server

# Color output functions
print_progress() {
  echo -e "\033[32m[PROGRESS]\033[0m $1"
}

print_success() {
  echo -e "\033[32m[SUCCESS]\033[0m $1"
}

print_error() {
  echo -e "\033[31m[ERROR]\033[0m $1"
}

# File to store completed steps
COMPLETED_STEPS_FILE="/opt/around-the-us/completed_steps.txt"

# Function to check if a step is completed
is_step_completed() {
  local step=$1
  if [ -f "$COMPLETED_STEPS_FILE" ] && grep -q "^$step$" "$COMPLETED_STEPS_FILE"; then
    return 0
  fi
  return 1
}

# Function to mark a step as completed
mark_step_completed() {
  local step=$1
  mkdir -p /opt/around-the-us
  echo "$step" >> "$COMPLETED_STEPS_FILE"
}

# Update system
if is_step_completed "system_update"; then
  print_success "System update already completed. Skipping."
else
  print_progress "Updating system packages..."
  apt update && apt upgrade -y
  if [ $? -ne 0 ]; then
    print_error "System update failed. Exiting."
    exit 1
  fi
  print_success "System updated."
  mark_step_completed "system_update"
fi

# Install Node.js 20.x (LTS)
if is_step_completed "nodejs_install"; then
  print_success "Node.js already installed. Skipping."
else
  print_progress "Installing Node.js 20.x..."
  apt install -y curl
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt install -y nodejs
  if [ $? -ne 0 ]; then
    print_error "Node.js installation failed. Exiting."
    exit 1
  fi
  print_success "Node.js installed."
  mark_step_completed "nodejs_install"
fi

# Install MongoDB 7.0
if is_step_completed "mongodb_install"; then
  print_success "MongoDB already installed. Skipping."
else
  print_progress "Installing MongoDB 7.0..."
  apt install -y gnupg
  curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg
  echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/debian bookworm/mongodb-org/7.0 main" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
  apt update
  apt install -y mongodb-org
  if [ $? -ne 0 ]; then
    print_error "MongoDB installation failed. Exiting."
    exit 1
  fi
  systemctl start mongod
  systemctl enable mongod
  print_success "MongoDB installed and started."
  mark_step_completed "mongodb_install"
fi

# Create project directory
if is_step_completed "project_directory"; then
  print_success "Project directory already created. Skipping."
else
  print_progress "Creating project directory..."
  mkdir -p /opt/around-the-us
  if [ $? -ne 0 ]; then
    print_error "Failed to create project directory. Exiting."
    exit 1
  fi
  print_success "Project directory created."
  mark_step_completed "project_directory"
fi

# Install git if not already installed
if is_step_completed "git_install"; then
  print_success "Git already installed. Skipping."
else
  print_progress "Installing Git..."
  apt install -y git
  if [ $? -ne 0 ]; then
    print_error "Git installation failed. Exiting."
    exit 1
  fi
  print_success "Git installed."
  mark_step_completed "git_install"
fi

# Clone repositories
print_progress "Cloning backend repository..."
rm -rf /opt/around-the-us
git clone https://github.com/luxenherondale/web_project_api_full.git /opt/around-the-us
if [ $? -ne 0 ]; then
  print_error "Backend clone failed. Exiting."
  exit 1
fi
if [ ! -f "/opt/around-the-us/backend/package.json" ]; then
  print_error "package.json not found in cloned repository's backend folder. Check if the repository URL is correct. Exiting."
  exit 1
fi
print_success "Backend repository cloned."
mark_step_completed "backend_clone"

# Install backend dependencies
if is_step_completed "backend_dependencies"; then
  print_success "Backend dependencies already installed. Skipping."
else
  print_progress "Installing backend dependencies..."
  cd /opt/around-the-us/backend
  npm install
  if [ $? -ne 0 ]; then
    print_error "Backend dependencies installation failed. Exiting."
    exit 1
  fi
  print_success "Backend dependencies installed."
  mark_step_completed "backend_dependencies"
fi

# Configure environment variables
if is_step_completed "env_config"; then
  print_success "Environment variables already configured. Skipping."
else
  print_progress "Configuring environment variables..."
  echo "NODE_ENV=production" > /opt/around-the-us/backend/.env
  echo "PORT=3000" >> /opt/around-the-us/backend/.env
  echo "MONGO_URI=mongodb://localhost/aroundb" >> /opt/around-the-us/backend/.env
  echo "JWT_SECRET=your-secret-key-here" >> /opt/around-the-us/backend/.env
  print_success "Environment variables configured."
  mark_step_completed "env_config"
fi

# Create ecosystem.config.js for PM2 if it doesn't exist
if is_step_completed "pm2_config"; then
  print_success "PM2 configuration already created. Skipping."
else
  print_progress "Creating PM2 configuration..."
  if [ ! -f "/opt/around-the-us/backend/ecosystem.config.js" ]; then
    cat > /opt/around-the-us/backend/ecosystem.config.js <<EOL
module.exports = {
  apps: [{
    name: "around-backend",
    script: "./app.js",
    instances: "max",
    exec_mode: "cluster",
    watch: false,
    env: {
      NODE_ENV: "production"
    }
  }]
};
EOL
  fi
  print_success "PM2 configuration created."
  mark_step_completed "pm2_config"
fi

# Install PM2 for process management
if is_step_completed "pm2_install"; then
  print_success "PM2 already installed. Skipping."
else
  print_progress "Installing PM2..."
  npm install -g pm2
  if [ $? -ne 0 ]; then
    print_error "PM2 installation failed. Exiting."
    exit 1
  fi
  print_success "PM2 installed."
  mark_step_completed "pm2_install"
fi

# Start backend with PM2
if is_step_completed "backend_start"; then
  print_success "Backend server already started. Skipping."
else
  print_progress "Starting backend server with PM2..."
  cd /opt/around-the-us/backend
  pm2 start ecosystem.config.js --name "around-backend"
  if [ $? -ne 0 ]; then
    print_error "Backend server start failed. Exiting."
    exit 1
  fi
  print_success "Backend server started."
  mark_step_completed "backend_start"
fi

# Install Nginx
if is_step_completed "nginx_install"; then
  print_success "Nginx already installed. Skipping."
else
  print_progress "Installing Nginx..."
  apt install -y nginx
  if [ $? -ne 0 ]; then
    print_error "Nginx installation failed. Exiting."
    exit 1
  fi
  print_success "Nginx installed."
  mark_step_completed "nginx_install"
fi

# Configure Nginx for API and frontend
if is_step_completed "nginx_config"; then
  print_success "Nginx already configured. Skipping."
else
  print_progress "Configuring Nginx..."
  cat > /etc/nginx/sites-available/around-api <<EOL
server {
    listen 80;
    server_name api.backaround.mooo.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL

  cat > /etc/nginx/sites-available/around-frontend <<EOL
server {
    listen 80;
    server_name www.arounadaly.mooo.com arounadaly.mooo.com;

    root /var/www/html;
    index index.html;

    location / {
        try_files \$uri \$uri/ =404;
    }
}
EOL

  ln -s /etc/nginx/sites-available/around-api /etc/nginx/sites-enabled/
  ln -s /etc/nginx/sites-available/around-frontend /etc/nginx/sites-enabled/

  nginx -t
  if [ $? -ne 0 ]; then
    print_error "Nginx configuration test failed. Exiting."
    exit 1
  fi

  systemctl restart nginx
  print_success "Nginx configured and restarted."
  mark_step_completed "nginx_config"
fi

# Update existing Nginx configurations for domain typo
print_progress "Updating Nginx configurations for domain typo..."
for file in /etc/nginx/sites-available/around-api /etc/nginx/sites-enabled/around-api /etc/nginx/sites-available/around-frontend /etc/nginx/sites-enabled/around-frontend; do
  if [ -f "$file" ]; then
    sed -i 's/aroundadaly.mooo.com/arounadaly.mooo.com/g' "$file"
    sed -i 's/api.arounadaly.mooo.com/api.backaround.mooo.com/g' "$file"
  fi
done
systemctl restart nginx
print_success "Nginx configurations updated for domain typo."

# Configure SSL for domains
if is_step_completed "ssl_config"; then
  print_success "SSL already configured. Skipping."
else
  print_progress "Configuring SSL for domains..."
  certbot --nginx -d api.backaround.mooo.com --non-interactive --agree-tos --email adalyherondale9@gmail.com
  if [ $? -ne 0 ]; then
    print_error "SSL configuration for API domain failed. This is likely due to missing DNS records. Please set up A or AAAA records for api.backaround.mooo.com pointing to your server's IP address. Skipping SSL setup for now."
  else
    certbot --nginx -d www.arounadaly.mooo.com -d arounadaly.mooo.com --non-interactive --agree-tos --email adalyherondale9@gmail.com
    if [ $? -ne 0 ]; then
      print_error "SSL configuration for frontend domains failed. This is likely due to missing DNS records. Please set up A or AAAA records for www.arounadaly.mooo.com and arounadaly.mooo.com pointing to your server's IP address. Skipping SSL setup for now."
    else
      print_success "SSL configured for all domains."
      mark_step_completed "ssl_config"
    fi
  fi
fi

# Final check
print_progress "Performing final check..."
if curl -s -f http://localhost:3000/health > /dev/null; then
  print_success "Backend API is running correctly."
else
  print_error "Backend API is not responding. Check logs with 'pm2 logs around-backend'."
fi

if curl -s -f https://api.backaround.mooo.com/health > /dev/null; then
  print_success "API domain is accessible with SSL."
else
  print_error "API domain is not accessible. Check Nginx and Certbot configurations."
fi

print_success "Deployment completed. Check above for any errors."
