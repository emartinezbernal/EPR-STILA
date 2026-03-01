-- ERP STILA - Tablas Faltantes
-- =============================================================================
-- Este script crea las tablas que faltan en Supabase

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

-- Enable RLS
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies (use IF NOT EXISTS to avoid errors)
CREATE POLICY IF NOT EXISTS "sale_items_select" ON sale_items FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "sale_items_insert" ON sale_items FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "sale_items_update" ON sale_items FOR UPDATE USING (true);
CREATE POLICY IF NOT EXISTS "sale_items_delete" ON sale_items FOR DELETE USING (true);

CREATE POLICY IF NOT EXISTS "inventory_lots_select" ON inventory_lots FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "inventory_lots_insert" ON inventory_lots FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "inventory_lots_update" ON inventory_lots FOR UPDATE USING (true);
CREATE POLICY IF NOT EXISTS "inventory_lots_delete" ON inventory_lots FOR DELETE USING (true);

CREATE POLICY IF NOT EXISTS "shipments_select" ON shipments FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "shipments_insert" ON shipments FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "shipments_update" ON shipments FOR UPDATE USING (true);
CREATE POLICY IF NOT EXISTS "shipments_delete" ON shipments FOR DELETE USING (true);

CREATE POLICY IF NOT EXISTS "installations_select" ON installations FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "installations_insert" ON installations FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "installations_update" ON installations FOR UPDATE USING (true);
CREATE POLICY IF NOT EXISTS "installations_delete" ON installations FOR DELETE USING (true);

CREATE POLICY IF NOT EXISTS "commissions_select" ON commissions FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "commissions_insert" ON commissions FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "commissions_update" ON commissions FOR UPDATE USING (true);
CREATE POLICY IF NOT EXISTS "commissions_delete" ON commissions FOR DELETE USING (true);

CREATE POLICY IF NOT EXISTS "approval_requests_select" ON approval_requests FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "approval_requests_insert" ON approval_requests FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "approval_requests_update" ON approval_requests FOR UPDATE USING (true);
CREATE POLICY IF NOT EXISTS "approval_requests_delete" ON approval_requests FOR DELETE USING (true);

CREATE POLICY IF NOT EXISTS "alerts_select" ON alerts FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "alerts_insert" ON alerts FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "alerts_update" ON alerts FOR UPDATE USING (true);
CREATE POLICY IF NOT EXISTS "alerts_delete" ON alerts FOR DELETE USING (true);

CREATE POLICY IF NOT EXISTS "audit_log_select" ON audit_log FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "audit_log_insert" ON audit_log FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "audit_log_delete" ON audit_log FOR DELETE USING (true);

-- Índices
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_lots_product_id ON inventory_lots(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_lots_warehouse_id ON inventory_lots(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_shipments_sale_id ON shipments(sale_id);
CREATE INDEX IF NOT EXISTS idx_installations_sale_id ON installations(sale_id);
CREATE INDEX IF NOT EXISTS idx_commissions_sale_id ON commissions(sale_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
