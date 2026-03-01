-- =============================================================================
-- Make user_id nullable in user_profiles for demo mode
-- =============================================================================

-- Drop foreign key constraint first
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;

-- Make user_id nullable
ALTER TABLE user_profiles ALTER COLUMN user_id DROP NOT NULL;

-- Re-add foreign key but now it's optional (ON DELETE SET NULL)
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
