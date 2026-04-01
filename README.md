# Піячок (final-task)

Full-stack app for discovering venues (“заклади”), meetups (“piyachok”), news, reviews, favorites, and an admin area. The UI is a React (Vite) SPA; the API is a NestJS service with Prisma and PostgreSQL. Production deployment can use the included multi-stage **Dockerfile** (nginx + Nest + static frontend).

## Repository layout

| Path | Description |
|------|-------------|
| `frontend/` | React 19, Redux Toolkit, React Router, Tailwind |
| `backend/` | NestJS 11, Prisma 7, JWT auth, S3-compatible storage |
| `deploy/` | nginx config, supervisord, entrypoint for Docker/EB |
| `postman/` | Postman collection for the REST API |
| `Dockerfile` | Single image: build SPA + API, run on port **80** |

## Prerequisites

- **Node.js** 20+ (22 recommended for Docker parity)
- **PostgreSQL** database
- **S3-compatible storage** (or MinIO) for images — required by the backend env validation

## Backend (`backend/`)

### Environment

Create `backend/.env` (see `backend/.env.example` if present) with at least:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Access token signing (min 32 chars) |
| `JWT_REFRESH_SECRET` | Refresh token signing (min 32 chars) |
| `FRONTEND_ORIGIN` | CORS origin (e.g. `http://localhost:5173`) |
| `AWS_BUCKET_NAME`, `AWS_REGION`, `AWS_ACCESS_KEY`, `AWS_SECRET_KEY`, `AWS_ENDPOINT` | Object storage for uploads |
| `PORT` | HTTP port (default `3000`) |
| `GOOGLE_CLIENT_ID` | Optional, for Google Sign-In |

`prisma generate` runs on `npm install` via `postinstall`.

### Commands

```bash
cd backend
npm ci
npx prisma migrate dev    # or prisma migrate deploy in CI
npm run start:dev         # http://localhost:3000
```

### Seed (optional)

Requires the same env as runtime (including AWS for seed images). Resets DB data and creates demo users and institutions.

```bash
npm run prisma:seed
```

Default seeded admin (if using project seed data): see `prisma/seed.ts` for emails; password is documented in seed logs.

### Production start

```bash
npm run build
npm run start:prod
```

Entrypoint after build: `node dist/src/main.js` (NodeNext output layout).

## Frontend (`frontend/`)

```bash
cd frontend
npm ci
npm run dev
```

Vite dev server (default `http://localhost:5173`). Set `VITE_*` variables in `frontend/.env` (see `frontend/.env.example`). The API base URL is configured for RTK Query (typically `/api` behind proxy or full URL in dev).

## Docker (single host)

From the repo root:

```bash
docker build -t piyachok-app .
docker run -p 80:80 --env-file backend/.env -e FRONTEND_ORIGIN=https://your-frontend-origin.example ...
```

nginx serves the SPA and proxies `/api` to Nest on port 3000 inside the container. Pack `frontend/.env` and `backend/.env` (or inject env) as required for build/runtime.

## API documentation (Postman)

Import **Postman Collection v2.1**:

- File: [`postman/Piyachok-API.postman_collection.json`](./postman/Piyachok-API.postman_collection.json)

Collection variables:

- `baseUrl` — default `http://localhost:3000`
- `accessToken` / `refreshToken` — filled automatically after **Auth → Login** (collection test script)

Protected routes expect header: `Authorization: Bearer {{accessToken}}`.

**Note:** Endpoints that upload files (`POST /institutions`, `PATCH /institutions/:id`, `POST /news`) use `multipart/form-data` in the app; in Postman use the **Body → form-data** tab and attach files where indicated.

## Admin API

Routes under `/admin/*` require a JWT for a user with role **ADMIN** (see Postman folder **Admin**).

## License

Private / educational use per your course rules.
