-- PostgreSQL SQL equivalent for prisma/schema.prisma
CREATE TYPE user_role AS ENUM ('ADMIN', 'CLIENT');
CREATE TYPE subscription_plan AS ENUM ('FREE', 'PREMIUM');

CREATE TABLE country (
  id SERIAL PRIMARY KEY,
  code VARCHAR(3) UNIQUE NOT NULL,
  name VARCHAR(100) UNIQUE NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE states (
  id SERIAL PRIMARY KEY,
  "countryId" INT NOT NULL REFERENCES country(id),
  name VARCHAR(120) NOT NULL,
  code VARCHAR(10),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("countryId", name)
);
CREATE INDEX idx_states_country ON states("countryId");
CREATE INDEX idx_states_name ON states(name);

CREATE TABLE districts (
  id SERIAL PRIMARY KEY,
  "stateId" INT NOT NULL REFERENCES states(id),
  name VARCHAR(120) NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("stateId", name)
);
CREATE INDEX idx_district_state ON districts("stateId");
CREATE INDEX idx_district_name ON districts(name);

CREATE TABLE sub_districts (
  id SERIAL PRIMARY KEY,
  "districtId" INT NOT NULL REFERENCES districts(id),
  name VARCHAR(120) NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("districtId", name)
);
CREATE INDEX idx_sub_district_district ON sub_districts("districtId");
CREATE INDEX idx_sub_district_name ON sub_districts(name);

CREATE TABLE villages (
  id BIGSERIAL PRIMARY KEY,
  "countryId" INT NOT NULL REFERENCES country(id),
  "stateId" INT NOT NULL REFERENCES states(id),
  "districtId" INT NOT NULL REFERENCES districts(id),
  "subDistrictId" INT NOT NULL REFERENCES sub_districts(id),
  name VARCHAR(160) NOT NULL,
  normalized VARCHAR(160) NOT NULL,
  "postalCode" VARCHAR(12),
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("subDistrictId", normalized)
);
CREATE INDEX idx_village_state ON villages("stateId");
CREATE INDEX idx_village_district ON villages("districtId");
CREATE INDEX idx_village_subdistrict ON villages("subDistrictId");
CREATE INDEX idx_village_normalized ON villages(normalized);
CREATE INDEX idx_village_name ON villages(name);

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email VARCHAR(180) UNIQUE NOT NULL,
  name VARCHAR(120) NOT NULL,
  "passwordHash" TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'CLIENT',
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_users_role ON users(role);

CREATE TABLE api_keys (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "keyPrefix" VARCHAR(16) NOT NULL,
  "keyHash" TEXT NOT NULL,
  "secretHash" TEXT NOT NULL,
  name VARCHAR(80) NOT NULL,
  "isRevoked" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "revokedAt" TIMESTAMPTZ,
  "lastUsedAt" TIMESTAMPTZ
);
CREATE INDEX idx_api_keys_user ON api_keys("userId");
CREATE INDEX idx_api_keys_prefix ON api_keys("keyPrefix");
CREATE INDEX idx_api_keys_revoked ON api_keys("isRevoked");

CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  "userId" TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan subscription_plan NOT NULL DEFAULT 'FREE',
  "requestsPerDay" INT NOT NULL DEFAULT 5000,
  "startedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "expiresAt" TIMESTAMPTZ
);
CREATE INDEX idx_subscriptions_plan ON subscriptions(plan);

CREATE TABLE api_logs (
  id BIGSERIAL PRIMARY KEY,
  "userId" TEXT REFERENCES users(id) ON DELETE SET NULL,
  "apiKeyId" TEXT REFERENCES api_keys(id) ON DELETE SET NULL,
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  "statusCode" INT NOT NULL,
  "durationMs" INT NOT NULL,
  query JSONB,
  "villageId" BIGINT REFERENCES villages(id) ON DELETE SET NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_api_logs_created_at ON api_logs("createdAt");
CREATE INDEX idx_api_logs_user ON api_logs("userId");
CREATE INDEX idx_api_logs_api_key ON api_logs("apiKeyId");
CREATE INDEX idx_api_logs_endpoint ON api_logs(endpoint);
