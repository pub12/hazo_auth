-- file_description: migration to add app_user_data column to hazo_users table
-- Adds app_user_data column for storing custom application-specific user data as JSON

-- Add app_user_data column (nullable, stores JSON as TEXT)
-- This field allows consuming applications to store arbitrary user metadata
-- without requiring additional schema changes
ALTER TABLE hazo_users
ADD COLUMN app_user_data TEXT;
