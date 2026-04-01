# Elastic Beanstalk / single host: nginx :80 → SPA + /api → Nest on :3000
# Build: docker build -t app .
# Run:  docker run -p 80:80 --env-file backend/.env -e FRONTEND_ORIGIN=https://your-domain.com ...

# --- Frontend (Vite) ---
FROM node:22-alpine AS frontend-build
WORKDIR /fe

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Vite reads VITE_* from frontend/.env at build time (file must exist in deploy zip; not committed).
COPY frontend/ ./
COPY frontend/.env ./.env

RUN npm run build

# --- Backend (Nest) ---
FROM node:22-bookworm-slim AS backend-build
WORKDIR /be

COPY backend/package.json backend/package-lock.json ./
COPY backend/prisma ./prisma/
RUN npm ci

COPY backend/ ./
RUN npx prisma generate && npm run build

# --- Runtime: nginx + supervisord + Node ---
FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends nginx supervisor \
  && rm -rf /var/lib/apt/lists/* \
  && rm -f /etc/nginx/sites-enabled/default \
  && rm -f /etc/nginx/conf.d/default.conf

WORKDIR /app

# Runtime env files (no secrets in git — copy real backend/.env into deploy/config/backend before zip if needed)
COPY deploy/config /app/config

# Nest loads /app/.env (AppConfigModule). Pack backend/.env in the EB bundle, or rely on EB environment properties only (then keep a minimal /app/.env that passes validation).
COPY backend/.env /app/.env

COPY --from=backend-build /be/node_modules ./node_modules
COPY --from=backend-build /be/dist ./dist
COPY --from=backend-build /be/package.json ./
COPY --from=backend-build /be/prisma ./prisma

COPY --from=frontend-build /fe/dist /var/www/html

COPY deploy/nginx-eb.conf /etc/nginx/sites-available/default
RUN ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

COPY deploy/supervisord-app.conf /etc/supervisor/conf.d/app.conf

COPY deploy/generate-frontend-config.js /generate-frontend-config.js

COPY deploy/docker-entrypoint.sh /docker-entrypoint.sh
# Windows CRLF breaks shebang on Linux (exec: no such file or directory)
RUN tr -d '\r' < /docker-entrypoint.sh > /tmp/ep.sh \
  && mv /tmp/ep.sh /docker-entrypoint.sh \
  && chmod +x /docker-entrypoint.sh

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 80

# Invoke via sh so a bad shebang/CRLF cannot break container start (e.g. EB)
ENTRYPOINT ["/bin/sh", "/docker-entrypoint.sh"]
