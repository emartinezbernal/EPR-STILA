-- =============================================================================
-- ERP STILA - Datos de Ejemplo para Demo
-- =============================================================================
-- Este script inserta datos de ejemplo en todas las tablas
-- Ejecutar en Supabase SQL Editor

-- ============================================================================
-- DATOS BASE - Branch, Warehouse, Users
-- ============================================================================

-- Insertar Branch si no existe
INSERT INTO branches (code, name, legal_name, rfc, address, city, state, zip_code, is_active)
VALUES ('STILA-HQ', 'STILA Headquarters', 'STILA SA DE CV', 'SMA123456ABC', 'Av. Principal 100', 'Mexico City', 'CDMX', '01000', true)
ON CONFLICT (code) DO NOTHING;

-- Obtener el ID del branch
DO $$
DECLARE
    branch_uuid UUID;
BEGIN
    SELECT id INTO branch_uuid FROM branches WHERE code = 'STILA-HQ' LIMIT 1;
    
    -- Insertar Warehouse
    INSERT INTO warehouses (branch_id, code, name, address, is_active, is_default)
    VALUES (branch_uuid, 'WH-001', 'Main Warehouse', 'Av. Storage 500', true, true)
    ON CONFLICT (code) DO NOTHING;
    
    -- Insertar User Profiles
    INSERT INTO user_profiles (branch_id, role, first_name, last_name, email, phone, is_active)
    VALUES 
        (branch_uuid, 'admin', 'Admin', 'User', 'admin@stila.com', '5512345678', true),
        (branch_uuid, 'sales_user', 'Sales', 'Representative', 'sales@stila.com', '5512345679', true)
    ON CONFLICT (phone) DO NOTHING;
END $$;

-- ============================================================================
-- PRODUCTOS
-- ============================================================================

INSERT INTO products (sku, barcode, name, description, base_price, cost_price, track_inventory, is_kit, is_active, is_featured)
VALUES 
    ('SKU-001', '7501234567890', 'Office Desk Pro', 'Professional office desk with drawers', 2500.00, 1500.00, true, false, true, true),
    ('SKU-002', '7501234567891', 'Ergonomic Chair', 'High-back ergonomic chair', 1800.00, 900.00, true, false, true, true),
    ('SKU-003', '7501234567892', 'LED Monitor 27"', '27 inch LED monitor', 3500.00, 2100.00, true, false, true, false)
ON CONFLICT (sku) DO NOTHING;

-- ============================================================================
-- CLIENTES
-- ============================================================================

INSERT INTO customers (branch_id, customer_number, name, email, phone, street, city, state, zip_code, is_active, is_verified)
SELECT 
    b.id,
    'CUST-' || LPAD(ROW_NUMBER() OVER()::VARCHAR, 3, '0'),
    names.name,
    names.email,
    names.phone,
    names.street,
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
) AS names(name, email, phone, street)
WHERE b.code = 'STILA-HQ'
ON CONFLICT (customer_number) DO NOTHING;

-- ============================================================================
-- VENTAS
-- ============================================================================

DO $$
DECLARE
    branch_uuid UUID;
    customer_ids UUID[];
    user_ids UUID[];
BEGIN
    SELECT id INTO branch_uuid FROM branches WHERE code = 'STILA-HQ' LIMIT 1;
    SELECT ARRAY_AGG(id) INTO customer_ids FROM customers WHERE branch_id = branch_uuid LIMIT 3;
    SELECT ARRAY_AGG(id) INTO user_ids FROM user_profiles WHERE branch_id = branch_uuid LIMIT 2;
    
    IF array_length(customer_ids, 1) > 0 AND array_length(user_ids, 1) > 0 THEN
        INSERT INTO sales (branch_id, sale_number, sale_type, customer_id, sales_rep_id, status, payment_status, subtotal, tax_amount, discount_amount, total, payment_method, amount_paid, sale_date)
        VALUES 
            (branch_uuid, 'SAL-2024-00001', 'retail', customer_ids[1], user_ids[2], 'completed', 'paid', 4300.00, 688.00, 0, 4988.00, 'credit_card', 4988.00, NOW()),
            (branch_uuid, 'SAL-2024-00002', 'retail', customer_ids[2], user_ids[2], 'paid', 'paid', 1800.00, 288.00, 100.00, 1988.00, 'cash', 2000.00, NOW()),
            (branch_uuid, 'SAL-2024-00003', 'retail', customer_ids[3], user_ids[2], 'confirmed', 'pending', 3500.00, 560.00, 0, 4060.00, 'transfer', 0, NOW())
        ON CONFLICT (sale_number) DO NOTHING;
    END IF;
END $$;

-- ============================================================================
-- SALE ITEMS (Artículos de venta)
-- ============================================================================

DO $$
DECLARE
    sale_ids UUID[];
    product_ids UUID[];
BEGIN
    SELECT ARRAY_AGG(id) INTO sale_ids FROM sales ORDER BY created_at DESC LIMIT 3;
    SELECT ARRAY_AGG(id) INTO product_ids FROM products LIMIT 3;
    
    IF array_length(sale_ids, 1) > 0 AND array_length(product_ids, 1) > 0 THEN
        INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, discount_percent, discount_amount, subtotal, tax_amount, total, status)
        SELECT 
            sale_ids[i],
            product_ids[((i-1) % 3) + 1],
            2,
            p.base_price,
            0,
            0,
            p.base_price * 2,
            p.base_price * 2 * 0.16,
            p.base_price * 2 * 1.16,
            'active'
        FROM generate_series(1, LEAST(array_length(sale_ids, 1), 3)) AS i
        CROSS JOIN products p
        WHERE p.id = product_ids[((i-1) % 3) + 1]
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- ============================================================================
-- INVENTORY LOTS (Lotes de inventario)
-- ============================================================================

DO $$
DECLARE
    warehouse_uuid UUID;
    product_ids UUID[];
BEGIN
    SELECT id INTO warehouse_uuid FROM warehouses WHERE code = 'WH-001' LIMIT 1;
    SELECT ARRAY_AGG(id) INTO product_ids FROM products LIMIT 3;
    
    IF warehouse_uuid IS NOT NULL AND array_length(product_ids, 1) > 0 THEN
        INSERT INTO inventory_lots (lot_number, product_id, warehouse_id, quantity, reserved_quantity, available_quantity, unit_cost, total_cost, receipt_date, expiration_date, status, auto_assigned)
        SELECT 
            'LOT-2024-' || LPAD(i::VARCHAR, 4, '0'),
            product_ids[i],
            warehouse_uuid,
            50,
            5,
            45,
            p.base_price * 0.6,
            p.base_price * 0.6 * 50,
            CURRENT_DATE,
            CURRENT_DATE + INTERVAL '1 year',
            'active',
            false
        FROM generate_series(0, LEAST(array_length(product_ids, 1), 3) - 1) AS i
        CROSS JOIN products p
        WHERE p.id = product_ids[i + 1]
        ON CONFLICT (lot_number) DO NOTHING;
    END IF;
END $$;

-- ============================================================================
-- SHIPMENTS (Envíos)
-- ============================================================================

DO $$
DECLARE
    branch_uuid UUID;
    sale_ids UUID[];
BEGIN
    SELECT id INTO branch_uuid FROM branches WHERE code = 'STILA-HQ' LIMIT 1;
    SELECT ARRAY_AGG(id) INTO sale_ids FROM sales ORDER BY created_at DESC LIMIT 3;
    
    IF branch_uuid IS NOT NULL AND array_length(sale_ids, 1) > 0 THEN
        INSERT INTO shipments (branch_id, shipment_number, sale_id, status, carrier, tracking_number, shipping_method, recipient_name, recipient_address, recipient_phone)
        VALUES 
            (branch_uuid, 'SHIP-2024-00001', sale_ids[1], 'pending', 'FedEx', 'TRK1234567890', 'express', 'Juan Pérez', 'Av. Reforma 100, Mexico City', '55 1111 1111'),
            (branch_uuid, 'SHIP-2024-00002', sale_ids[2], 'shipped', 'DHL', 'TRK1234567891', 'standard', 'María González', 'Av. Mazaryk 200, Mexico City', '55 2222 2222'),
            (branch_uuid, 'SHIP-2024-00003', sale_ids[3], 'delivered', 'UPS', 'TRK1234567892', 'economy', 'Carlos López', 'Av. Universidad 300, Mexico City', '55 3333 3333')
        ON CONFLICT (shipment_number) DO NOTHING;
    END IF;
END $$;

-- ============================================================================
-- INSTALLATIONS (Instalaciones)
-- ============================================================================

DO $$
DECLARE
    branch_uuid UUID;
    sale_ids UUID[];
    customer_ids UUID[];
    user_ids UUID[];
BEGIN
    SELECT id INTO branch_uuid FROM branches WHERE code = 'STILA-HQ' LIMIT 1;
    SELECT ARRAY_AGG(id) INTO sale_ids FROM sales ORDER BY created_at DESC LIMIT 3;
    SELECT ARRAY_AGG(id) INTO customer_ids FROM customers LIMIT 3;
    SELECT ARRAY_AGG(id) INTO user_ids FROM user_profiles LIMIT 1;
    
    IF branch_uuid IS NOT NULL AND array_length(sale_ids, 1) > 0 THEN
        INSERT INTO installations (branch_id, installation_number, sale_id, customer_id, status, scheduled_date, scheduled_time, estimated_duration, address, city, contact_name, contact_phone, assigned_to)
        VALUES 
            (branch_uuid, 'INST-2024-00001', sale_ids[1], customer_ids[1], 'scheduled', CURRENT_DATE + INTERVAL '7 days', '10:00', 120, 'Av. Reforma 100, Mexico City', 'Mexico City', 'Juan Pérez', '55 1111 1111', user_ids[1]),
            (branch_uuid, 'INST-2024-00002', sale_ids[2], customer_ids[2], 'in_progress', CURRENT_DATE + INTERVAL '3 days', '14:00', 90, 'Av. Mazaryk 200, Mexico City', 'Mexico City', 'María González', '55 2222 2222', user_ids[1]),
            (branch_uuid, 'INST-2024-00003', sale_ids[3], customer_ids[3], 'completed', CURRENT_DATE - INTERVAL '2 days', '09:00', 60, 'Av. Universidad 300, Mexico City', 'Mexico City', 'Carlos López', '55 3333 3333', user_ids[1])
        ON CONFLICT (installation_number) DO NOTHING;
    END IF;
END $$;

-- ============================================================================
-- COMMISSIONS (Comisiones)
-- ============================================================================

DO $$
DECLARE
    sale_ids UUID[];
    user_ids UUID[];
BEGIN
    SELECT ARRAY_AGG(id) INTO sale_ids FROM sales ORDER BY created_at DESC LIMIT 3;
    SELECT ARRAY_AGG(id) INTO user_ids FROM user_profiles LIMIT 2;
    
    IF array_length(sale_ids, 1) > 0 AND array_length(user_ids, 1) > 0 THEN
        INSERT INTO commissions (sale_id, seller_id, sale_amount, commission_rate, commission_amount, adjustments, status)
        SELECT 
            sale_ids[i],
            user_ids[2],
            s.total,
            0.05,
            s.total * 0.05,
            0,
            CASE 
                WHEN i = 1 THEN 'calculated'
                WHEN i = 2 THEN 'approved'
                ELSE 'paid'
            END
        FROM generate_series(1, LEAST(array_length(sale_ids, 1), 3)) AS i
        JOIN sales s ON s.id = sale_ids[i]
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- ============================================================================
-- APPROVAL REQUESTS (Solicitudes de aprobación)
-- ============================================================================

DO $$
DECLARE
    sale_ids UUID[];
    user_ids UUID[];
BEGIN
    SELECT ARRAY_AGG(id) INTO sale_ids FROM sales ORDER BY created_at DESC LIMIT 3;
    SELECT ARRAY_AGG(id) INTO user_ids FROM user_profiles LIMIT 1;
    
    IF array_length(sale_ids, 1) > 0 AND array_length(user_ids, 1) > 0 THEN
        INSERT INTO approval_requests (record_type, record_id, status, current_level, max_level, requested_by, reason, new_value)
        VALUES 
            ('sale', sale_ids[1], 'pending', 1, 1, user_ids[1], 'Descuento mayor al 15%', '{"discount_percent": 20, "discount_amount": 500}'::jsonb),
            ('sale', sale_ids[2], 'approved', 1, 1, user_ids[1], 'Precio menor al mínimo', '{"discount_percent": 10, "discount_amount": 200}'::jsonb),
            ('sale', sale_ids[3], 'rejected', 1, 1, user_ids[1], 'Monto muy alto', '{"total": 10000}'::jsonb)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- ============================================================================
-- ALERTS (Alertas)
-- ============================================================================

DO $$
DECLARE
    branch_uuid UUID;
    user_ids UUID[];
BEGIN
    SELECT id INTO branch_uuid FROM branches WHERE code = 'STILA-HQ' LIMIT 1;
    SELECT ARRAY_AGG(id) INTO user_ids FROM user_profiles LIMIT 1;
    
    IF branch_uuid IS NOT NULL AND array_length(user_ids, 1) > 0 THEN
        INSERT INTO alerts (branch_id, alert_type, severity, title, message, user_id)
        VALUES 
            (branch_uuid, 'low_stock', 'warning', 'Stock bajo en producto', 'El producto SKU-001 tiene menos de 10 unidades en inventario', user_ids[1]),
            (branch_uuid, 'payment_pending', 'info', 'Pago pendiente', 'Hay 3 ventas con pago pendiente por revisar', user_ids[1]),
            (branch_uuid, 'approval_needed', 'critical', 'Aprobación requerida', 'Hay solicitudes de aprobación pendientes de revisión', user_ids[1])
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- ============================================================================
-- AUDIT LOG (Log de auditoría)
-- ============================================================================

DO $$
DECLARE
    branch_uuid UUID;
    sale_ids UUID[];
    user_ids UUID[];
BEGIN
    SELECT id INTO branch_uuid FROM branches WHERE code = 'STILA-HQ' LIMIT 1;
    SELECT ARRAY_AGG(id) INTO sale_ids FROM sales ORDER BY created_at DESC LIMIT 3;
    SELECT ARRAY_AGG(id) INTO user_ids FROM user_profiles LIMIT 1;
    
    IF branch_uuid IS NOT NULL AND array_length(sale_ids, 1) > 0 AND array_length(user_ids, 1) > 0 THEN
        INSERT INTO audit_log (branch_id, user_id, action, table_name, record_id, new_values, ip_address, user_agent)
        VALUES 
            (branch_uuid, user_ids[1], 'create', 'sales', sale_ids[1], '{"sale_number": "SAL-2024-00001", "total": 4988.00}'::jsonb, '192.168.1.100', 'Mozilla/5.0'),
            (branch_uuid, user_ids[1], 'update', 'sales', sale_ids[2], '{"status": "paid"}'::jsonb, '192.168.1.101', 'Mozilla/5.0'),
            (branch_uuid, user_ids[1], 'create', 'sales', sale_ids[3], '{"sale_number": "SAL-2024-00003", "total": 4060.00}'::jsonb, '192.168.1.102', 'Mozilla/5.0')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Mensaje de éxito
DO $$ 
BEGIN
    RAISE NOTICE 'Datos de ejemplo insertados correctamente en todas las tablas';
END $$;
