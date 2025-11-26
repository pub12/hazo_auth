-- file_description: migration to add url_on_logon column to hazo_users table
-- This migration adds a url_on_logon text field to store the URL to redirect to after successful login

-- Add url_on_logon column (nullable, as this is an optional redirect URL)
ALTER TABLE hazo_users 
ADD COLUMN url_on_logon TEXT;


