# PostgreSQL Setup Guide

## Option 1: Install PostgreSQL Locally

### Windows:
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the password you set for the `postgres` user
4. Open pgAdmin or command line

### macOS:
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql

# Create database
createdb synergysphere
```

### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres createdb synergysphere
```

## Option 2: Use Docker (Recommended)

```bash
# Run PostgreSQL in Docker
docker run --name synergysphere-db \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=synergysphere \
  -p 5432:5432 \
  -d postgres:15

# Check if running
docker ps
```

## Option 3: Use Online Database (Neon, Supabase, etc.)

1. Sign up for a free account at https://neon.tech/ or https://supabase.com/
2. Create a new project
3. Copy the connection string
4. Use it as your DATABASE_URL

## Test Your Database

After setting up PostgreSQL, test the connection:

1. Visit: `http://localhost:3001/api/debug-db`
2. This will show you what's configured and what's missing
3. Fix any issues shown in the debug output

## Common Issues:

- **Port 5432 in use**: Change port in connection string
- **Authentication failed**: Check username/password
- **Database doesn't exist**: Create the `synergysphere` database
- **Connection refused**: Make sure PostgreSQL is running
