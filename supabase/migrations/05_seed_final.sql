-- =============================================================================
-- ERP STILA - Datos de Ejemplo FINAL
-- =============================================================================
-- Ejecutar en Supabase SQL Editor
-- Versión corregida con los tipos correctos

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
-- 2. BRANCHES
-- ============================================================================
INSERT INTO branches (code, name, legal_name, rfc, address, city, state, zip_code, is_active)
VALUES ('STILA-HQ', 'STILA Headquarters', 'STILA SA DE CV', 'SMA123456ABC', 'Av. Principal 100', 'Mexico City', 'CDMX', '01000', true)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 3. WAREHOUSES
-- ============================================================================
INSERT INTO warehouses (branch_id, code, name, address, is_active, is_default)
SELECT id, 'WH-001', 'Main Warehouse', 'Av. Storage 500', true, true
FROM branches WHERE code = 'STILA-HQ'
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 4. USER PROFILES (sin castear el enum, solo valores de texto)
-- ============================================================================
INSERT INTO user_profiles (branch_id, role, first_name, last_name, email, phone, is_active)
SELECT 
    (SELECT id FROM branches WHERE code = 'STILA-HQ'),
    'admin',
    'Admin',
    'User',
    'admin@stila.com',
    '5512345678',
    true
WHERE NOT EXISTS (SELECT 1 FROM user_profiles WHERE phone = '5512345678');

INSERT INTO user_profiles (branch_id, role, first_name, last_name, email, phone, is_active)
SELECT 
    (SELECT id FROM branches WHERE code = 'STILA-HQ'),
    'sales_user',
    'Sales',
    'Representative',
    'sales@stila.com',
    '5512345679',
    true
WHERE NOT EXISTS (SELECT 1 FROM user_profiles WHERE phone = '5512345679');

-- ============================================================================
-- 5. CUSTOMERS
-- ============================================================================
INSERT INTO customers (branch_id, customer_number, name, email, phone, street, city, state, zip_code, is_active, is_verified)
SELECT 
    (SELECT id FROM branches WHERE code = 'STILA-HQ'),
    'CUST-001',
    'Juan Pérez',
    'juan.perez@email.com',
    '5511111111',
    'Av. Reforma 100',
    'Mexico City',
    'CDMX',
    '01000',
    true,
    true
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE customer_number = 'CUST-001');

INSERT INTO customers (branch_id, customer_number, name, email, phone, street, city, state, zip_code, is_active, is_verified)
SELECT 
    (SELECT id FROM branches WHERE code = 'STILA-HQ'),
    'CUST-002',
    'María González',
    'maria.gonzalez@email.com',
    '5522222222',
    'Av. Mazaryk 200',
    'Mexico City',
    'CDMX',
    '01000',
    true,
    true
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE customer_number = 'CUST-002');

INSERT INTO customers (branch_id, customer_number, name, email, phone, street, city, state, zip_code, is_active, is_verified)
SELECT 
    (SELECT id FROM branches WHERE code = 'STILA-HQ'),
    'CUST-003',
    'Carlos López',
    'carlos.lopez@email.com',
    '5533333333',
    'Av. Universidad 300',
    'Mexico City',
    'CDMX',
    '01000',
    true,
    true
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE customer_number = 'CUST-003');

-- ============================================================================
-- 6. SALES
-- ============================================================================
INSERT INTO sales (branch_id, sale_number, sale_type, customer_id, sales_rep_id, status, payment_status, subtotal, tax_amount, discount_amount, total, payment_method, amount_paid, sale_date)
SELECT 
    (SELECT id FROM branches WHERE code = 'STILA-HQ'),
    'SAL-2024-00001',
    'retail',
    (SELECT id FROM customers WHERE customer_number = 'CUST-001'),
    (SELECT id FROM user_profiles WHERE phone = '5512345679'),
    'completed',
    'paid',
    4300.00,
    688.00,
    0,
    4988.00,
    'credit_card',
    4988.00,
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM sales WHERE sale_number = 'SAL-2024-00001');

INSERT INTO sales (branch_id, sale_number, sale_type, customer_id, sales_rep_id, status, payment_status, subtotal, tax_amount, discount_amount, total, payment_method, amount_paid, sale_date)
SELECT 
    (SELECT id FROM branches WHERE code = 'STILA-HQ'),
    'SAL-2024-00002',
    'retail',
    (SELECT id FROM customers WHERE customer_number = 'CUST-002'),
    (SELECT id FROM user_profiles WHERE phone = '5512345679'),
    'paid',
    'paid',
    1800.00,
    288.00,
    100.00,
    1988.00,
    'cash',
    2000.00,
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM sales WHERE sale_number = 'SAL-2024-00002');

INSERT INTO sales (branch_id, sale_number, sale_type, customer_id, sales_rep_id, status, payment_status, subtotal, tax_amount, discount_amount, total, payment_method, amount_paid, sale_date)
SELECT 
    (SELECT id FROM branches WHERE code = 'STILA-HQ'),
    'SAL-2024-00003',
    'retail',
    (SELECT id FROM customers WHERE customer_number = 'CUST-003'),
    (SELECT id FROM user_profiles WHERE phone = '5512345679'),
    'confirmed',
    'pending',
    3500.00,
    560.00,
    0,
    4060.00,
    'transfer',
    0,
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM sales WHERE sale_number = 'SAL-2024-00003');

-- ============================================================================
-- 7. SALE ITEMS
-- ============================================================================
INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, discount_percent, discount_amount, subtotal, tax_amount, total, status)
SELECT 
    (SELECT id FROM sales WHERE sale_number = 'SAL-2024-00001'),
    (SELECT id FROM products WHERE sku = 'SKU-001'),
    2,
    2500.00,
    0,
    0,
    5000.00,
    800.00,
    5800.00,
    'active'
WHERE EXISTS (SELECT 1 FROM sales WHERE sale_number = 'SAL-2024-00001')
  AND EXISTS (SELECT 1 FROM products WHERE sku = 'SKU-001');

INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, discount_percent, discount_amount, subtotal, tax_amount, total, status)
SELECT 
    (SELECT id FROM sales WHERE sale_number = 'SAL-2024-00002'),
    (SELECT id FROM products WHERE sku = 'SKU-002'),
    1,
    1800.00,
    0,
    0,
    1800.00,
    288.00,
    2088.00,
    'active'
WHERE EXISTS (SELECT 1 FROM sales WHERE sale_number = 'SAL-2024-00002')
  AND EXISTS (SELECT 1 FROM products WHERE sku = 'SKU-002');

-- ============================================================================
-- 8. INVENTORY LOTS
-- ============================================================================
INSERT INTO inventory_lots (lot_number, product_id, warehouse_id, quantity, reserved_quantity, available_quantity, unit_cost, total_cost, receipt_date, expiration_date, status, auto_assigned)
SELECT 
    'LOT-2024-0001',
    (SELECT id FROM products WHERE sku = 'SKU-001'),
    (SELECT id FROM warehouses WHERE code = 'WH-001'),
    50,
    5,
    45,
    1500.00,
    75000.00,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 year',
    'active',
    false
WHERE EXISTS (SELECT 1 FROM products WHERE sku = 'SKU-001')
  AND NOT EXISTS (SELECT 1 FROM inventory_lots WHERE lot_number = 'LOT-2024-0001');

INSERT INTO inventory_lots (lot_number, product_id, warehouse_id, quantity, reserved_quantity, available_quantity, unit_cost, total_cost, receipt_date, expiration_date, status, auto_assigned)
SELECT 
    'LOT-2024-0002',
    (SELECT id FROM products WHERE sku = 'SKU-002'),
    (SELECT id FROM warehouses WHERE code = 'WH-001'),
    30,
    3,
    27,
    900.00,
    27000.00,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 year',
    'active',
    false
WHERE EXISTS (SELECT 1 FROM products WHERE sku = 'SKU-002')
  AND NOT EXISTS (SELECT 1 FROM inventory_lots WHERE lot_number = 'LOT-2024-0002');

-- ============================================================================
-- 9. SHIPMENTS
-- ============================================================================
INSERT INTO shipments (branch_id, shipment_number, sale_id, status, carrier, tracking_number, shipping_method, recipient_name, recipient_address, recipient_phone)
SELECT 
    (SELECT id FROM branches WHERE code = 'STILA-HQ'),
    'SHIP-2024-00001',
    (SELECT id FROM sales WHERE sale_number = 'SAL-2024-00001'),
    'pending',
    'FedEx',
    'TRK1234567890',
    'express',
    'Juan Pérez',
    'Av. Reforma 100, Mexico City',
    '55 1111 1111'
WHERE NOT EXISTS (SELECT 1 FROM shipments WHERE shipment_number = 'SHIP-2024-00001');

INSERT INTO shipments (branch_id, shipment_number, sale_id, status, carrier, tracking_number, shipping_method, recipient_name, recipient_address, recipient_phone)
SELECT 
    (SELECT id FROM branches WHERE code = 'STILA-HQ'),
    'SHIP-2024-00002',
    (SELECT id FROM sales WHERE sale_number = 'SAL-2024-00002'),
    'delivered',
    'DHL',
    'TRK1234567891',
    'standard',
    'María González',
    'Av. Mazaryk 200, Mexico City',
    '55 2222 2222'
WHERE NOT EXISTS (SELECT 1 FROM shipments WHERE shipment_number = 'SHIP-2024-00002');

-- ============================================================================
-- 10. INSTALLATIONS
-- ============================================================================
INSERT INTO installations (branch_id, installation_number, sale_id, customer_id, status, scheduled_date, scheduled_time, estimated_duration, address, city, contact_name, contact_phone, assigned_to)
SELECT 
    (SELECT id FROM branches WHERE code = 'STILA-HQ'),
    'INST-2024-00001',
    (SELECT id FROM sales WHERE sale_number = 'SAL-2024-00001'),
    (SELECT id FROM customers WHERE customer_number = 'CUST-001'),
    'scheduled',
    CURRENT_DATE + INTERVAL '7 days',
    '10:00',
    120,
    'Av. Reforma 100, Mexico City',
    'Mexico City',
    'Juan Pérez',
    '55 1111 1111',
    (SELECT id FROM user_profiles WHERE phone = '5512345678')
WHERE NOT EXISTS (SELECT 1 FROM installations WHERE installation_number = 'INST-2024-00001');

-- ============================================================================
-- 11. COMMISSIONS
-- ============================================================================
INSERT INTO commissions (sale_id, seller_id, sale_amount, commission_rate, commission_amount, adjustments, status)
SELECT 
    (SELECT id FROM sales WHERE sale_number = 'SAL-2024-00001'),
    (SELECT id FROM user_profiles WHERE phone = '5512345679'),
    4988.00,
    0.05,
    249.40,
    0,
    'calculated'
WHERE EXISTS (SELECT 1 FROM sales WHERE sale_number = 'SAL-2024-00001');

INSERT INTO commissions (sale_id, seller_id, sale_amount, commission_rate, commission_amount, adjustments, status)
SELECT 
    (SELECT id FROM sales WHERE sale_number = 'SAL-2024-00002'),
    (SELECT id FROM user_profiles WHERE phone = '5512345679'),
    1988.00,
    0.05,
    99.40,
    0,
    'approved'
WHERE EXISTS (SELECT 1 FROM sales WHERE sale_number = 'SAL-2024-00002');

-- ============================================================================
-- 12. APPROVAL REQUESTS
-- ============================================================================
INSERT INTO approval_requests (record_type, record_id, status, current_level, max_level, requested_by, reason, new_value)
SELECT 
    'sale',
    (SELECT id FROM sales WHERE sale_number = 'SAL-2024-00003'),
    'pending',
    1,
    1,
    (SELECT id FROM user_profiles WHERE phone = '5512345678'),
    'Descuento mayor al 15%',
    '{"discount_percent": 20, "discount_amount": 500}'
WHERE EXISTS (SELECT 1 FROM sales WHERE sale_number = 'SAL-2024-00003');

-- ============================================================================
-- 13. ALERTS
-- ============================================================================
INSERT INTO alerts (branch_id, alert_type, severity, title, message, user_id)
SELECT 
    (SELECT id FROM branches WHERE code = 'STILA-HQ'),
    'low_stock',
    'warning',
    'Stock bajo en producto',
    'El producto SKU-001 tiene menos de 10 unidades en inventario',
    (SELECT id FROM user_profiles WHERE phone = '5512345678')
WHERE NOT EXISTS (SELECT 1 FROM alerts WHERE title = 'Stock bajo en producto');

INSERT INTO alerts (branch_id, alert_type, severity, title, message, user_id)
SELECT 
    (SELECT id FROM branches WHERE code = 'STILA-HQ'),
    'payment_pending',
    'info',
    'Pago pendiente',
    'Hay 3 ventas con pago pendiente por revisar',
    (SELECT id FROM user_profiles WHERE phone = '5512345678')
WHERE NOT EXISTS (SELECT 1 FROM alerts WHERE title = 'Pago pendiente');

-- ============================================================================
-- 14. AUDIT LOG
-- ============================================================================
INSERT INTO audit_log (branch_id, user_id, action, table_name, record_id, new_values, ip_address, user_agent)
SELECT 
    (SELECT id FROM branches WHERE code = 'STILA-HQ'),
    (SELECT id FROM user_profiles WHERE phone = '5512345678'),
    'create',
    'sales',
    (SELECT id FROM sales WHERE sale_number = 'SAL-2024-00001'),
    '{"sale_number": "SAL-2024-00001", "total": 4988.00}',
    '192.168.1.100',
    'Mozilla/5.0'
WHERE EXISTS (SELECT 1 FROM sales WHERE sale_number = 'SAL-2024-00001');

-- Mensaje de éxito
DO $$ 
BEGIN
    RAISE NOTICE 'Datos de ejemplo insertados correctamente en todas las tablas';
END $$;
