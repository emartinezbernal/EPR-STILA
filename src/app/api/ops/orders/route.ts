import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Types matching the frontend
interface OpsOrderInput {
  id: string
  type: 'delivery' | 'installation' | 'fabrication'
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'issue' | 'cancelled'
  saleId: string
  saleFolio?: string
  scheduledDate?: string
  timeWindow?: string
  address?: string
  references?: string
  contactName?: string
  contactPhone?: string
  wallType?: string
  notes?: string
  promisedDate?: string
  advancePayment?: number
  createdAt: string
  createdBy?: string
}

interface CheckoutBody {
  orders: OpsOrderInput[]
}

// Create admin client at runtime (not at module level to avoid build errors)
function getAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    return null
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export async function POST(request: NextRequest) {
  // Get admin client at runtime
  const supabase = getAdminClient()

  if (!supabase) {
    return NextResponse.json(
      { success: false, error: "Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL in server env" },
      { status: 500 }
    )
  }

  try {
    // Support both { orders: [...] } and direct array
    let orders: OpsOrderInput[]
    const body = await request.json()
    orders = Array.isArray(body) ? body : body.orders

    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid orders payload" },
        { status: 400 }
      )
    }

    // Transform orders to match database schema
    const dbOrders = orders.map(order => ({
      id: order.id,
      sale_id: order.saleId,
      order_type: order.type,
      status: order.status,
      scheduled_date: order.scheduledDate,
      time_window: order.timeWindow,
      address: order.address,
      reference: order.references,
      contact_name: order.contactName,
      contact_phone: order.contactPhone,
      wall_type: order.wallType,
      notes: order.notes,
      promised_date: order.promisedDate,
      advance_payment: order.advancePayment,
      created_at: order.createdAt,
      created_by: order.createdBy,
    }))

    // Insert orders into database
    const { data, error } = await supabase
      .from('ops_orders')
      .upsert(dbOrders, { onConflict: 'id' })
      .select('id')

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message, details: error.details },
        { status: 500 }
      )
    }

    const orderIds = data?.map((o: { id: string }) => o.id) || orders.map(o => o.id)

    return NextResponse.json({
      success: true,
      ids: orderIds,
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
