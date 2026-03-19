#!/bin/sh
set -e

# Replace placeholder with actual environment variable
CONFIG_FILE=/usr/share/nginx/html/config.js
INDEX_FILE=/usr/share/nginx/html/index.html

if [ -n "$API_URL" ]; then
  sed -i "s|__API_URL__|$API_URL|g" $CONFIG_FILE
  echo "Config updated with API_URL: $API_URL"

  if printf '%s' "$API_URL" | grep -Eq '^https?://'; then
    API_CONNECT_SRC=$(printf '%s' "$API_URL" | sed -E 's#^(https?://[^/]+).*$#\1#')
  else
    API_CONNECT_SRC=""
  fi
else
  # Default fallback
  sed -i "s|__API_URL__|/api|g" $CONFIG_FILE
  echo "Warning: API_URL not set, using default /api"
  API_CONNECT_SRC=""
fi

sed -i "s|__API_CONNECT_SRC__|$API_CONNECT_SRC|g" $INDEX_FILE

# Start nginx
exec nginx -g 'daemon off;'
