#!/bin/sh
set -e

# Replace placeholder with actual environment variable
CONFIG_FILE=/usr/share/nginx/html/config.js

if [ -n "$API_URL" ]; then
  sed -i "s|__API_URL__|$API_URL|g" $CONFIG_FILE
  echo "Config updated with API_URL: $API_URL"
else
  # Default fallback
  sed -i "s|__API_URL__|/api|g" $CONFIG_FILE
  echo "Warning: API_URL not set, using default /api"
fi

# Start nginx
exec nginx -g 'daemon off;'
