-- file_description: migration to add token_type column to hazo_refresh_tokens table for password reset functionality
-- This migration adds a token_type column to distinguish between refresh tokens and password reset tokens

-- Add token_type column with CHECK constraint
ALTER TABLE hazo_refresh_tokens 
ADD COLUMN token_type TEXT NOT NULL DEFAULT 'refresh' 
CHECK (token_type IN ('refresh', 'password_reset', 'email_verification'));

-- Create index on token_type for faster queries
CREATE INDEX IF NOT EXISTS idx_hazo_refresh_tokens_token_type ON hazo_refresh_tokens(token_type);

-- Create index on token_type and user_id for password reset token lookups
CREATE INDEX IF NOT EXISTS idx_hazo_refresh_tokens_user_type ON hazo_refresh_tokens(user_id, token_type);

