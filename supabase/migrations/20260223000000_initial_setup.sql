-- =============================================================================
-- ERP STILA - Simple Schema Setup
-- =============================================================================
-- This migration creates basic tables with simple RLS policies

-- Role hierarchy enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'super_admin', 'admin', 'finance_admin', 'operations_admin',
        'warehouse_admin', 'sales_manager', 'sales_user', 'installer', 'viewer'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Approval status
DO $$ BEGIN
    CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Sale status  
DO $$ BEGIN
    CREATE TYPE sale_status AS ENUM (
        'draft', 'confirmed', 'paid', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Payment status
DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'partial', 'paid', 'refunded', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Installation status
DO $$ BEGIN
    CREATE TYPE installation_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'on_hold');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Shipping status
DO $$ BEGIN
    CREATE TYPE shipping_status AS ENUM ('pending', 'preparing', 'shipped', 'in_transit', 'delivered', 'cancelled', 'returned');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Commission status
DO $$ BEGIN
    CREATE TYPE commission_status AS ENUM ('calculated', 'approved', 'paid', 'cancelled', 'adjusted');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Tables
CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL, name VARCHAR(255) NOT NULL, legal_name VARCHAR(255),
    rfc VARCHAR(13), address TEXT, city VARCHAR(100), state VARCHAR(100), zip_code VARCHAR(10),
    phone VARCHAR(20), email VARCHAR(255), is_active BOOLEAN DEFAULT true, is_warehouse BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    code VARCHAR(20) UNIQUE NOT NULL, name VARCHAR(255) NOT NULL, description TEXT, manager_id UUID,
    is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cost_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    code VARCHAR(20) UNIQUE NOT NULL, name VARCHAR(255) NOT NULL, type VARCHAR(50), budget DECIMAL(15,2),
    is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id), department_id UUID REFERENCES departments(id),
    role user_role NOT NULL DEFAULT 'viewer', employee_number VARCHAR(50),
    first_name VARCHAR(100) NOT NULL, last_name VARCHAR(100) NOT NULL, email VARCHAR(255),
    phone VARCHAR(20) UNIQUE NOT NULL, hire_date DATE, position VARCHAR(100), supervisor_id UUID REFERENCES user_profiles(id),
    commission_rate DECIMAL(5,4), commission_override JSONB, is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ, password_changed_at TIMESTAMPTZ, failed_login_attempts INT DEFAULT 0, locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), sku VARCHAR(50) UNIQUE NOT NULL, barcode VARCHAR(50),
    name VARCHAR(255) NOT NULL, description TEXT, category_id UUID, brand_id UUID,
    base_price DECIMAL(15,2) NOT NULL, cost_price DECIMAL(15,2), minimum_price DECIMAL(15,2), maximum_discount DECIMAL(5,4) DEFAULT 0,
    role_pricing JSONB, track_inventory BOOLEAN DEFAULT true, is_kit BOOLEAN DEFAULT false, kit_components JSONB,
    weight DECIMAL(10,3), dimensions JSONB, images JSONB, is_active BOOLEAN DEFAULT true, is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id), updated_by UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), parent_id UUID REFERENCES product_categories(id),
    code VARCHAR(20) UNIQUE NOT NULL, name VARCHAR(255) NOT NULL, description TEXT, commission_rate DECIMAL(5,4),
    is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code VARCHAR(20) UNIQUE NOT NULL, name VARCHAR(255) NOT NULL,
    description TEXT, logo_url TEXT, is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), branch_id UUID REFERENCES branches(id),
    code VARCHAR(20) UNIQUE NOT NULL, name VARCHAR(255) NOT NULL, address TEXT,
    is_active BOOLEAN DEFAULT true, is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), branch_id UUID REFERENCES branches(id),
    customer_number VARCHAR(50) UNIQUE, rfc VARCHAR(13), curp VARCHAR(18),
    name VARCHAR(255) NOT NULL, email VARCHAR(255), phone VARCHAR(20), phone_alt VARCHAR(20),
    street VARCHAR(255), exterior_number VARCHAR(20), interior_number VARCHAR(20), colony VARCHAR(100),
    city VARCHAR(100), state VARCHAR(100), municipality VARCHAR(100), zip_code VARCHAR(10), country VARCHAR(100) DEFAULT 'Mexico',
    business_name VARCHAR(255), tax_regime VARCHAR(100), credit_limit DECIMAL(15,2), credit_days INT, current_balance DECIMAL(15,2) DEFAULT 0,
    sales_rep_id UUID, is_active BOOLEAN DEFAULT true, is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(), created_by UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), branch_id UUID REFERENCES branches(id),
    sale_number VARCHAR(50) UNIQUE NOT NULL, sale_type VARCHAR(20) DEFAULT 'retail',
    customer_id UUID REFERENCES customers(id), sales_rep_id UUID,
    status sale_status DEFAULT 'draft', payment_status payment_status DEFAULT 'pending',
    subtotal DECIMAL(15,2) DEFAULT 0, tax_amount DECIMAL(15,2) DEFAULT 0, discount_amount DECIMAL(15,2) DEFAULT 0,
    discount_reason TEXT, discount_approved_by UUID, total DECIMAL(15,2) DEFAULT 0,
    payment_method VARCHAR(50), payment_reference VARCHAR(100), amount_paid DECIMAL(15,2) DEFAULT 0, change_given DECIMAL(15,2) DEFAULT 0,
    sale_date TIMESTAMPTZ DEFAULT NOW(), confirmed_at TIMESTAMPTZ, paid_at TIMESTAMPTZ, shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ, completed_at TIMESTAMPTZ, cancelled_at TIMESTAMPTZ,
    notes TEXT, internal_notes TEXT, cost_total DECIMAL(15,2), profit_margin DECIMAL(15,4),
    cfdi_required BOOLEAN DEFAULT false, cfdi_id UUID,
    created_by UUID REFERENCES auth.users(id), updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Simple RLS Policies
CREATE POLICY "branches_select" ON branches FOR SELECT USING (true);
CREATE POLICY "departments_select" ON departments FOR SELECT USING (true);
CREATE POLICY "cost_centers_select" ON cost_centers FOR SELECT USING (true);
CREATE POLICY "user_profiles_select" ON user_profiles FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "products_select" ON products FOR SELECT USING (true);
CREATE POLICY "product_categories_select" ON product_categories FOR SELECT USING (true);
CREATE POLICY "product_brands_select" ON product_brands FOR SELECT USING (true);
CREATE POLICY "warehouses_select" ON warehouses FOR SELECT USING (true);
CREATE POLICY "customers_select" ON customers FOR SELECT USING (true);
CREATE POLICY "sales_select" ON sales FOR SELECT USING (true);

-- Insert seed data
INSERT INTO branches (code, name, legal_name, rfc, address, city, state, zip_code, is_active)
VALUES ('STILA-HQ', 'STILA Headquarters', 'STILA SA DE CV', 'SMA123456ABC', 'Av. Principal 100', 'Mexico City', 'CDMX', '01000', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO product_categories (code, name, description, commission_rate)
VALUES 
    ('CAT-FURNITURE', 'Furniture', 'Office and home furniture', 0.05),
    ('CAT-ELECTRONICS', 'Electronics', 'Electronic devices', 0.03),
    ('CAT-APPLIANCES', 'Appliances', 'Home appliances', 0.04)
ON CONFLICT (code) DO NOTHING;

INSERT INTO product_brands (code, name, description)
VALUES 
    ('BRAND-HON', 'HON', 'Office furniture leader'),
    ('BRAND-SAMSUNG', 'Samsung', 'Electronics')
ON CONFLICT (code) DO NOTHING;
