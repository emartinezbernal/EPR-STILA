-- Add password column to user_profiles for demo mode authentication
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS password VARCHAR(255);
