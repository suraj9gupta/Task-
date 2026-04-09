# API Documentation

Base URL: `http://localhost:3000/api/v1`

## Auth Endpoints
### POST `/auth/register`
```json
{
  "name": "Acme Team",
  "email": "ops@acme.com",
  "password": "StrongPass@123"
}
```

### POST `/auth/login`
```json
{
  "email": "ops@acme.com",
  "password": "StrongPass@123"
}
```

## API Key Endpoints (JWT)
- `GET /api-keys`
- `POST /api-keys/create`
- `DELETE /api-keys/revoke`

## Public Data Endpoints (API Key + Secret headers)
Headers:
- `x-api-key: iva_...`
- `x-api-secret: ivs_...`

- `GET /states`
- `GET /states/:id/districts`
- `GET /districts/:id/subdistricts`
- `GET /subdistricts/:id/villages?page=1&limit=25`
- `GET /search?q=lucknow`
- `GET /autocomplete?q=luck`

## Admin Endpoints (JWT admin)
- `GET /admin/users`
- `GET /admin/logs`
- `GET /admin/analytics`

## Sample Success Response
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Bihar" }
  ],
  "meta": {
    "responseTime": "12ms",
    "rateLimit": { "limit": 5000, "remaining": 4999 }
  }
}
```

## Sample Error Response
```json
{
  "success": false,
  "error": {
    "message": "Daily rate limit exceeded",
    "status": 429
  },
  "meta": {
    "rateLimit": { "limit": 5000, "remaining": 0 }
  }
}
```
