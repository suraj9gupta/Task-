# India Village API (Production-Grade SaaS Monorepo)

A complete SaaS platform for hierarchical India geographical data:

**Country → State → District → Sub-District → Village**

## Folder Structure

```text
.
├── backend/                 # Node.js + Express + Prisma REST API
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── vercel.json
├── frontend/                # React + Vite + Tailwind dashboards/demo client
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── dashboard/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── vercel.json
├── importer/                # Python data ingestion pipeline
│   ├── import_villages.py
│   └── requirements.txt
└── docs/
    ├── api-docs.md
    ├── deployment.md
    └── sql-schema.sql
```

## 1) Database Design (PostgreSQL + Prisma)

- Normalized to 3NF with dedicated hierarchy tables + auth/billing/logging entities.
- `villages.normalized` is indexed for case-insensitive search/autocomplete.
- API operations are tracked in `api_logs` with endpoint, status, and latency.

### Prisma Schema
See: `backend/prisma/schema.prisma`

### SQL Equivalent
See: `docs/sql-schema.sql`

### Relationship Summary
- `country 1:n states`
- `states 1:n districts`
- `districts 1:n sub_districts`
- `sub_districts 1:n villages`
- `users 1:n api_keys`
- `users 1:1 subscriptions`
- `users/api_keys/villages 1:n api_logs`

## 2) Data Import System (Python)

`importer/import_villages.py`:
- Loads CSV/XLSX via pandas
- Cleans and normalizes text fields
- Drops null/invalid rows and duplicates
- Upserts hierarchy entities with caches
- Batch inserts villages via `execute_values`
- Logs to both file + stdout

Run:
```bash
cd importer
pip install -r requirements.txt
export DATABASE_URL=postgresql://...
export DATASET_PATH=./india_villages.csv
python import_villages.py
```

## 3) Backend API (Node.js + Express)

Base URL: `http://localhost:3000/api/v1`

Public data endpoints (API key protected):
- `GET /states`
- `GET /states/:id/districts`
- `GET /districts/:id/subdistricts`
- `GET /subdistricts/:id/villages`
- `GET /search?q=`
- `GET /autocomplete?q=`

Auth:
- `POST /auth/register`
- `POST /auth/login`

B2B:
- `POST /api-keys/create`
- `DELETE /api-keys/revoke`
- `GET /api-keys`

Admin:
- `GET /admin/users`
- `GET /admin/logs`
- `GET /admin/analytics`

### Security/Scalability Features
- JWT auth + role-based admin gate
- API key + secret hashing (SHA-256)
- Password hashing with bcrypt
- Helmet + CORS + global IP limiter
- Redis-backed per-key daily quotas (5k/50k)
- Redis response caching middleware
- Pagination for large list endpoints

### Standard Response Envelope
```json
{
  "success": true,
  "data": [],
  "meta": {
    "responseTime": "18ms",
    "rateLimit": { "limit": 5000, "remaining": 4990 }
  }
}
```

## 4) Frontend Dashboard (React + Vite + Tailwind)

Implemented modules:
1. **Admin Dashboard**
   - user list
   - API logs viewer
   - analytics chart (Recharts)
2. **B2B Client Dashboard**
   - API key create/list
   - plan limits display
3. **Data Browser**
   - chained filters State → District → Sub-District → Village
4. **Demo Client Form**
   - village autocomplete + autofill hierarchy

Tech used:
- React Query (server-state)
- Zustand (auth/API key store)
- Axios interceptors (JWT + API credentials + error handling)

## 5) Setup (Step-by-Step)

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run prisma:generate
npx prisma db push
npm run seed
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Importer
```bash
cd importer
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python import_villages.py
```

## 6) Deployment Guide

See full guide: `docs/deployment.md`

- Backend: Vercel serverless (`backend/vercel.json`)
- DB: Neon PostgreSQL
- Cache: Upstash Redis
- Frontend: Vercel static

## 7) API Documentation + Sample Payloads

See: `docs/api-docs.md`

## 8) Best Practices & Improvements

- Add distributed tracing (OpenTelemetry)
- Add background queue for async analytics aggregation
- Add WAF/abuse detection
- Move from simple API key secret model to rotating key versions
- Add contract tests and load tests (k6)
- Add geo-spatial search with PostGIS for radius queries

