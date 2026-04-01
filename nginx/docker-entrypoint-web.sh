#!/bin/sh
set -e
node /generate-frontend-config.js /usr/share/nginx/html/config.js /app/config/frontend
exec nginx -g "daemon off;"
