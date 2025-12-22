-- file_description: migration to add user type support to hazo_users table
-- Adds user_type column for storing the user's assigned type key from configuration

-- Add user_type column (nullable, stores the type key from config)
-- Examples: 'admin', 'client', 'agent', 'staff'
ALTER TABLE hazo_users
ADD COLUMN user_type TEXT;

-- Create index for fast lookups/filtering by user type
CREATE INDEX IF NOT EXISTS idx_hazo_users_user_type ON hazo_users(user_type);
