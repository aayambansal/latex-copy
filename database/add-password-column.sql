-- Add password column to existing users table
-- Run this in your Supabase SQL Editor if you've already run the initial migration

-- Add hashed_password column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS hashed_password TEXT;

-- Create index on hashed_password for faster lookups (optional)
CREATE INDEX IF NOT EXISTS idx_users_hashed_password ON users(hashed_password) 
WHERE hashed_password IS NOT NULL;

-- Update the RLS policy to allow service role to manage passwords
-- (The existing policy should already cover this, but this ensures it)
DROP POLICY IF EXISTS "Service role can manage all users" ON users;

CREATE POLICY "Service role can manage all users"
  ON users
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'hashed_password';

