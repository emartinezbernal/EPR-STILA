/**
 * Seed All Tables - Base and New Tables
 * Run with: npx tsx scripts/seed-all-tables.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8')
  content.split('\n').forEach(line => {
    const t = line.trim()
    if (t && !t.startsWith('#')) {
      const eq = t.indexOf('=')
      if (eq > 0) {
        let v = t.substring(eq + 1).trim()
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
        process.env[t.substring(0, eq).trim()] = v
      }
    }
  })
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

async function seedAllTables() {
  console.log('\n=== Seeding All Tables ===\n')

  // 1. Insert Branch if not exists
  const { data: existingBranch } = await supabase.from('branches').select('id').limit(1)
  let branchId = existingBranch?.[0]?.id

  if (!branchId) {
    const { data: branch, error } = await supabase.from('branches').insert({
      code: 'STILA-HQ',
      name: 'STILA Headquarters',
      legal_name: 'STILA SA DE CV',
      rfc: 'SMA123456ABC',
      address: 'Av. Principal 100',
      city: 'Mexico City',
      state: 'CDMX',
      zip_code: '01000',
      is_active: true
    }).select().single()
    
    if (branch) branchId = branch.id
    console.log('✅ Branch created:', branchId)
  } else {
    console.log('✅ Branch already exists:', branchId)
  }

  // 2. Insert Warehouse if not exists
  const { data: existingWarehouse } = await supabase.from('warehouses').select('id').limit(1)
  let warehouseId = existingWarehouse?.[0]?.id

  if (!warehouseId) {
    const { data: warehouse } = await supabase.from('warehouses').insert({
      branch_id: branchId,
      code: 'WH-001',
      name: 'Main Warehouse',
      address: 'Av. Storage 500',
      is_active: true,
      is_default: true
    }).select().single()
    
    if (warehouse) warehouseId = warehouse.id
    console.log('✅ Warehouse created:', warehouseId)
  } else {
    console.log('✅ Warehouse already exists:', warehouseId)
  }

  // 3. Insert User Profiles if not exists
  const { data: existingUsers } = await supabase.from('user_profiles').select('id').limit(2)
  let userIds: string[] = []

  if (!existingUsers || existingUsers.length === 0) {
    const { data: users } = await supabase.from('user_profiles').insert([
      {
        branch_id: branchId,
        role: 'admin',
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@stila.com',
        phone: '5512345678',
        is_active: true
      },
      {
        branch_id: branchId,
        role: 'sales_user',
        first_name: 'Sales',
        last_name: 'Representative',
        email: 'sales@stila.com',
        phone: '5512345679',
        is_active: true
      }
    ]).select()
    
    if (users) userIds = users.map(u => u.id)
    console.log('✅ User Profiles created:', userIds.length)
  } else {
    userIds = existingUsers.map(u => u.id)
    console.log('✅ User Profiles already exist:', userIds.length)
  }

  // 4. Insert Products if not exists
  const { data: existingProducts } = await supabase.from('products').select('id, base_price').limit(3)
  let productIds: { id: string, base_price: number }[] = []

  if (!existingProducts || existingProducts.length === 0) {
    const { data: products } = await supabase.from('products').insert([
      {
        sku: 'SKU-001',
        barcode: '7501234567890',
        name: 'Office Desk Pro',
        description: 'Professional office desk with drawers',
        base_price: 2500.00,
        cost_price: 1500.00,
        track_inventory: true,
        is_kit: false,
        is_active: true,
        is_featured: true
      },
      {
        sku: 'SKU-002',
        barcode: '7501234567891',
        name: 'Ergonomic Chair',
        description: 'High-back ergonomic chair',
        base_price: 1800.00,
        cost_price: 900.00,
        track_inventory: true,
        is_kit: false,
        is_active: true,
        is_featured: true
      },
      {
        sku: 'SKU-003',
        barcode: '7501234567892',
        name: 'LED Monitor 27"',
        description: '27 inch LED monitor',
        base_price: 3500.00,
        cost_price: 2100.00,
        track_inventory: true,
        is_kit: false,
        is_active: true,
        is_featured: false
      }
    ]).select()
    
    if (products) productIds = products.map(p => ({ id: p.id, base_price: p.base_price }))
    console.log('✅ Products created:', productIds.length)
  } else {
    productIds = existingProducts.map(p => ({ id: p.id, base_price: p.base_price }))
    console.log('✅ Products already exist:', productIds.length)
  }

  // 5. Insert Customers if not exists
  const { data: existingCustomers } = await supabase.from('customers').select('id').limit(3)
  let customerIds: string[] = []

  if (!existingCustomers || existingCustomers.length === 0) {
    const { data: customers } = await supabase.from('customers').insert([
      {
        branch_id: branchId,
        customer_number: 'CUST-001',
        name: 'Juan Pérez',
        email: 'juan.perez@email.com',
        phone: '5511111111',
        street: 'Av. Reforma 100',
        city: 'Mexico City',
        state: 'CDMX',
        zip_code: '06600',
        is_active: true,
        is_verified: true
      },
      {
        branch_id: branchId,
        customer_number: 'CUST-002',
        name: 'María González',
        email: 'maria.gonzalez@email.com',
        phone: '5522222222',
        street: 'Av. Mazaryk 200',
        city: 'Mexico City',
        state: 'CDMX',
        zip_code: '11500',
        is_active: true,
        is_verified: true
      },
      {
        branch_id: branchId,
        customer_number: 'CUST-003',
        name: 'Carlos López',
        email: 'carlos.lopez@email.com',
        phone: '5533333333',
        street: 'Av. Universidad 300',
        city: 'Mexico City',
        state: 'CDMX',
        zip_code: '04510',
        is_active: true,
        is_verified: false
      }
    ]).select()
    
    if (customers) customerIds = customers.map(c => c.id)
    console.log('✅ Customers created:', customerIds.length)
  } else {
    customerIds = existingCustomers.map(c => c.id)
    console.log('✅ Customers already exist:', customerIds.length)
  }

  // 6. Insert Sales if not exists
  const { data: existingSales } = await supabase.from('sales').select('id, total').limit(3)
  let saleIds: { id: string, total: number }[] = []

  if (!existingSales || existingSales.length === 0) {
    const { data: sales } = await supabase.from('sales').insert([
      {
        branch_id: branchId,
        sale_number: 'SAL-2024-00001',
        sale_type: 'retail',
        customer_id: customerIds[0],
        sales_rep_id: userIds[1],
        status: 'completed',
        payment_status: 'paid',
        subtotal: 4300.00,
        tax_amount: 688.00,
        discount_amount: 0,
        total: 4988.00,
        payment_method: 'credit_card',
        amount_paid: 4988.00,
        sale_date: new Date().toISOString()
      },
      {
        branch_id: branchId,
        sale_number: 'SAL-2024-00002',
        sale_type: 'retail',
        customer_id: customerIds[1],
        sales_rep_id: userIds[1],
        status: 'paid',
        payment_status: 'paid',
        subtotal: 1800.00,
        tax_amount: 288.00,
        discount_amount: 100.00,
        total: 1988.00,
        payment_method: 'cash',
        amount_paid: 2000.00,
        change_given: 12.00,
        sale_date: new Date().toISOString()
      },
      {
        branch_id: branchId,
        sale_number: 'SAL-2024-00003',
        sale_type: 'retail',
        customer_id: customerIds[2],
        sales_rep_id: userIds[1],
        status: 'confirmed',
        payment_status: 'pending',
        subtotal: 3500.00,
        tax_amount: 560.00,
        discount_amount: 0,
        total: 4060.00,
        payment_method: 'transfer',
        amount_paid: 0,
        sale_date: new Date().toISOString()
      }
    ]).select()
    
    if (sales) saleIds = sales.map(s => ({ id: s.id, total: s.total }))
    console.log('✅ Sales created:', saleIds.length)
  } else {
    saleIds = existingSales.map(s => ({ id: s.id, total: s.total }))
    console.log('✅ Sales already exist:', saleIds.length)
  }

  // ========== NOW INSERT INTO NEW TABLES ==========
  
  console.log('\n=== Inserting into New Tables ===\n')

  // 7. Sale Items
  if (saleIds.length > 0 && productIds.length > 0) {
    const saleItems = saleIds.map((sale, idx) => ({
      sale_id: sale.id,
      product_id: productIds[idx % productIds.length].id,
      quantity: 2,
      unit_price: productIds[idx % productIds.length].base_price,
      discount_percent: 0,
      discount_amount: 0,
      subtotal: productIds[idx % productIds.length].base_price * 2,
      tax_amount: productIds[idx % productIds.length].base_price * 2 * 0.16,
      total: productIds[idx % productIds.length].base_price * 2 * 1.16,
      status: 'active'
    }))

    const { error } = await supabase.from('sale_items').insert(saleItems)
    console.log(error ? '❌ sale_items: ' + error.message : `✅ sale_items: Inserted ${saleItems.length} records`)
  }

  // 8. Inventory Lots
  if (productIds.length > 0) {
    const lots = productIds.map((product, idx) => ({
      lot_number: `LOT-2024-${String(idx + 1).padStart(4, '0')}`,
      product_id: product.id,
      warehouse_id: warehouseId,
      quantity: 50,
      reserved_quantity: 5,
      available_quantity: 45,
      unit_cost: product.base_price * 0.6,
      total_cost: product.base_price * 0.6 * 50,
      receipt_date: new Date().toISOString().split('T')[0],
      expiration_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active',
      auto_assigned: false
    }))

    const { error } = await supabase.from('inventory_lots').insert(lots)
    console.log(error ? '❌ inventory_lots: ' + error.message : `✅ inventory_lots: Inserted ${lots.length} records`)
  }

  // 9. Shipments
  if (saleIds.length > 0 && customerIds.length > 0) {
    const shipments = saleIds.slice(0, 3).map((sale, idx) => ({
      branch_id: branchId,
      shipment_number: `SHIP-2024-${String(idx + 1).padStart(5, '0')}`,
      sale_id: sale.id,
      status: ['pending', 'shipped', 'delivered'][idx % 3],
      carrier: ['FedEx', 'DHL', 'UPS'][idx % 3],
      tracking_number: `TRK${Date.now()}${idx}`,
      shipping_method: ['express', 'standard', 'economy'][idx % 3],
      recipient_name: 'Customer ' + (idx + 1),
      recipient_address: `Av. Example ${idx + 1}00, Mexico City`,
      recipient_phone: `55 1234 ${5678 + idx}`
    }))

    const { error } = await supabase.from('shipments').insert(shipments)
    console.log(error ? '❌ shipments: ' + error.message : `✅ shipments: Inserted ${shipments.length} records`)
  }

  // 10. Installations
  if (saleIds.length > 0 && customerIds.length > 0) {
    const installations = saleIds.slice(0, 3).map((sale, idx) => ({
      branch_id: branchId,
      installation_number: `INST-2024-${String(idx + 1).padStart(5, '0')}`,
      sale_id: sale.id,
      customer_id: customerIds[idx % customerIds.length],
      status: ['scheduled', 'in_progress', 'completed'][idx % 3],
      scheduled_date: new Date(Date.now() + (idx + 1) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      scheduled_time: '10:00',
      estimated_duration: 120,
      address: `Av. Example ${idx + 1}00, Mexico City`,
      city: 'Mexico City',
      contact_name: 'Customer ' + (idx + 1),
      contact_phone: `55 1234 ${5678 + idx}`,
      assigned_to: userIds[0]
    }))

    const { error } = await supabase.from('installations').insert(installations)
    console.log(error ? '❌ installations: ' + error.message : `✅ installations: Inserted ${installations.length} records`)
  }

  // 11. Commissions
  if (saleIds.length > 0 && userIds.length > 0) {
    const commissions = saleIds.slice(0, 3).map((sale, idx) => ({
      sale_id: sale.id,
      seller_id: userIds[1],
      sale_amount: sale.total,
      commission_rate: 0.05,
      commission_amount: sale.total * 0.05,
      adjustments: 0,
      status: ['calculated', 'approved', 'paid'][idx % 3]
    }))

    const { error } = await supabase.from('commissions').insert(commissions)
    console.log(error ? '❌ commissions: ' + error.message : `✅ commissions: Inserted ${commissions.length} records`)
  }

  // 12. Approval Requests
  if (saleIds.length > 0) {
    const approvals = saleIds.slice(0, 3).map((sale, idx) => ({
      record_type: 'sale',
      record_id: sale.id,
      status: ['pending', 'approved', 'rejected'][idx % 3],
      current_level: 1,
      max_level: 1,
      requested_by: userIds[0],
      reason: idx === 0 ? 'Descuento mayor al 15%' : 'Precio menor al mínimo',
      new_value: { discount_percent: 20, discount_amount: 500 }
    }))

    const { error } = await supabase.from('approval_requests').insert(approvals)
    console.log(error ? '❌ approval_requests: ' + error.message : `✅ approval_requests: Inserted ${approvals.length} records`)
  }

  // 13. Alerts
  const alerts = [
    {
      branch_id: branchId,
      alert_type: 'low_stock',
      severity: 'warning',
      title: 'Stock bajo en producto',
      message: 'El producto SKU-001 tiene menos de 10 unidades en inventario',
      user_id: userIds[0]
    },
    {
      branch_id: branchId,
      alert_type: 'payment_pending',
      severity: 'info',
      title: 'Pago pendiente',
      message: 'Hay 3 ventas con pago pendiente por revisar',
      user_id: userIds[0]
    },
    {
      branch_id: branchId,
      alert_type: 'approval_needed',
      severity: 'critical',
      title: 'Aprobación requerida',
      message: 'Hay solicitudes de aprobación pendientes de revisión',
      user_id: userIds[0]
    }
  ]

  const { error: alertError } = await supabase.from('alerts').insert(alerts)
  console.log(alertError ? '❌ alerts: ' + alertError.message : `✅ alerts: Inserted ${alerts.length} records`)

  // 14. Audit Log
  if (saleIds.length > 0) {
    const auditLogs = saleIds.slice(0, 3).map((sale, idx) => ({
      branch_id: branchId,
      user_id: userIds[0],
      action: ['create', 'update', 'delete'][idx % 3],
      table_name: 'sales',
      record_id: sale.id,
      new_values: { sale_number: `SAL-2024-${String(idx + 1).padStart(5, '0')}`, total: sale.total },
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0'
    }))

    const { error } = await supabase.from('audit_log').insert(auditLogs)
    console.log(error ? '❌ audit_log: ' + error.message : `✅ audit_log: Inserted ${auditLogs.length} records`)
  }

  console.log('\n=== Seeding Complete ===\n')
}

seedAllTables().catch(console.error)
