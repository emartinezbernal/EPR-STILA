import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with service role for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Use service role key for bypassing RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

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

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutBody = await request.json()
    const { orders } = body

    if (!orders || orders.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No orders provided' },
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
      reference: order.reference,
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
      console.error('Ops orders insert error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    const orderIds = data?.map(o => o.id) || orders.map(o => o.id)

    return NextResponse.json({
      success: true,
      orderIds,
    })

  } catch (error) {
    console.error('Ops orders route error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
