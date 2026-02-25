import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy Supabase client - only create when needed
let _supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient | null {
  if (_supabase) return _supabase
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Supabase env vars not configured')
    return null
  }
  
  _supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  
  return _supabase
}

// LocalStorage keys
const WALKIN_CUSTOMER_ID_KEY = 'stila_walkin_customer_id'
const DEFAULT_BRANCH_ID_KEY = 'stila_default_branch_id'

/**
 * Get or create the default branch UUID
 * Priority: localStorage > first active branch > null
 */
export async function getDefaultBranchId(): Promise<string | null> {
  // Check localStorage first
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(DEFAULT_BRANCH_ID_KEY)
    if (cached) return cached
  }

  const supabase = getSupabase()
  if (!supabase) {
    console.warn('Supabase not available for getDefaultBranchId')
    return null
  }

  try {
    // Query for first active branch
    const { data, error } = await supabase
      .from('branches')
      .select('id')
      .eq('is_active', true)
      .limit(1)
      .single()

    if (error || !data) {
      console.warn('No active branch found')
      return null
    }

    // Cache in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(DEFAULT_BRANCH_ID_KEY, data.id)
    }

    return data.id
  } catch (error) {
    console.error('Error getting default branch:', error)
    return null
  }
}

/**
 * Get or create Walk-in Customer UUID
 * Creates a generic customer for walk-in sales if none exists
 */
export async function getOrCreateWalkinCustomer(branchId: string | null): Promise<string | null> {
  // Check localStorage first
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(WALKIN_CUSTOMER_ID_KEY)
    if (cached) return cached
  }

  const supabase = getSupabase()
  if (!supabase) {
    console.warn('Supabase not available for getOrCreateWalkinCustomer')
    return null
  }

  try {
    // Try to find existing walk-in customer
    const { data: existingCustomer, error: searchError } = await supabase
      .from('customers')
      .select('id')
      .ilike('name', '%cliente%20mostrador%')
      .or('name.eq.Cliente Mostrador')
      .or('name.eq.Walk-in')
      .or('name.eq.Walk In')
      .limit(1)
      .single()

    if (existingCustomer) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(WALKIN_CUSTOMER_ID_KEY, existingCustomer.id)
      }
      return existingCustomer.id
    }

    // Create walk-in customer if not found
    const { data: newCustomer, error: createError } = await supabase
      .from('customers')
      .insert({
        name: 'Cliente Mostrador',
        customer_number: 'WALKIN-001',
        branch_id: branchId,
        is_active: true,
        is_verified: false,
      } as any)
      .select('id')
      .single()

    if (createError) {
      console.error('Error creating walk-in customer:', createError)
      return null
    }

    if (newCustomer) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(WALKIN_CUSTOMER_ID_KEY, newCustomer.id)
      }
      return newCustomer.id
    }

    return null
  } catch (error) {
    console.error('Error getting walk-in customer:', error)
    return null
  }
}

/**
 * Resolve all required UUIDs for a sale
 * Returns branchId, customerId, and salesRepId
 */
export async function resolveSaleUUIDs(): Promise<{
  branchId: string | null
  customerId: string | null
  salesRepId: string | null
}> {
  const branchId = await getDefaultBranchId()
  const customerId = await getOrCreateWalkinCustomer(branchId)
  
  // Sales rep is optional - can be null
  const salesRepId: string | null = null

  return {
    branchId,
    customerId,
    salesRepId,
  }
}
