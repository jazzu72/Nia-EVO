-- infra/postgres/init.sql
-- NIA-EVO database initialization
-- Runs once on first container start

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create application role with minimal privileges
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'nia_app') THEN
    CREATE ROLE nia_app WITH LOGIN PASSWORD 'sovereign';
  END IF;
END
$$;

GRANT CONNECT ON DATABASE nia_evo TO nia_app;
GRANT USAGE ON SCHEMA public TO nia_app;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO nia_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO nia_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE ON TABLES TO nia_app;

-- Audit log: revoke DELETE and UPDATE to make it truly append-only
-- (Applied after schema creation by PostgresService)
