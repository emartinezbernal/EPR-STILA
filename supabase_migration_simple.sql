-- ERP STILA - Simple Migration (no policies)
-- Run this in SQL Editor

-- 1. Create tables (without RLS policies since they might already exist)

-- Main tables
CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL, 
    name VARCHAR(255) NOT NULL, 
    legal_name VARCHAR(255),
    rfc VARCHAR(13), 
    address TEXT, 
    city VARCHAR(100), 
    state VARCHAR(100), 
    zip_code VARCHAR(10),
    phone VARCHAR(20), 
    email VARCHAR(255), 
    is_active BOOLEAN DEFAULT true, 
    is_warehouse BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(), 
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
    sku VARCHAR(50) UNIQUE NOT NULL, 
    barcode VARCHAR(50),
    name VARCHAR(255) NOT NULL, 
    description TEXT, 
    category_id UUID, 
    brand_id UUID,
    base_price DECIMAL(15,2) NOT NULL, 
    cost_price DECIMAL(15,2), 
    minimum_price DECIMAL(15,2), 
    maximum_discount DECIMAL(5,4) DEFAULT 0,
    role_pricing JSONB, 
    track_inventory BOOLEAN DEFAULT true, 
    is_kit BOOLEAN DEFAULT false, 
    kit_components JSONB,
    weight DECIMAL(10,3), 
    dimensions JSONB, 
    images JSONB, 
    is_active BOOLEAN DEFAULT true, 
    is_featured BOOLEAN DEFAULT false,
    stock INTEGER DEFAULT 0,
    minimum_stock INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(), 
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
    branch_id UUID REFERENCES branches(id),
    customer_number VARCHAR(50) UNIQUE, 
    rfc VARCHAR(13), 
    curp VARCHAR(18),
    name VARCHAR(255) NOT NULL, 
    email VARCHAR(255), 
    phone VARCHAR(20), 
    phone_alt VARCHAR(20),
    street VARCHAR(255), 
    exterior_number VARCHAR(20), 
    interior_number VARCHAR(20), 
    colony VARCHAR(100),
    city VARCHAR(100), 
    state VARCHAR(100), 
    municipality VARCHAR(100), 
    zip_code VARCHAR(10), 
    country VARCHAR(100) DEFAULT 'Mexico',
    business_name VARCHAR(255), 
    tax_regime VARCHAR(100), 
    credit_limit DECIMAL(15,2), 
    credit_days INT, 
    current_balance DECIMAL(15,2) DEFAULT 0,
    sales_rep_id UUID, 
    is_active BOOLEAN DEFAULT true, 
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(), 
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
    branch_id UUID REFERENCES branches(id),
    sale_number VARCHAR(50) UNIQUE NOT NULL, 
    sale_type VARCHAR(20) DEFAULT 'retail',
    customer_id UUID REFERENCES customers(id), 
    sales_rep_id UUID,
    status VARCHAR(20) DEFAULT 'draft', 
    payment_status VARCHAR(20) DEFAULT 'pending',
    subtotal DECIMAL(15,2) DEFAULT 0, 
    tax_amount DECIMAL(15,2) DEFAULT 0, 
    discount_amount DECIMAL(15,2) DEFAULT 0,
    discount_reason TEXT, 
    discount_approved_by UUID, 
    total DECIMAL(15,2) DEFAULT 0,
    payment_method VARCHAR(50), 
    payment_reference VARCHAR(100), 
    amount_paid DECIMAL(15,2) DEFAULT 0, 
    change_given DECIMAL(15,2) DEFAULT 0,
    sale_date TIMESTAMPTZ DEFAULT NOW(), 
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(), 
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Additional tables
CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id),
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    discount_percent DECIMAL(5,4) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    subtotal DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
    branch_id UUID REFERENCES branches(id),
    code VARCHAR(20) UNIQUE NOT NULL, 
    name VARCHAR(255) NOT NULL, 
    address TEXT,
    is_active BOOLEAN DEFAULT true, 
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(), 
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS installations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branches(id),
    installation_number VARCHAR(50) UNIQUE NOT NULL,
    sale_id UUID REFERENCES sales(id),
    customer_id UUID REFERENCES customers(id),
    status VARCHAR(20) DEFAULT 'scheduled',
    scheduled_date DATE,
    scheduled_time VARCHAR(10),
    address TEXT,
    city VARCHAR(100),
    contact_name VARCHAR(255),
    contact_phone VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ops_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  order_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  scheduled_date DATE,
  time_window VARCHAR(50),
  address TEXT,
  reference TEXT,
  contact_name VARCHAR(255),
  contact_phone VARCHAR(50),
  notes TEXT,
  promised_date DATE,
  advance_payment DECIMAL(12,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Insert seed data
INSERT INTO branches (code, name, legal_name, rfc, address, city, state, zip_code, is_active)
VALUES ('STILA-HQ', 'STILA Headquarters', 'STILA SA DE CV', 'SMA123456ABC', 'Av. Principal 100', 'Mexico City', 'CDMX', '01000', true)
ON CONFLICT (code) DO NOTHING;
