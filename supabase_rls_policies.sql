-- Add RLS Policies for ERP STILA
-- Run this in SQL Editor

-- Enable RLS on all tables
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops_orders ENABLE ROW LEVEL SECURITY;

-- Create policies for branches
CREATE POLICY "branches_select" ON branches FOR SELECT USING (true);
CREATE POLICY "branches_insert" ON branches FOR INSERT WITH CHECK (true);
CREATE POLICY "branches_update" ON branches FOR UPDATE USING (true);
CREATE POLICY "branches_delete" ON branches FOR DELETE USING (true);

-- Create policies for products
CREATE POLICY "products_select" ON products FOR SELECT USING (true);
CREATE POLICY "products_insert" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "products_update" ON products FOR UPDATE USING (true);
CREATE POLICY "products_delete" ON products FOR DELETE USING (true);

-- Create policies for customers
CREATE POLICY "customers_select" ON customers FOR SELECT USING (true);
CREATE POLICY "customers_insert" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "customers_update" ON customers FOR UPDATE USING (true);
CREATE POLICY "customers_delete" ON customers FOR DELETE USING (true);

-- Create policies for sales
CREATE POLICY "sales_select" ON sales FOR SELECT USING (true);
CREATE POLICY "sales_insert" ON sales FOR INSERT WITH CHECK (true);
CREATE POLICY "sales_update" ON sales FOR UPDATE USING (true);
CREATE POLICY "sales_delete" ON sales FOR DELETE USING (true);

-- Create policies for sale_items
CREATE POLICY "sale_items_select" ON sale_items FOR SELECT USING (true);
CREATE POLICY "sale_items_insert" ON sale_items FOR INSERT WITH CHECK (true);
CREATE POLICY "sale_items_update" ON sale_items FOR UPDATE USING (true);
CREATE POLICY "sale_items_delete" ON sale_items FOR DELETE USING (true);

-- Create policies for warehouses
CREATE POLICY "warehouses_select" ON warehouses FOR SELECT USING (true);
CREATE POLICY "warehouses_insert" ON warehouses FOR INSERT WITH CHECK (true);
CREATE POLICY "warehouses_update" ON warehouses FOR UPDATE USING (true);
CREATE POLICY "warehouses_delete" ON warehouses FOR DELETE USING (true);

-- Create policies for installations
CREATE POLICY "installations_select" ON installations FOR SELECT USING (true);
CREATE POLICY "installations_insert" ON installations FOR INSERT WITH CHECK (true);
CREATE POLICY "installations_update" ON installations FOR UPDATE USING (true);
CREATE POLICY "installations_delete" ON installations FOR DELETE USING (true);

-- Create policies for ops_orders
CREATE POLICY "ops_orders_select" ON ops_orders FOR SELECT USING (true);
CREATE POLICY "ops_orders_insert" ON ops_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "ops_orders_update" ON ops_orders FOR UPDATE USING (true);
CREATE POLICY "ops_orders_delete" ON ops_orders FOR DELETE USING (true);
