import { create } from 'zustand'
import { Customer } from '@/types/database'
import { supabase } from '@/lib/supabase'

interface CustomerState {
  customers: Customer[]
  isLoading: boolean
  error: string | null
  setCustomers: (customers: Customer[]) => void
  fetchCustomers: () => Promise<void>
  addCustomer: (customer: Customer) => Promise<boolean>
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<boolean>
  deleteCustomer: (id: string) => Promise<boolean>
  setLoading: (loading: boolean) => void
}

// Fallback mock customers for demo/offline mode
const mockCustomers: Customer[] = [
  {
    id: '1',
    customer_number: 'CUS00001',
    name: 'Empresa Alpha',
    email: 'contacto@alpha.com',
    phone: '5551234001',
    street: 'Av. Principal 100',
    colony: 'Centro',
    city: 'Mexico City',
    state: 'CDMX',
    zip_code: '01000',
    rfc: 'XAXX010101ABC',
    business_name: 'Empresa Alpha SA de CV',
    tax_regime: 'Persona Moral',
    credit_limit: 100000,
    credit_days: 30,
    is_active: true,
    is_verified: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    customer_number: 'CUS00002',
    name: 'Corporativo Beta',
    email: 'info@beta.com',
    phone: '5551234002',
    street: 'Blvd. Central 500',
    colony: 'Norte',
    city: 'Monterrey',
    state: 'NL',
    zip_code: '64000',
    rfc: 'XABB020202ABC',
    business_name: 'Corporativo Beta SC',
    tax_regime: 'Persona Moral',
    credit_limit: 150000,
    credit_days: 45,
    is_active: true,
    is_verified: true,
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: '3',
    customer_number: 'CUS00003',
    name: 'Tech Solutions',
    email: 'contacto@techsol.com',
    phone: '5551234003',
    street: 'Av. Tech 200',
    colony: 'Tech Park',
    city: 'Guadalajara',
    state: 'JAL',
    zip_code: '44100',
    rfc: 'XATS030303ABC',
    business_name: 'Tech Solutions SA de CV',
    tax_regime: 'Persona Moral',
    credit_limit: 200000,
    credit_days: 60,
    is_active: true,
    is_verified: true,
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
]

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: mockCustomers,
  isLoading: false,
  error: null,

  setCustomers: (customers) => set({ customers }),

  fetchCustomers: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })
      
      if (error) {
        console.error('Error fetching customers from Supabase:', error)
        // Use mock customers if Supabase fails
        set({ customers: mockCustomers, isLoading: false })
        return
      }
      
      if (data && data.length > 0) {
        set({ customers: data as Customer[], isLoading: false })
      } else {
        // No customers in DB, use mock and suggest seeding
        console.log('No customers found in Supabase, using demo customers')
        set({ customers: mockCustomers, isLoading: false })
      }
    } catch (err) {
      console.error('Exception fetching customers:', err)
      set({ customers: mockCustomers, isLoading: false })
    }
  },

  addCustomer: async (customer: Customer) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          customer_number: customer.customer_number,
          name: customer.name,
          email: customer.email || null,
          phone: customer.phone || null,
          street: customer.street || null,
          colony: customer.colony || null,
          city: customer.city || null,
          state: customer.state || null,
          zip_code: customer.zip_code || null,
          rfc: customer.rfc || null,
          business_name: customer.business_name || null,
          tax_regime: customer.tax_regime || null,
          credit_limit: customer.credit_limit || null,
          credit_days: customer.credit_days || null,
          is_active: customer.is_active,
          is_verified: customer.is_verified,
        })
        .select()
        .single()
      
      if (error) {
        console.error('Error adding customer to Supabase:', error)
        // Fallback: add locally
        set((state) => ({ customers: [customer, ...state.customers] }))
        return true
      }
      
      if (data) {
        set((state) => ({ customers: [data as Customer, ...state.customers] }))
        return true
      }
      return false
    } catch (err) {
      console.error('Exception adding customer:', err)
      // Fallback: add locally
      set((state) => ({ customers: [customer, ...state.customers] }))
      return true
    }
  },

  updateCustomer: async (id: string, updates: Partial<Customer>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.error('Error updating customer in Supabase:', error)
        // Fallback: update locally
        set((state) => ({
          customers: state.customers.map((customer) =>
            customer.id === id ? { ...customer, ...updates, updated_at: new Date().toISOString() } : customer
          )
        }))
        return true
      }
      
      if (data) {
        set((state) => ({
          customers: state.customers.map((customer) =>
            customer.id === id ? data as Customer : customer
          )
        }))
        return true
      }
      return false
    } catch (err) {
      console.error('Exception updating customer:', err)
      // Fallback: update locally
      set((state) => ({
        customers: state.customers.map((customer) =>
          customer.id === id ? { ...customer, ...updates, updated_at: new Date().toISOString() } : customer
        )
      }))
      return true
    }
  },

  deleteCustomer: async (id: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({ is_active: false })
        .eq('id', id)
      
      if (error) {
        console.error('Error deleting customer from Supabase:', error)
        return false
      }
      
      set((state) => ({
        customers: state.customers.filter((customer) => customer.id !== id)
      }))
      return true
    } catch (err) {
      console.error('Exception deleting customer:', err)
      return false
    }
  },

  setLoading: (isLoading) => set({ isLoading }),
}))
