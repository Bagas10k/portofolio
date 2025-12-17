#!/bin/bash

# Setup Script for VPS Deployment
# Run this script on your VPS to fix permissions and folders

echo "Setting up Portfolio Web Permissions..."

# 1. Create necessary directories if they don't exist
mkdir -p data
mkdir -p assets/images/projects

# 2. Fix Permissions
# Assuming your web server user is 'www-data'. 
# typically on Ubuntu/Debian/Nginx/Apache it is www-data.
# If you are using CyberPanel, the user might be the website owner name.
# We will use 777 for data folders to be safe for now, or 775 if we knew the group.

echo "Fixing directory permissions..."
chmod -R 775 data
chmod -R 775 assets/images/projects

# Ensure JSON files exist and are writable
touch data/projects.json
touch data/skills.json
touch data/messages.json
touch data/profile.json

chmod 666 data/*.json

echo "Permissions fixed!"
echo "Make sure your web server (Nginx/Apache) has ownership of these files."
echo "Example: chown -R www-data:www-data /var/www/html"
