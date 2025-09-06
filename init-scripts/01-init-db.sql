-- Initialize SynergySphere Database
-- This script runs when the PostgreSQL container starts for the first time

-- Create the main database (already created by POSTGRES_DB)
-- Create additional schemas if needed
CREATE SCHEMA IF NOT EXISTS public;

-- Set timezone
SET timezone = 'UTC';

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE synergysphere TO synergysphere_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO synergysphere_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO synergysphere_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO synergysphere_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO synergysphere_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO synergysphere_user;
