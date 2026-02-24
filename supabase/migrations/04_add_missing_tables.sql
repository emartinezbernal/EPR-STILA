-- =============================================================================
-- ERP STILA - Tablas Faltantes
-- =============================================================================
-- Este script crea las tablas que faltan en Supabase
-- para el funcionamiento completo del sistema ERP STILA

-- Enum para estado de comisiones
DO $$ BEGIN
    CREATE TYPE commission_status AS ENUM ('calculated', 'approved', 'paid', 'cancelled', 'adjusted');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Tabla: sale_items (Artículos de venta)
CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id),
    lot_id UUID,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    discount_percent DECIMAL(5,4) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    subtotal DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total DECIMAL(15,2) NOT NULL,
    unit_cost DECIMAL(15,2),
    total_cost DECIMAL(15,2),
    status VARCHAR(20) DEFAULT 'active',
    notes TEXT,
    serial_numbers JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: inventory_lots (Lotes de inventario)
CREATE TABLE IF NOT EXISTS inventory_lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_number VARCHAR(50) UNIQUE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    warehouse_id UUID REFERENCES warehouses(id),
    quantity DECIMAL(10,2) DEFAULT 0,
    reserved_quantity DECIMAL(10,2) DEFAULT 0,
    available_quantity DECIMAL(10,2) DEFAULT 0,
    unit_cost DECIMAL(15,2),
    total_cost DECIMAL(15,2),
    receipt_date DATE,
    expiration_date DATE,
    status VARCHAR(20) DEFAULT 'active',
    auto_assigned BOOLEAN DEFAULT false,
    assigned_by UUID,
    assigned_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: shipments (Envíos)
CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branches(id),
    shipment_number VARCHAR(50) UNIQUE NOT NULL,
    sale_id UUID REFERENCES sales(id),
    status VARCHAR(20) DEFAULT 'pending',
    carrier VARCHAR(100),
    tracking_number VARCHAR(100),
    shipping_method VARCHAR(50),
    sender_name VARCHAR(255),
    sender_address TEXT,
    recipient_name VARCHAR(255),
    recipient_address TEXT,
    recipient_phone VARCHAR(20),
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: installations (Instalaciones)
CREATE TABLE IF NOT EXISTS installations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branches(id),
    installation_number VARCHAR(50) UNIQUE NOT NULL,
    sale_id UUID REFERENCES sales(id),
    customer_id UUID REFERENCES customers(id),
    status VARCHAR(20) DEFAULT 'scheduled',
    scheduled_date DATE,
    scheduled_time VARCHAR(10),
    estimated_duration INTEGER,
    address TEXT,
    city VARCHAR(100),
    contact_name VARCHAR(255),
    contact_phone VARCHAR(20),
    assigned_to UUID,
    team_members JSONB,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    completion_notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: commissions (Comisiones)
CREATE TABLE IF NOT EXISTS commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID REFERENCES sales(id),
    seller_id UUID,
    period_id UUID,
    sale_amount DECIMAL(15,2) NOT NULL,
    commission_rate DECIMAL(5,4) NOT NULL,
    commission_amount DECIMAL(15,2) NOT NULL,
    adjustments DECIMAL(15,2) DEFAULT 0,
    adjustment_reason TEXT,
    adjusted_by UUID,
    status VARCHAR(20) DEFAULT 'calculated',
    paid_at TIMESTAMPTZ,
    payment_reference VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: approval_requests (Solicitudes de aprobación)
CREATE TABLE IF NOT EXISTS approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    definition_id UUID,
    record_type VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    current_level INTEGER DEFAULT 1,
    max_level INTEGER DEFAULT 1,
    requested_by UUID,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    reason TEXT,
    previous_value JSONB,
    new_value JSONB,
    resolved_by UUID,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: alerts (Alertas)
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branches(id),
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) DEFAULT 'info',
    title VARCHAR(255) NOT NULL,
    message TEXT,
    reference_type VARCHAR(50),
    reference_id UUID,
    is_read BOOLEAN DEFAULT false,
    read_by UUID,
    read_at TIMESTAMPTZ,
    user_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: audit_log (Log de auditoría)
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branches(id),
    user_id UUID,
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- HABILITAR RLS Y CREAR POLÍTICAS
-- =============================================================================

-- Habilitar RLS en todas las tablas nuevas
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Políticas RLS simples (selección pública para demo)
CREATE POLICY "sale_items_select" ON sale_items FOR SELECT USING (true);
CREATE POLICY "sale_items_insert" ON sale_items FOR INSERT WITH CHECK (true);
CREATE POLICY "sale_items_update" ON sale_items FOR UPDATE USING (true);
CREATE POLICY "sale_items_delete" ON sale_items FOR DELETE USING (true);

CREATE POLICY "inventory_lots_select" ON inventory_lots FOR SELECT USING (true);
CREATE POLICY "inventory_lots_insert" ON inventory_lots FOR INSERT WITH CHECK (true);
CREATE POLICY "inventory_lots_update" ON inventory_lots FOR UPDATE USING (true);
CREATE POLICY "inventory_lots_delete" ON inventory_lots FOR DELETE USING (true);

CREATE POLICY "shipments_select" ON shipments FOR SELECT USING (true);
CREATE POLICY "shipments_insert" ON shipments FOR INSERT WITH CHECK (true);
CREATE POLICY "shipments_update" ON shipments FOR UPDATE USING (true);
CREATE POLICY "shipments_delete" ON shipments FOR DELETE USING (true);

CREATE POLICY "installations_select" ON installations FOR SELECT USING (true);
CREATE POLICY "installations_insert" ON installations FOR INSERT WITH CHECK (true);
CREATE POLICY "installations_update" ON installations FOR UPDATE USING (true);
CREATE POLICY "installations_delete" ON installations FOR DELETE USING (true);

CREATE POLICY "commissions_select" ON commissions FOR SELECT USING (true);
CREATE POLICY "commissions_insert" ON commissions FOR INSERT WITH CHECK (true);
CREATE POLICY "commissions_update" ON commissions FOR UPDATE USING (true);
CREATE POLICY "commissions_delete" ON commissions FOR DELETE USING (true);

CREATE POLICY "approval_requests_select" ON approval_requests FOR SELECT USING (true);
CREATE POLICY "approval_requests_insert" ON approval_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "approval_requests_update" ON approval_requests FOR UPDATE USING (true);
CREATE POLICY "approval_requests_delete" ON approval_requests FOR DELETE USING (true);

CREATE POLICY "alerts_select" ON alerts FOR SELECT USING (true);
CREATE POLICY "alerts_insert" ON alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "alerts_update" ON alerts FOR UPDATE USING (true);
CREATE POLICY "alerts_delete" ON alerts FOR DELETE USING (true);

CREATE POLICY "audit_log_select" ON audit_log FOR SELECT USING (true);
CREATE POLICY "audit_log_insert" ON audit_log FOR INSERT WITH CHECK (true);
CREATE POLICY "audit_log_delete" ON audit_log FOR DELETE USING (true);

-- =============================================================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- =============================================================================

-- Índices para sale_items
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);

-- Índices para inventory_lots
CREATE INDEX IF NOT EXISTS idx_inventory_lots_product_id ON inventory_lots(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_lots_warehouse_id ON inventory_lots(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inventory_lots_lot_number ON inventory_lots(lot_number);

-- Índices para shipments
CREATE INDEX IF NOT EXISTS idx_shipments_sale_id ON shipments(sale_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_shipment_number ON shipments(shipment_number);

-- Índices para installations
CREATE INDEX IF NOT EXISTS idx_installations_sale_id ON installations(sale_id);
CREATE INDEX IF NOT EXISTS idx_installations_customer_id ON installations(customer_id);
CREATE INDEX IF NOT EXISTS idx_installations_status ON installations(status);
CREATE INDEX IF NOT EXISTS idx_installations_installation_number ON installations(installation_number);

-- Índices para commissions
CREATE INDEX IF NOT EXISTS idx_commissions_sale_id ON commissions(sale_id);
CREATE INDEX IF NOT EXISTS idx_commissions_seller_id ON commissions(seller_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);

-- Índices para approval_requests
CREATE INDEX IF NOT EXISTS idx_approval_requests_record_type ON approval_requests(record_type);
CREATE INDEX IF NOT EXISTS idx_approval_requests_record_id ON approval_requests(record_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON approval_requests(status);

-- Índices para alerts
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_is_read ON alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);

-- Índices para audit_log
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_record_id ON audit_log(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);

-- =============================================================================
-- DATOS DE EJEMPLO (DEMO)
-- =============================================================================

-- Insertar datos de ejemplo para sale_items
INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, discount_percent, discount_amount, subtotal, tax_amount, total, status)
SELECT 
    s.id as sale_id,
    p.id as product_id,
    1 as quantity,
    p.base_price as unit_price,
    0 as discount_percent,
    0 as discount_amount,
    p.base_price as subtotal,
    (p.base_price * 0.16) as tax_amount,
    (p.base_price * 1.16) as total,
    'active' as status
FROM sales s
CROSS JOIN products p
WHERE s.status IN ('completed', 'paid')
LIMIT 10
ON CONFLICT DO NOTHING;

-- Insertar datos de ejemplo para shipments
INSERT INTO shipments (branch_id, shipment_number, sale_id, status, carrier, tracking_number, shipping_method, recipient_name, recipient_address)
SELECT 
    s.branch_id,
    'SHIP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 1000)::INT::VARCHAR, 4, '0'),
    s.id,
    'pending',
    'FedEx',
    'TRACK' || FLOOR(RANDOM() * 10000000)::VARCHAR,
    'express',
    c.name,
    COALESCE(c.street, '') || ' ' || COALESCE(c.city, '')
FROM sales s
LEFT JOIN customers c ON c.id = s.customer_id
WHERE s.status IN ('shipped', 'delivered')
LIMIT 5
ON CONFLICT (shipment_number) DO NOTHING;

-- Insertar datos de ejemplo para installations
INSERT INTO installations (branch_id, installation_number, sale_id, customer_id, status, scheduled_date, address, city, contact_name, contact_phone)
SELECT 
    s.branch_id,
    'INST-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 1000)::INT::VARCHAR, 4, '0'),
    s.id,
    s.customer_id,
    'scheduled',
    CURRENT_DATE + INTERVAL '7 days',
    c.street,
    c.city,
    c.name,
    c.phone
FROM sales s
LEFT JOIN customers c ON c.id = s.customer_id
WHERE s.status = 'paid'
LIMIT 5
ON CONFLICT (installation_number) DO NOTHING;

-- Insertar datos de ejemplo para commissions
INSERT INTO commissions (sale_id, seller_id, sale_amount, commission_rate, commission_amount, status)
SELECT 
    s.id,
    s.sales_rep_id,
    s.total,
    0.05,
    s.total * 0.05,
    'calculated'
FROM sales s
WHERE s.status IN ('completed', 'paid')
LIMIT 10
ON CONFLICT DO NOTHING;

-- Insertar datos de ejemplo para approval_requests
INSERT INTO approval_requests (record_type, record_id, status, current_level, max_level, reason, new_value)
SELECT 
    'sale',
    id,
    'pending',
    1,
    1,
    'Descuento mayor al 15% requiere aprobación',
    JSONB_BUILD_OBJECT('discount_amount', discount_amount, 'discount_percent', 20)
FROM sales 
WHERE discount_amount > 0
LIMIT 5
ON CONFLICT DO NOTHING;

-- Insertar datos de ejemplo para alerts
INSERT INTO alerts (alert_type, severity, title, message, user_id)
VALUES 
    ('low_stock', 'warning', 'Stock bajo en producto', 'El producto SKU-001 tiene menos de 10 unidades en inventario', NULL),
    ('payment_pending', 'info', 'Pago pendiente', 'Hay 3 ventas con pago pendiente por revisar', NULL),
    ('approval_needed', 'critical', 'Aprobación requerida', 'Hay solicitudes de aprobación pendientes de revisión', NULL)
ON CONFLICT DO NOTHING;

-- Insertar datos de ejemplo para audit_log
INSERT INTO audit_log (user_id, action, table_name, record_id, new_values)
SELECT 
    up.user_id,
    'create',
    'sales',
    s.id,
    JSONB_BUILD_OBJECT('sale_number', s.sale_number, 'total', s.total)
FROM sales s
LEFT JOIN user_profiles up ON up.id = s.created_by
WHERE s.created_at > NOW() - INTERVAL '7 days'
LIMIT 10
ON CONFLICT DO NOTHING;

-- Mensaje de éxito
DO $$ 
BEGIN
    RAISE NOTICE 'Migración completada exitosamente. Se crearon las siguientes tablas:';
    RAISE NOTICE '  - sale_items';
    RAISE NOTICE '  - inventory_lots';
    RAISE NOTICE '  - shipments';
    RAISE NOTICE '  - installations';
    RAISE NOTICE '  - commissions';
    RAISE NOTICE '  - approval_requests';
    RAISE NOTICE '  - alerts';
    RAISE NOTICE '  - audit_log';
END $$;
