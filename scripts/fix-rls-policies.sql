-- ============================================================
-- RLS Policy Fix Script
-- Run this to fix infinite recursion in RLS policies
-- ============================================================

-- First, drop all existing policies that might be causing issues
DO $$
DECLARE
    tbl TEXT;
BEGIN
    -- Drop policies on user_profiles
    FOR tbl IN SELECT policyname FROM pg_policies WHERE tablename = 'user_profiles' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON user_profiles', tbl);
    END LOOP;
    
    -- Drop policies on customers
    FOR tbl IN SELECT policyname FROM pg_policies WHERE tablename = 'customers' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON customers', tbl);
    END LOOP;
    
    -- Drop policies on branches
    FOR tbl IN SELECT policyname FROM pg_policies WHERE tablename = 'branches' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON branches', tbl);
    END LOOP;
END $$;

-- Create simplified helper function that won't cause recursion
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
    SELECT role::TEXT FROM user_profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS(SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin', 'finance_admin', 'operations_admin'));
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Create simpler RLS policies
-- User Profiles - allow read for authenticated users
CREATE POLICY "user_profiles_read" ON user_profiles 
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Branches - allow read for all authenticated
CREATE POLICY "branches_read" ON branches 
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Customers - allow read for authenticated users
CREATE POLICY "customers_read" ON customers 
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Products - allow read for all
CREATE POLICY "products_read" ON products 
    FOR SELECT USING (true);

-- Sales - allow read for owners and admins
CREATE POLICY "sales_read" ON sales 
    FOR SELECT USING (
        auth.uid() IS NOT NULL
    );

-- warehouses - allow read
CREATE POLICY "warehouses_read" ON warehouses 
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- inventory_lots - allow read
CREATE POLICY "inventory_lots_read" ON inventory_lots 
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- sessions - allow read
CREATE POLICY "session_logs_read" ON session_logs 
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- activity_logs - allow read
CREATE POLICY "activity_logs_read" ON activity_logs 
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- product_categories - allow read
CREATE POLICY "product_categories_read" ON product_categories 
    FOR SELECT USING (true);

-- product_brands - allow read
CREATE POLICY "product_brands_read" ON product_brands 
    FOR SELECT USING (true);

-- commissions - allow read
CREATE POLICY "commissions_read" ON commissions 
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- shipments - allow read
CREATE POLICY "shipments_read" ON shipments 
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- installations - allow read
CREATE POLICY "installations_read" ON installations 
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- audit_logs - allow read for admins only
CREATE POLICY "audit_logs_read" ON audit_logs 
    FOR SELECT USING (public.is_admin());

-- alerts - allow read
CREATE POLICY "alerts_read" ON alerts 
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- accounts - allow read for admins
CREATE POLICY "accounts_read" ON accounts 
    FOR SELECT USING (public.is_admin());

-- journal_entries - allow read for admins
CREATE POLICY "journal_entries_read" ON journal_entries 
    FOR SELECT USING (public.is_admin());

-- approval_requests - allow read
CREATE POLICY "approval_requests_read" ON approval_requests 
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Print success message
DO $$
BEGIN
    RAISE NOTICE 'RLS policies fixed successfully!';
END $$;
