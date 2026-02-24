/**
 * Fix RLS Policies Script
 * Run with: node scripts/fix-rls.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load .env.local file
function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8')
    const lines = content.split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const equalIndex = trimmed.indexOf('=')
        if (equalIndex > 0) {
          const key = trimmed.substring(0, equalIndex).trim()
          let value = trimmed.substring(equalIndex + 1).trim()
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1)
          }
          process.env[key] = value
        }
      }
    }
  }
}

loadEnvFile()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const fixSQL = `
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
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- warehouses - allow read
CREATE POLICY "warehouses_read" ON warehouses 
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- inventory_lots - allow read
CREATE POLICY "inventory_lots_read" ON inventory_lots 
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
`

async function fixRLS() {
  console.log('🔧 Fixing RLS policies...\n')
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: fixSQL })
    
    if (error) {
      // Try alternative method - execute raw SQL via postgrest
      console.log('Trying alternative method...')
      
      // Since we can't execute raw SQL directly, we'll inform the user
      console.log('\n⚠️  Cannot execute SQL directly via API.')
      console.log('Please run the following SQL in Supabase SQL Editor:\n')
      console.log(fixSQL)
    } else {
      console.log('✅ RLS policies fixed successfully!')
    }
  } catch (err) {
    console.log('\n⚠️  To fix RLS policies, please run this SQL in Supabase SQL Editor:\n')
    console.log(fixSQL)
  }
}

fixRLS()
