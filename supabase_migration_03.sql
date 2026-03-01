-- ERP STILA - Additional Tables
-- =============================================================================

-- Add stock column to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;

-- Create ops_orders table for operational orders
CREATE TABLE IF NOT EXISTS ops_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  order_type VARCHAR(50) NOT NULL CHECK (order_type IN ('delivery', 'installation', 'fabrication')),
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'in_progress', 'completed', 'issue', 'cancelled')),
  scheduled_date DATE,
  time_window VARCHAR(50),
  address TEXT,
  reference TEXT,
  contact_name VARCHAR(255),
  contact_phone VARCHAR(50),
  wall_type VARCHAR(50),
  notes TEXT,
  promised_date DATE,
  advance_payment DECIMAL(12,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on ops_orders
ALTER TABLE ops_orders ENABLE ROW LEVEL SECURITY;

-- Create policies for ops_orders
CREATE POLICY "Allow all operations on ops_orders" ON ops_orders
  FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for ops_orders
CREATE INDEX IF NOT EXISTS idx_ops_orders_sale_id ON ops_orders(sale_id);
CREATE INDEX IF NOT EXISTS idx_ops_orders_status ON ops_orders(status);
CREATE INDEX IF NOT EXISTS idx_ops_orders_type ON ops_orders(order_type);
CREATE INDEX IF NOT EXISTS idx_ops_orders_scheduled_date ON ops_orders(scheduled_date);

-- Add minimum_stock column
ALTER TABLE products ADD COLUMN IF NOT EXISTS minimum_stock INTEGER DEFAULT 0;
