-- =============================================================================
-- ERP STILA - Datos de Ejemplo Simplificado
-- =============================================================================
-- Ejecutar en Supabase SQL Editor
-- Este script inserta datos de ejemplo usando subconsultas para obtener IDs

-- ============================================================================
-- 1. PRODUCTS
-- ============================================================================
INSERT INTO products (sku, barcode, name, description, base_price, cost_price, track_inventory, is_kit, is_active, is_featured)
VALUES 
    ('SKU-001', '7501234567890', 'Office Desk Pro', 'Professional office desk with drawers', 2500.00, 1500.00, true, false, true, true),
    ('SKU-002', '7501234567891', 'Ergonomic Chair', 'High-back ergonomic chair', 1800.00, 900.00, true, false, true, true),
    ('SKU-003', '7501234567892', 'LED Monitor 27"', '27 inch LED monitor', 3500.00, 2100.00, true, false, true, false)
ON CONFLICT (sku) DO NOTHING;

-- ============================================================================
-- 2. Obtener branch_id y crear warehouse
-- ============================================================================
-- Primero crear la branch si no existe
INSERT INTO branches (code, name, legal_name, rfc, address, city, state, zip_code, is_active)
VALUES ('STILA-HQ', 'STILA Headquarters', 'STILA SA DE CV', 'SMA123456ABC', 'Av. Principal 100', 'Mexico City', 'CDMX', '01000', true)
ON CONFLICT (code) DO NOTHING;

-- Crear warehouse
INSERT INTO warehouses (branch_id, code, name, address, is_active, is_default)
SELECT id, 'WH-001', 'Main Warehouse', 'Av. Storage 500', true, true
FROM branches WHERE code = 'STILA-HQ'
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 3. USER PROFILES
-- ============================================================================
INSERT INTO user_profiles (branch_id, role, first_name, last_name, email, phone, is_active)
SELECT 
    b.id,
    role_data.role,
    role_data.first_name,
    role_data.last_name,
    role_data.email,
    role_data.phone,
    true
FROM branches b
CROSS JOIN (
    VALUES 
        ('admin'::user_role, 'Admin', 'User', 'admin@stila.com', '5512345678'),
        ('sales_user'::user_role, 'Sales', 'Representative', 'sales@stila.com', '5512345679')
) AS role_data(role, first_name, last_name, email, phone)
WHERE b.code = 'STILA-HQ'
ON CONFLICT (phone) DO NOTHING;

-- ============================================================================
-- 4. CUSTOMERS
-- ============================================================================
INSERT INTO customers (branch_id, customer_number, name, email, phone, street, city, state, zip_code, is_active, is_verified)
SELECT 
    b.id,
    'CUST-' || LPAD(ROW_NUMBER() OVER()::VARCHAR, 3, '0'),
    c.name,
    c.email,
    c.phone,
    c.street,
    'Mexico City',
    'CDMX',
    '01000',
    true,
    true
FROM branches b
CROSS JOIN (
    VALUES 
        ('Juan Pérez', 'juan.perez@email.com', '5511111111', 'Av. Reforma 100'),
        ('María González', 'maria.gonzalez@email.com', '5522222222', 'Av. Mazaryk 200'),
        ('Carlos López', 'carlos.lopez@email.com', '5533333333', 'Av. Universidad 300')
) AS c(name, email, phone, street)
WHERE b.code = 'STILA-HQ'
ON CONFLICT (customer_number) DO NOTHING;

-- ============================================================================
-- 5. SALES
-- ============================================================================
INSERT INTO sales (branch_id, sale_number, sale_type, customer_id, sales_rep_id, status, payment_status, subtotal, tax_amount, discount_amount, total, payment_method, amount_paid, sale_date)
SELECT 
    b.id,
    'SAL-2024-' || LPAD(ROW_NUMBER() OVER()::VARCHAR, 5, '0'),
    'retail',
    c.id,
    u.id,
    s.status,
    s.payment_status,
    s.subtotal,
    s.tax_amount,
    s.discount_amount,
    s.total,
    s.payment_method,
    s.amount_paid,
    NOW()
FROM branches b
CROSS JOIN (
    VALUES 
        ('completed', 'paid', 4300.00, 688.00, 0, 4988.00, 'credit_card', 4988.00),
        ('paid', 'paid', 1800.00, 288.00, 100.00, 1988.00, 'cash', 2000.00),
        ('confirmed', 'pending', 3500.00, 560.00, 0, 4060.00, 'transfer', 0)
) AS s(status, payment_status, subtotal, tax_amount, discount_amount, total, payment_method, amount_paid)
JOIN customers c ON c.branch_id = b.id
JOIN user_profiles u ON u.branch_id = b.id AND u.role = 'sales_user'
WHERE b.code = 'STILA-HQ'
LIMIT 3
ON CONFLICT (sale_number) DO NOTHING;

-- ============================================================================
-- 6. SALE ITEMS
-- ============================================================================
INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, discount_percent, discount_amount, subtotal, tax_amount, total, status)
SELECT 
    s.id,
    p.id,
    2,
    p.base_price,
    0,
    0,
    p.base_price * 2,
    p.base_price * 2 * 0.16,
    p.base_price * 2 * 1.16,
    'active'
FROM sales s
JOIN products p ON true
WHERE s.status IN ('completed', 'paid', 'confirmed')
LIMIT 10
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 7. INVENTORY LOTS
-- ============================================================================
INSERT INTO inventory_lots (lot_number, product_id, warehouse_id, quantity, reserved_quantity, available_quantity, unit_cost, total_cost, receipt_date, expiration_date, status, auto_assigned)
SELECT 
    'LOT-2024-' || LPAD(ROW_NUMBER() OVER()::VARCHAR, 4, '0'),
    p.id,
    w.id,
    50,
    5,
    45,
    p.base_price * 0.6,
    p.base_price * 0.6 * 50,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 year',
    'active',
    false
FROM products p
CROSS JOIN warehouses w
JOIN branches b ON b.id = w.branch_id
WHERE b.code = 'STILA-HQ'
LIMIT 5
ON CONFLICT (lot_number) DO NOTHING;

-- ============================================================================
-- 8. SHIPMENTS
-- ============================================================================
INSERT INTO shipments (branch_id, shipment_number, sale_id, status, carrier, tracking_number, shipping_method, recipient_name, recipient_address, recipient_phone)
SELECT 
    b.id,
    'SHIP-2024-' || LPAD(ROW_NUMBER() OVER()::VARCHAR, 5, '0'),
    s.id,
    sh.status,
    sh.carrier,
    'TRK' || FLOOR(RANDOM() * 10000000)::VARCHAR,
    sh.shipping_method,
    c.name,
    c.street || ', ' || c.city,
    c.phone
FROM branches b
JOIN sales s ON s.branch_id = b.id
JOIN customers c ON c.id = s.customer_id
CROSS JOIN (
    VALUES 
        ('pending', 'FedEx', 'express'),
        ('shipped', 'DHL', 'standard'),
        ('delivered', 'UPS', 'economy')
) AS sh(status, carrier, shipping_method)
WHERE b.code = 'STILA-HQ'
LIMIT 3
ON CONFLICT (shipment_number) DO NOTHING;

-- ============================================================================
-- 9. INSTALLATIONS
-- ============================================================================
INSERT INTO installations (branch_id, installation_number, sale_id, customer_id, status, scheduled_date, scheduled_time, estimated_duration, address, city, contact_name, contact_phone, assigned_to)
SELECT 
    b.id,
    'INST-2024-' || LPAD(ROW_NUMBER() OVER()::VARCHAR, 5, '0'),
    s.id,
    s.customer_id,
    inst.status,
    CURRENT_DATE + (inst.days || ' days')::INTERVAL,
    inst.time,
    inst.duration,
    c.street || ', ' || c.city,
    c.city,
    c.name,
    c.phone,
    u.id
FROM branches b
JOIN sales s ON s.branch_id = b.id
JOIN customers c ON c.id = s.customer_id
JOIN user_profiles u ON u.branch_id = b.id
CROSS JOIN (
    VALUES 
        ('scheduled', 7, '10:00', 120),
        ('in_progress', 3, '14:00', 90),
        ('completed', -2, '09:00', 60)
) AS inst(status, days, time, duration)
WHERE b.code = 'STILA-HQ'
LIMIT 3
ON CONFLICT (installation_number) DO NOTHING;

-- ============================================================================
-- 10. COMMISSIONS
-- ============================================================================
INSERT INTO commissions (sale_id, seller_id, sale_amount, commission_rate, commission_amount, adjustments, status)
SELECT 
    s.id,
    s.sales_rep_id,
    s.total,
    0.05,
    s.total * 0.05,
    0,
    comm.status
FROM sales s
CROSS JOIN (
    VALUES 
        ('calculated'),
        ('approved'),
        ('paid')
) AS comm(status)
WHERE s.status IN ('completed', 'paid')
LIMIT 5
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 11. APPROVAL REQUESTS
-- ============================================================================
INSERT INTO approval_requests (record_type, record_id, status, current_level, max_level, requested_by, reason, new_value)
SELECT 
    'sale',
    s.id,
    ar.status,
    1,
    1,
    u.id,
    ar.reason,
    ar.new_value::jsonb
FROM sales s
JOIN user_profiles u ON u.branch_id = s.branch_id
CROSS JOIN (
    VALUES 
        ('pending', 'Descuento mayor al 15%', '{"discount_percent": 20, "discount_amount": 500}'),
        ('approved', 'Precio menor al mínimo', '{"discount_percent": 10, "discount_amount": 200}'),
        ('rejected', 'Monto muy alto', '{"total": 10000}')
) AS ar(status, reason, new_value)
WHERE s.status IN ('completed', 'paid', 'confirmed')
LIMIT 3
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 12. ALERTS
-- ============================================================================
INSERT INTO alerts (branch_id, alert_type, severity, title, message, user_id)
SELECT 
    b.id,
    a.alert_type,
    a.severity,
    a.title,
    a.message,
    u.id
FROM branches b
JOIN user_profiles u ON u.branch_id = b.id
CROSS JOIN (
    VALUES 
        ('low_stock', 'warning', 'Stock bajo en producto', 'El producto SKU-001 tiene menos de 10 unidades en inventario'),
        ('payment_pending', 'info', 'Pago pendiente', 'Hay 3 ventas con pago pendiente por revisar'),
        ('approval_needed', 'critical', 'Aprobación requerida', 'Hay solicitudes de aprobación pendientes de revisión')
) AS a(alert_type, severity, title, message)
WHERE b.code = 'STILA-HQ'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 13. AUDIT LOG
-- ============================================================================
INSERT INTO audit_log (branch_id, user_id, action, table_name, record_id, new_values, ip_address, user_agent)
SELECT 
    b.id,
    u.id,
    a.action,
    'sales',
    s.id,
    a.new_values::jsonb,
    a.ip_address,
    a.user_agent
FROM branches b
JOIN user_profiles u ON u.branch_id = b.id
JOIN sales s ON s.branch_id = b.id
CROSS JOIN (
    VALUES 
        ('create', '{"sale_number": "SAL-2024-00001", "total": 4988.00}', '192.168.1.100', 'Mozilla/5.0'),
        ('update', '{"status": "paid"}', '192.168.1.101', 'Mozilla/5.0'),
        ('create', '{"sale_number": "SAL-2024-00003", "total": 4060.00}', '192.168.1.102', 'Mozilla/5.0')
) AS a(action, new_values, ip_address, user_agent)
WHERE b.code = 'STILA-HQ'
LIMIT 3
ON CONFLICT DO NOTHING;

-- Mensaje de éxito
DO $$ 
BEGIN
    RAISE NOTICE 'Datos de ejemplo insertados correctamente en todas las tablas';
END $$;
