-- =============================================================================
-- User Profiles RLS Fix - Allow operations without authentication
-- =============================================================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "user_profiles_select" ON user_profiles;

-- Create permissive policies for demo mode (allow all operations)
CREATE POLICY "user_profiles_select" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "user_profiles_insert" ON user_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "user_profiles_update" ON user_profiles FOR UPDATE USING (true);
CREATE POLICY "user_profiles_delete" ON user_profiles FOR DELETE USING (true);

-- Insert demo users if table is empty
INSERT INTO user_profiles (id, user_id, role, first_name, last_name, email, phone, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    gen_random_uuid(),
    'admin'::user_role,
    'Admin',
    'User',
    'admin@stila.com',
    '55-1234-5678',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM user_profiles WHERE email = 'admin@stila.com');

INSERT INTO user_profiles (id, user_id, role, first_name, last_name, email, phone, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    gen_random_uuid(),
    'sales_user'::user_role,
    'Juan',
    'Pérez',
    'ventas@stila.com',
    '55-1234-5679',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM user_profiles WHERE email = 'ventas@stila.com');

INSERT INTO user_profiles (id, user_id, role, first_name, last_name, email, phone, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    gen_random_uuid(),
    'sales_manager'::user_role,
    'Maria',
    'Garcia',
    'gerente@stila.com',
    '55-1234-5680',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM user_profiles WHERE email = 'gerente@stila.com');

INSERT INTO user_profiles (id, user_id, role, first_name, last_name, email, phone, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    gen_random_uuid(),
    'installer'::user_role,
    'Carlos',
    'López',
    'installer@stila.com',
    '55-1234-5681',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM user_profiles WHERE email = 'installer@stila.com');
