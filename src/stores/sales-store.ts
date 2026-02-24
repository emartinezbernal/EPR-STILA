import { create } from 'zustand'
import { Sale, SaleStatus, PaymentStatus } from '@/types/database'
import { supabase } from '@/lib/supabase'

interface SaleState {
  sales: Sale[]
  isLoading: boolean
  error: string | null
  setSales: (sales: Sale[]) => void
  fetchSales: () => Promise<void>
  addSale: (sale: Sale) => Promise<boolean>
  updateSale: (id: string, updates: Partial<Sale>) => Promise<boolean>
  deleteSale: (id: string) => Promise<boolean>
  setLoading: (loading: boolean) => void
}

// Fallback mock sales for demo/offline mode
const mockSales: Sale[] = [
  {
    id: '1',
    sale_number: 'SALE-20240115-000001',
    customer_id: '1',
    sales_rep_id: '1',
    branch_id: '1',
    status: 'completed',
    payment_status: 'paid',
    subtotal: 25000,
    tax_amount: 4000,
    discount_amount: 0,
    total: 29000,
    payment_method: 'TARJETA_CREDITO',
    amount_paid: 29000,
    change_given: 0,
    sale_date: '2024-01-15T10:00:00Z',
    completed_at: '2024-01-15T14:00:00Z',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T14:00:00Z',
  },
  {
    id: '2',
    sale_number: 'SALE-20240116-000002',
    customer_id: '2',
    sales_rep_id: '1',
    branch_id: '1',
    status: 'shipped',
    payment_status: 'paid',
    subtotal: 45000,
    tax_amount: 7200,
    discount_amount: 5000,
    total: 47200,
    payment_method: 'TRANSFERENCIA',
    amount_paid: 47200,
    change_given: 0,
    sale_date: '2024-01-16T11:00:00Z',
    shipped_at: '2024-01-16T16:00:00Z',
    created_at: '2024-01-16T11:00:00Z',
    updated_at: '2024-01-16T16:00:00Z',
  },
  {
    id: '3',
    sale_number: 'SALE-20240117-000003',
    customer_id: '3',
    sales_rep_id: '2',
    branch_id: '1',
    status: 'draft',
    payment_status: 'pending',
    subtotal: 8500,
    tax_amount: 1360,
    discount_amount: 0,
    total: 9860,
    payment_method: undefined,
    amount_paid: 0,
    change_given: 0,
    sale_date: '2024-01-17T09:00:00Z',
    created_at: '2024-01-17T09:00:00Z',
    updated_at: '2024-01-17T09:00:00Z',
  },
]

// Local storage key for persisting sales
const LOCAL_STORAGE_KEY = 'erp_stila_sales'

// Get sales from localStorage if available
function getLocalSales(): Sale[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Error reading sales from localStorage:', e)
  }
  return []
}

// Save sales to localStorage
function saveLocalSales(sales: Sale[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sales))
  } catch (e) {
    console.error('Error saving sales to localStorage:', e)
  }
}

export const useSalesStore = create<SaleState>((set, get) => ({
  sales: mockSales,
  isLoading: false,
  error: null,

  setSales: (sales) => {
    saveLocalSales(sales)
    set({ sales })
  },

  fetchSales: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      
      if (error) {
        console.error('Error fetching sales from Supabase:', error)
        // Try to load from localStorage as fallback
        const localSales = getLocalSales()
        if (localSales.length > 0) {
          set({ sales: localSales, isLoading: false })
        } else {
          set({ sales: mockSales, isLoading: false })
        }
        return
      }
      
      if (data && data.length > 0) {
        // Merge with local sales to preserve any added locally
        const localSales = getLocalSales()
        const newLocalSales = localSales.filter(l => !data.some(d => d.id === l.id))
        const mergedSales = [...data, ...newLocalSales] as Sale[]
        saveLocalSales(mergedSales)
        set({ sales: mergedSales, isLoading: false })
      } else {
        // No sales in DB, try localStorage or fallback
        const localSales = getLocalSales()
        if (localSales.length > 0) {
          console.log('No sales in Supabase, using localStorage sales')
          set({ sales: localSales, isLoading: false })
        } else {
          console.log('No sales found in Supabase or localStorage, using demo sales')
          saveLocalSales(mockSales)
          set({ sales: mockSales, isLoading: false })
        }
      }
    } catch (err) {
      console.error('Exception fetching sales:', err)
      // Try to load from localStorage as fallback
      const localSales = getLocalSales()
      if (localSales.length > 0) {
        set({ sales: localSales, isLoading: false })
      } else {
        set({ sales: mockSales, isLoading: false })
      }
    }
  },

  addSale: async (sale: Sale) => {
    // Ensure sale has required fields
    const saleWithId = {
      ...sale,
      id: sale.id || crypto.randomUUID(),
      created_at: sale.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    try {
      const { data, error } = await supabase
        .from('sales')
        .insert({
          sale_number: saleWithId.sale_number,
          sale_type: saleWithId.sale_type || 'retail',
          customer_id: saleWithId.customer_id || null,
          sales_rep_id: saleWithId.sales_rep_id || null,
          branch_id: saleWithId.branch_id || null,
          status: saleWithId.status,
          payment_status: saleWithId.payment_status,
          subtotal: saleWithId.subtotal,
          tax_amount: saleWithId.tax_amount,
          discount_amount: saleWithId.discount_amount,
          total: saleWithId.total,
          payment_method: saleWithId.payment_method || null,
          payment_reference: saleWithId.payment_reference || null,
          amount_paid: saleWithId.amount_paid,
          change_given: saleWithId.change_given,
          sale_date: saleWithId.sale_date,
          completed_at: saleWithId.completed_at || null,
        })
        .select()
        .single()
      
      if (error) {
        console.error('Error adding sale to Supabase:', error)
        // Add locally and persist to localStorage
        const currentSales = get().sales
        const updatedSales = [saleWithId, ...currentSales]
        saveLocalSales(updatedSales)
        set({ sales: updatedSales })
        return true
      }
      
      if (data) {
        const currentSales = get().sales
        const updatedSales = [data as Sale, ...currentSales]
        saveLocalSales(updatedSales)
        set({ sales: updatedSales })
        return true
      }
      return false
    } catch (err) {
      console.error('Exception adding sale:', err)
      // Add locally and persist to localStorage
      const currentSales = get().sales
      const updatedSales = [saleWithId, ...currentSales]
      saveLocalSales(updatedSales)
      set({ sales: updatedSales })
      return true
    }
  },

  updateSale: async (id: string, updates: Partial<Sale>) => {
    const updatedAt = new Date().toISOString()
    
    try {
      const { data, error } = await supabase
        .from('sales')
        .update({
          ...updates,
          updated_at: updatedAt,
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.error('Error updating sale in Supabase:', error)
        // Update locally and persist
        const currentSales = get().sales
        const updatedSales = currentSales.map((sale) =>
          sale.id === id ? { ...sale, ...updates, updated_at: updatedAt } : sale
        )
        saveLocalSales(updatedSales)
        set({ sales: updatedSales })
        return true
      }
      
      if (data) {
        const currentSales = get().sales
        const updatedSales = currentSales.map((sale) =>
          sale.id === id ? data as Sale : sale
        )
        saveLocalSales(updatedSales)
        set({ sales: updatedSales })
        return true
      }
      return false
    } catch (err) {
      console.error('Exception updating sale:', err)
      // Update locally and persist
      const currentSales = get().sales
      const updatedSales = currentSales.map((sale) =>
        sale.id === id ? { ...sale, ...updates, updated_at: updatedAt } : sale
      )
      saveLocalSales(updatedSales)
      set({ sales: updatedSales })
      return true
    }
  },

  deleteSale: async (id: string) => {
    try {
      const { error } = await supabase
        .from('sales')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
        .eq('id', id)
      
      if (error) {
        console.error('Error deleting sale from Supabase:', error)
        // Delete locally and persist
        const currentSales = get().sales
        const updatedSales = currentSales.filter((sale) => sale.id !== id)
        saveLocalSales(updatedSales)
        set({ sales: updatedSales })
        return true
      }
      
      const currentSales = get().sales
      const updatedSales = currentSales.filter((sale) => sale.id !== id)
      saveLocalSales(updatedSales)
      set({ sales: updatedSales })
      return true
    } catch (err) {
      console.error('Exception deleting sale:', err)
      // Delete locally and persist
      const currentSales = get().sales
      const updatedSales = currentSales.filter((sale) => sale.id !== id)
      saveLocalSales(updatedSales)
      set({ sales: updatedSales })
      return true
    }
  },

  setLoading: (isLoading) => set({ isLoading }),
}))
