-- file_description: migration to add name column to hazo_users table
-- This migration adds a name text field to store user's full name

-- Add name column (nullable, as existing users may not have a name)
ALTER TABLE hazo_users 
ADD COLUMN name TEXT;

