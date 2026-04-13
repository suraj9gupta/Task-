# Deployment Guide

## Managed services
- PostgreSQL: Neon
- Redis: Upstash Redis
- Backend: Vercel (Node serverless)
- Frontend: Vercel static app

## Environment variables
### Backend
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `REDIS_URL`
- `CORS_ORIGIN`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

### Frontend
- `VITE_API_BASE_URL` (e.g. `https://api.example.com/api/v1`)

## Steps
1. Create Neon project and copy pooled Postgres URL.
2. Create Upstash Redis database and copy redis URL.
3. Deploy backend folder as Vercel project.
4. Set backend env variables in Vercel.
5. Run Prisma deploy commands:
   ```bash
   npx prisma generate
   npx prisma db push
   npm run seed
   ```
6. Deploy frontend folder as second Vercel project.
7. Set `VITE_API_BASE_URL` to backend deployment domain.
8. Validate `/health`, login flow, API key creation, and autocomplete request.

## Operational best practices
- Rotate JWT secret and API key secrets periodically.
- Configure Vercel analytics + logging sinks.
- Add incident alerts for latency > 100ms and 429 spikes.
- Run nightly import job for source geography updates.
