/**
 * Insert Sample Data into New Tables
 * Run with: npx tsx scripts/insert-sample-data.ts
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

async function insertSampleData() {
  console.log('\n=== Inserting Sample Data ===\n')

  // Get base data IDs
  const { data: branches } = await supabase.from('branches').select('id').limit(1)
  const { data: products } = await supabase.from('products').select('id, base_price').limit(3)
  const { data: customers } = await supabase.from('customers').select('id, name').limit(3)
  const { data: sales } = await supabase.from('sales').select('id, total').limit(3)
  const { data: warehouses } = await supabase.from('warehouses').select('id').limit(1)
  const { data: userProfiles } = await supabase.from('user_profiles').select('id').limit(2)

  const branchId = branches?.[0]?.id
  const warehouseId = warehouses?.[0]?.id
  const userId = userProfiles?.[0]?.id

  let successCount = 0
  let errorCount = 0

  // 1. Insert into sale_items
  if (sales && sales.length > 0 && products && products.length > 0) {
    const saleItems = sales.map((sale, idx) => ({
      sale_id: sale.id,
      product_id: products[idx % products.length].id,
      quantity: Math.floor(Math.random() * 3) + 1,
      unit_price: products[idx % products.length].base_price || 1000,
      discount_percent: 0,
      discount_amount: 0,
      subtotal: (products[idx % products.length].base_price || 1000) * 2,
      tax_amount: (products[idx % products.length].base_price || 1000) * 2 * 0.16,
      total: (products[idx % products.length].base_price || 1000) * 2 * 1.16,
      status: 'active'
    }))

    const { error } = await supabase.from('sale_items').insert(saleItems)
    if (error) {
      console.log('❌ sale_items:', error.message)
      errorCount++
    } else {
      console.log('✅ sale_items: Inserted', saleItems.length, 'records')
      successCount++
    }
  } else {
    console.log('⚠️ sale_items: No sales or products found')
  }

  // 2. Insert into inventory_lots
  if (products && products.length > 0) {
    const lots = products.slice(0, 3).map((product, idx) => ({
      lot_number: `LOT-2024-${String(idx + 1).padStart(4, '0')}`,
      product_id: product.id,
      warehouse_id: warehouseId,
      quantity: Math.floor(Math.random() * 50) + 10,
      reserved_quantity: Math.floor(Math.random() * 5),
      available_quantity: Math.floor(Math.random() * 45) + 5,
      unit_cost: product.base_price ? product.base_price * 0.6 : 500,
      total_cost: product.base_price ? product.base_price * 0.6 * 20 : 10000,
      receipt_date: new Date().toISOString().split('T')[0],
      expiration_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active',
      auto_assigned: false
    }))

    const { error } = await supabase.from('inventory_lots').insert(lots)
    if (error) {
      console.log('❌ inventory_lots:', error.message)
      errorCount++
    } else {
      console.log('✅ inventory_lots: Inserted', lots.length, 'records')
      successCount++
    }
  } else {
    console.log('⚠️ inventory_lots: No products found')
  }

  // 3. Insert into shipments
  if (sales && sales.length > 0 && customers && customers.length > 0) {
    const shipments = sales.slice(0, 3).map((sale, idx) => ({
      branch_id: branchId,
      shipment_number: `SHIP-2024-${String(idx + 1).padStart(5, '0')}`,
      sale_id: sale.id,
      status: ['pending', 'shipped', 'delivered'][idx % 3],
      carrier: ['FedEx', 'DHL', 'UPS'][idx % 3],
      tracking_number: `TRK${Date.now()}${idx}`,
      shipping_method: ['express', 'standard', 'economy'][idx % 3],
      recipient_name: customers[idx % customers.length]?.name || 'Customer Name',
      recipient_address: 'Av. Example 123, Mexico City',
      recipient_phone: '55 1234 5678'
    }))

    const { error } = await supabase.from('shipments').insert(shipments)
    if (error) {
      console.log('❌ shipments:', error.message)
      errorCount++
    } else {
      console.log('✅ shipments: Inserted', shipments.length, 'records')
      successCount++
    }
  } else {
    console.log('⚠️ shipments: No sales or customers found')
  }

  // 4. Insert into installations
  if (sales && sales.length > 0 && customers && customers.length > 0) {
    const installations = sales.slice(0, 3).map((sale, idx) => ({
      branch_id: branchId,
      installation_number: `INST-2024-${String(idx + 1).padStart(5, '0')}`,
      sale_id: sale.id,
      customer_id: customers[idx % customers.length]?.id,
      status: ['scheduled', 'in_progress', 'completed'][idx % 3],
      scheduled_date: new Date(Date.now() + (idx + 1) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      scheduled_time: '10:00',
      estimated_duration: 120,
      address: 'Av. Example 123, Mexico City',
      city: 'Mexico City',
      contact_name: customers[idx % customers.length]?.name || 'Contact Name',
      contact_phone: '55 1234 5678',
      assigned_to: userId
    }))

    const { error } = await supabase.from('installations').insert(installations)
    if (error) {
      console.log('❌ installations:', error.message)
      errorCount++
    } else {
      console.log('✅ installations: Inserted', installations.length, 'records')
      successCount++
    }
  } else {
    console.log('⚠️ installations: No sales or customers found')
  }

  // 5. Insert into commissions
  if (sales && sales.length > 0 && userProfiles && userProfiles.length > 0) {
    const commissions = sales.slice(0, 3).map((sale, idx) => ({
      sale_id: sale.id,
      seller_id: userProfiles[idx % userProfiles.length]?.id,
      sale_amount: sale.total || 1000,
      commission_rate: 0.05,
      commission_amount: (sale.total || 1000) * 0.05,
      adjustments: 0,
      status: ['calculated', 'approved', 'paid'][idx % 3]
    }))

    const { error } = await supabase.from('commissions').insert(commissions)
    if (error) {
      console.log('❌ commissions:', error.message)
      errorCount++
    } else {
      console.log('✅ commissions: Inserted', commissions.length, 'records')
      successCount++
    }
  } else {
    console.log('⚠️ commissions: No sales or users found')
  }

  // 6. Insert into approval_requests
  if (sales && sales.length > 0) {
    const approvals = sales.slice(0, 3).map((sale, idx) => ({
      record_type: 'sale',
      record_id: sale.id,
      status: ['pending', 'approved', 'rejected'][idx % 3],
      current_level: 1,
      max_level: 1,
      requested_by: userId,
      reason: idx === 0 ? 'Descuento mayor al 15%' : 'Precio menor al mínimo',
      new_value: { discount_percent: 20, discount_amount: 500 }
    }))

    const { error } = await supabase.from('approval_requests').insert(approvals)
    if (error) {
      console.log('❌ approval_requests:', error.message)
      errorCount++
    } else {
      console.log('✅ approval_requests: Inserted', approvals.length, 'records')
      successCount++
    }
  } else {
    console.log('⚠️ approval_requests: No sales found')
  }

  // 7. Insert into alerts (already has data, add more)
  const alerts = [
    {
      branch_id: branchId,
      alert_type: 'low_stock',
      severity: 'warning',
      title: 'Stock bajo en producto',
      message: 'El producto SKU-001 tiene menos de 10 unidades en inventario',
      user_id: userId
    },
    {
      branch_id: branchId,
      alert_type: 'payment_pending',
      severity: 'info',
      title: 'Pago pendiente',
      message: 'Hay 3 ventas con pago pendiente por revisar',
      user_id: userId
    },
    {
      branch_id: branchId,
      alert_type: 'approval_needed',
      severity: 'critical',
      title: 'Aprobación requerida',
      message: 'Hay solicitudes de aprobación pendientes de revisión',
      user_id: userId
    }
  ]

  const { error: alertError } = await supabase.from('alerts').insert(alerts)
  if (alertError) {
    console.log('❌ alerts:', alertError.message)
    errorCount++
  } else {
    console.log('✅ alerts: Inserted', alerts.length, 'records')
    successCount++
  }

  // 8. Insert into audit_log
  if (sales && sales.length > 0) {
    const auditLogs = sales.slice(0, 3).map((sale, idx) => ({
      branch_id: branchId,
      user_id: userId,
      action: ['create', 'update', 'delete'][idx % 3],
      table_name: 'sales',
      record_id: sale.id,
      new_values: { sale_number: `SAL-2024-${idx + 1}`, total: sale.total },
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0'
    }))

    const { error } = await supabase.from('audit_log').insert(auditLogs)
    if (error) {
      console.log('❌ audit_log:', error.message)
      errorCount++
    } else {
      console.log('✅ audit_log: Inserted', auditLogs.length, 'records')
      successCount++
    }
  } else {
    console.log('⚠️ audit_log: No sales found')
  }

  console.log('\n=== Summary ===')
  console.log(`✅ Success: ${successCount}`)
  console.log(`❌ Errors: ${errorCount}`)
}

insertSampleData().catch(console.error)
