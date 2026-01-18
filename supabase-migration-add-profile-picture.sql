-- Migration: Add profile_picture column to user_settings
-- Run this in Supabase SQL Editor

-- Add profile_picture column
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- Add comment
COMMENT ON COLUMN user_settings.profile_picture IS 'Base64 encoded profile picture image (compressed to <500KB)';
