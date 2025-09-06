# Database Setup Instructions

## 1. Create Environment File

Create a `.env.local` file in `apps/web/` with the following content:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/synergysphere

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key-here

# Environment
NODE_ENV=development
```

## 2. Set Up PostgreSQL Database

1. Install PostgreSQL on your system
2. Create a database named `synergysphere`
3. Update the `DATABASE_URL` with your actual credentials

## 3. Test Database Connection

Visit: `http://localhost:3001/api/test-connection`

This will test if your database connection is working.

## 4. Create Database Tables

Visit: `http://localhost:3001/api/setup-db`

This will create all the required tables in your database.

## 5. Test Authentication

After setting up the database, try:
1. Sign up with a new account
2. Login with the created account
3. Check if the dashboard shows your name

## Troubleshooting

- Make sure PostgreSQL is running
- Check that the database exists
- Verify the DATABASE_URL is correct
- Check the server console for detailed error messages
