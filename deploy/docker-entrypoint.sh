#!/bin/sh
set -e
# SPA: /config.js from /app/config/frontend file + process env (EB overrides file).
node /generate-frontend-config.js /var/www/html/config.js /app/config/frontend
exec supervisord -n -c /etc/supervisor/supervisord.conf
