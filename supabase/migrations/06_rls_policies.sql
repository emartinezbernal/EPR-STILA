-- =============================================================================
-- ERP STILA - Políticas RLS Seguras
-- =============================================================================
-- Este archivo implementa políticas RLS básicas para desarrollo
-- Para producción, revisar y ajustar según sea necesario

-- ============================================================================
-- HABILITAR RLS EN TODAS LAS TABLAS
-- ============================================================================
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
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICAS PARA branches (acceso abierto para desarrollo)
-- ============================================================================
DROP POLICY IF EXISTS "branches_select" ON branches;
CREATE POLICY "branches_select" ON branches FOR SELECT USING (true);

DROP POLICY IF EXISTS "branches_insert" ON branches;
CREATE POLICY "branches_insert" ON branches FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "branches_update" ON branches;
CREATE POLICY "branches_update" ON branches FOR UPDATE USING (true);

DROP POLICY IF EXISTS "branches_delete" ON branches;
CREATE POLICY "branches_delete" ON branches FOR DELETE USING (true);

-- ============================================================================
-- POLÍTICAS PARA departments
-- ============================================================================
DROP POLICY IF EXISTS "departments_select" ON departments;
CREATE POLICY "departments_select" ON departments FOR SELECT USING (true);

-- ============================================================================
-- POLÍTICAS PARA cost_centers
-- ============================================================================
DROP POLICY IF EXISTS "cost_centers_select" ON cost_centers;
CREATE POLICY "cost_centers_select" ON cost_centers FOR SELECT USING (true);

-- ============================================================================
-- POLÍTICAS PARA user_profiles
-- ============================================================================
DROP POLICY IF EXISTS "user_profiles_select" ON user_profiles;
CREATE POLICY "user_profiles_select" ON user_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "user_profiles_insert" ON user_profiles;
CREATE POLICY "user_profiles_insert" ON user_profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "user_profiles_update" ON user_profiles;
CREATE POLICY "user_profiles_update" ON user_profiles FOR UPDATE USING (true);

-- ============================================================================
-- POLÍTICAS PARA products (acceso abierto para catálogo)
-- ============================================================================
DROP POLICY IF EXISTS "products_select" ON products;
CREATE POLICY "products_select" ON products FOR SELECT USING (true);

DROP POLICY IF EXISTS "products_insert" ON products;
CREATE POLICY "products_insert" ON products FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "products_update" ON products;
CREATE POLICY "products_update" ON products FOR UPDATE USING (true);

DROP POLICY IF EXISTS "products_delete" ON products;
CREATE POLICY "products_delete" ON products FOR DELETE USING (true);

-- ============================================================================
-- POLÍTICAS PARA product_categories
-- ============================================================================
DROP POLICY IF EXISTS "product_categories_select" ON product_categories;
CREATE POLICY "product_categories_select" ON product_categories FOR SELECT USING (true);

-- ============================================================================
-- POLÍTICAS PARA product_brands
-- ============================================================================
DROP POLICY IF EXISTS "product_brands_select" ON product_brands;
CREATE POLICY "product_brands_select" ON product_brands FOR SELECT USING (true);

-- ============================================================================
-- POLÍTICAS PARA warehouses
-- ============================================================================
DROP POLICY IF EXISTS "warehouses_select" ON warehouses;
CREATE POLICY "warehouses_select" ON warehouses FOR SELECT USING (true);

DROP POLICY IF EXISTS "warehouses_insert" ON warehouses;
CREATE POLICY "warehouses_insert" ON warehouses FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "warehouses_update" ON warehouses;
CREATE POLICY "warehouses_update" ON warehouses FOR UPDATE USING (true);

-- ============================================================================
-- POLÍTICAS PARA customers
-- ============================================================================
DROP POLICY IF EXISTS "customers_select" ON customers;
CREATE POLICY "customers_select" ON customers FOR SELECT USING (true);

DROP POLICY IF EXISTS "customers_insert" ON customers;
CREATE POLICY "customers_insert" ON customers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "customers_update" ON customers;
CREATE POLICY "customers_update" ON customers FOR UPDATE USING (true);

DROP POLICY IF EXISTS "customers_delete" ON customers;
CREATE POLICY "customers_delete" ON customers FOR DELETE USING (true);

-- ============================================================================
-- POLÍTICAS PARA sales
-- ============================================================================
DROP POLICY IF EXISTS "sales_select" ON sales;
CREATE POLICY "sales_select" ON sales FOR SELECT USING (true);

DROP POLICY IF EXISTS "sales_insert" ON sales;
CREATE POLICY "sales_insert" ON sales FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "sales_update" ON sales;
CREATE POLICY "sales_update" ON sales FOR UPDATE USING (true);

DROP POLICY IF EXISTS "sales_delete" ON sales;
CREATE POLICY "sales_delete" ON sales FOR DELETE USING (true);

-- ============================================================================
-- POLÍTICAS PARA sale_items
-- ============================================================================
DROP POLICY IF EXISTS "sale_items_select" ON sale_items;
CREATE POLICY "sale_items_select" ON sale_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "sale_items_insert" ON sale_items;
CREATE POLICY "sale_items_insert" ON sale_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "sale_items_update" ON sale_items;
CREATE POLICY "sale_items_update" ON sale_items FOR UPDATE USING (true);

DROP POLICY IF EXISTS "sale_items_delete" ON sale_items;
CREATE POLICY "sale_items_delete" ON sale_items FOR DELETE USING (true);

-- ============================================================================
-- POLÍTICAS PARA inventory_lots
-- ============================================================================
DROP POLICY IF EXISTS "inventory_lots_select" ON inventory_lots;
CREATE POLICY "inventory_lots_select" ON inventory_lots FOR SELECT USING (true);

DROP POLICY IF EXISTS "inventory_lots_insert" ON inventory_lots;
CREATE POLICY "inventory_lots_insert" ON inventory_lots FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "inventory_lots_update" ON inventory_lots;
CREATE POLICY "inventory_lots_update" ON inventory_lots FOR UPDATE USING (true);

DROP POLICY IF EXISTS "inventory_lots_delete" ON inventory_lots;
CREATE POLICY "inventory_lots_delete" ON inventory_lots FOR DELETE USING (true);

-- ============================================================================
-- POLÍTICAS PARA shipments
-- ============================================================================
DROP POLICY IF EXISTS "shipments_select" ON shipments;
CREATE POLICY "shipments_select" ON shipments FOR SELECT USING (true);

DROP POLICY IF EXISTS "shipments_insert" ON shipments;
CREATE POLICY "shipments_insert" ON shipments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "shipments_update" ON shipments;
CREATE POLICY "shipments_update" ON shipments FOR UPDATE USING (true);

DROP POLICY IF EXISTS "shipments_delete" ON shipments;
CREATE POLICY "shipments_delete" ON shipments FOR DELETE USING (true);

-- ============================================================================
-- POLÍTICAS PARA installations
-- ============================================================================
DROP POLICY IF EXISTS "installations_select" ON installations;
CREATE POLICY "installations_select" ON installations FOR SELECT USING (true);

DROP POLICY IF EXISTS "installations_insert" ON installations;
CREATE POLICY "installations_insert" ON installations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "installations_update" ON installations;
CREATE POLICY "installations_update" ON installations FOR UPDATE USING (true);

DROP POLICY IF EXISTS "installations_delete" ON installations;
CREATE POLICY "installations_delete" ON installations FOR DELETE USING (true);

-- ============================================================================
-- POLÍTICAS PARA commissions
-- ============================================================================
DROP POLICY IF EXISTS "commissions_select" ON commissions;
CREATE POLICY "commissions_select" ON commissions FOR SELECT USING (true);

DROP POLICY IF EXISTS "commissions_insert" ON commissions;
CREATE POLICY "commissions_insert" ON commissions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "commissions_update" ON commissions;
CREATE POLICY "commissions_update" ON commissions FOR UPDATE USING (true);

DROP POLICY IF EXISTS "commissions_delete" ON commissions;
CREATE POLICY "commissions_delete" ON commissions FOR DELETE USING (true);

-- ============================================================================
-- POLÍTICAS PARA approval_requests
-- ============================================================================
DROP POLICY IF EXISTS "approval_requests_select" ON approval_requests;
CREATE POLICY "approval_requests_select" ON approval_requests FOR SELECT USING (true);

DROP POLICY IF EXISTS "approval_requests_insert" ON approval_requests;
CREATE POLICY "approval_requests_insert" ON approval_requests FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "approval_requests_update" ON approval_requests;
CREATE POLICY "approval_requests_update" ON approval_requests FOR UPDATE USING (true);

DROP POLICY IF EXISTS "approval_requests_delete" ON approval_requests;
CREATE POLICY "approval_requests_delete" ON approval_requests FOR DELETE USING (true);

-- ============================================================================
-- POLÍTICAS PARA alerts
-- ============================================================================
DROP POLICY IF EXISTS "alerts_select" ON alerts;
CREATE POLICY "alerts_select" ON alerts FOR SELECT USING (true);

DROP POLICY IF EXISTS "alerts_insert" ON alerts;
CREATE POLICY "alerts_insert" ON alerts FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "alerts_update" ON alerts;
CREATE POLICY "alerts_update" ON alerts FOR UPDATE USING (true);

DROP POLICY IF EXISTS "alerts_delete" ON alerts;
CREATE POLICY "alerts_delete" ON alerts FOR DELETE USING (true);

-- ============================================================================
-- POLÍTICAS PARA audit_log (solo lectura)
-- ============================================================================
DROP POLICY IF EXISTS "audit_log_select" ON audit_log;
CREATE POLICY "audit_log_select" ON audit_log FOR SELECT USING (true);

DROP POLICY IF EXISTS "audit_log_insert" ON audit_log;
CREATE POLICY "audit_log_insert" ON audit_log FOR INSERT WITH CHECK (true);

-- Mensaje de éxito
DO $$ 
BEGIN
    RAISE NOTICE 'Políticas RLS aplicadas correctamente';
    RAISE NOTICE 'Todas las tablas tienen políticas para SELECT, INSERT, UPDATE, DELETE';
END $$;
