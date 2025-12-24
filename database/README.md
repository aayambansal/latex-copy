# Database Migrations & Scripts

## SQL Migrations

### Initial Setup

1. **`supabase-migration.sql`** - Initial Supabase schema
   - Creates `users` table
   - Sets up indexes and RLS policies
   - Run this first in Supabase SQL Editor

2. **`add-password-column.sql`** - Add password support
   - Adds `hashed_password` column to existing table
   - Run this if you've already run the initial migration

3. **`add-user-to-supabase.sql`** - Create test user
   - Creates user: `aayambansal@gmail.com` / `aayam`
   - Run after setting up the schema

## User Creation Scripts

- `create-user.js` - Node.js script to create users (requires MongoDB connection)
- `create-test-user.mjs` - ES module version
- `create-user-mongo.js` - MongoDB shell script

## Usage

### Supabase Setup

1. Run `supabase-migration.sql` in Supabase SQL Editor
2. Run `add-password-column.sql` (if needed)
3. Run `add-user-to-supabase.sql` to create test user

### MongoDB User Creation

The test user is already created in MongoDB. To create additional users, you can:

1. Use the MongoDB shell:
```bash
docker exec mongo mongosh inkvell
```

2. Or use the Node.js scripts (requires proper environment setup)

## Test User Credentials

- **Email:** `aayambansal@gmail.com`
- **Password:** `aayam`

