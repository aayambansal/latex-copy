-- Add test user to Supabase
-- Run this in your Supabase SQL Editor

INSERT INTO users (
  email,
  hashed_password,
  first_name,
  last_name,
  display_name,
  created_at,
  updated_at
) VALUES (
  'aayambansal@gmail.com',
  '$2b$12$ig7hL9ehsW2FeunNYI.6pu/rSjr3c0/R0wq71Vxm8an/v.kGYSSTC',
  'Aayam',
  'Bansal',
  'Aayam Bansal',
  NOW(),
  NOW()
)
ON CONFLICT (email) 
DO UPDATE SET
  hashed_password = EXCLUDED.hashed_password,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  display_name = EXCLUDED.display_name,
  updated_at = NOW();

-- Verify the user was added
SELECT id, email, first_name, last_name, created_at 
FROM users 
WHERE email = 'aayambansal@gmail.com';

