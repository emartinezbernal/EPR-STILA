// Database types - will be auto-generated from Supabase
export type UserRole = 
  | 'super_admin'
  | 'admin'
  | 'finance_admin'
  | 'operations_admin'
  | 'warehouse_admin'
  | 'sales_manager'
  | 'sales_user'
  | 'installer'
  | 'viewer'

export type SaleStatus = 
  | 'draft'
  | 'confirmed'
  | 'paid'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'refunded'

export type PaymentStatus = 
  | 'pending'
  | 'partial'
  | 'paid'
  | 'refunded'
  | 'cancelled'

export type ApprovalStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'

export type ShippingStatus = 
  | 'pending'
  | 'preparing'
  | 'shipped'
  | 'in_transit'
  | 'delivered'
  | 'cancelled'
  | 'returned'

export type InstallationStatus = 
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'on_hold'

export interface Branch {
  id: string
  code: string
  name: string
  legal_name?: string
  rfc?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  phone?: string
  email?: string
  is_active: boolean
  is_warehouse: boolean
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  user_id: string
  branch_id?: string
  department_id?: string
  role: UserRole
  employee_number?: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  hire_date?: string
  position?: string
  supervisor_id?: string
  commission_rate?: number
  commission_override?: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  sku: string
  barcode?: string
  name: string
  description?: string
  category_id?: string
  brand_id?: string
  base_price: number
  cost_price?: number
  minimum_price?: number
  maximum_discount?: number
  role_pricing?: Record<string, number>
  track_inventory: boolean
  is_kit: boolean
  weight?: number
  dimensions?: { length: number; width: number; height: number }
  images?: string[]
  is_active: boolean
  is_featured: boolean
  stock?: number
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  branch_id?: string
  customer_number?: string
  rfc?: string
  curp?: string
  name: string
  email?: string
  phone?: string
  phone_alt?: string
  street?: string
  exterior_number?: string
  interior_number?: string
  colony?: string
  city?: string
  state?: string
  municipality?: string
  zip_code?: string
  country?: string
  business_name?: string
  tax_regime?: string
  credit_limit?: number
  credit_days?: number
  current_balance?: number
  sales_rep_id?: string
  is_active: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface Sale {
  id: string
  branch_id?: string
  sale_number: string
  sale_type?: string
  customer_id?: string
  sales_rep_id?: string
  status: SaleStatus
  payment_status: PaymentStatus
  subtotal: number
  tax_amount: number
  discount_amount: number
  discount_reason?: string
  total: number
  payment_method?: string
  payment_reference?: string
  amount_paid: number
  change_given: number
  sale_date: string
  confirmed_at?: string
  paid_at?: string
  shipped_at?: string
  delivered_at?: string
  completed_at?: string
  cancelled_at?: string
  notes?: string
  internal_notes?: string
  cost_total?: number
  profit_margin?: number
  cfdi_required?: boolean
  cfdi_id?: string
  created_by?: string
  updated_by?: string
  created_at: string
  updated_at: string
}

export interface SaleItem {
  id: string
  sale_id: string
  product_id?: string
  lot_id?: string
  quantity: number
  unit_price: number
  discount_percent: number
  discount_amount: number
  subtotal: number
  tax_amount: number
  total: number
  unit_cost?: number
  total_cost?: number
  status: string
  notes?: string
  serial_numbers?: string[]
  created_at: string
}

export interface InventoryLot {
  id: string
  lot_number: string
  product_id: string
  warehouse_id?: string
  quantity: number
  reserved_quantity: number
  available_quantity: number
  unit_cost?: number
  total_cost?: number
  receipt_date?: string
  expiration_date?: string
  status: string
  auto_assigned: boolean
  assigned_by?: string
  assigned_at?: string
  created_at: string
  updated_at: string
}

export interface Shipment {
  id: string
  branch_id?: string
  shipment_number: string
  sale_id?: string
  status: ShippingStatus
  carrier?: string
  tracking_number?: string
  shipping_method?: string
  sender_name?: string
  sender_address?: string
  recipient_name?: string
  recipient_address?: string
  recipient_phone?: string
  shipped_at?: string
  delivered_at?: string
  notes?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface Installation {
  id: string
  branch_id?: string
  installation_number: string
  sale_id?: string
  customer_id?: string
  status: InstallationStatus
  scheduled_date?: string
  scheduled_time?: string
  estimated_duration?: number
  address?: string
  city?: string
  contact_name?: string
  contact_phone?: string
  assigned_to?: string
  team_members?: string[]
  started_at?: string
  completed_at?: string
  notes?: string
  completion_notes?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface Commission {
  id: string
  sale_id?: string
  seller_id?: string
  period_id?: string
  sale_amount: number
  commission_rate: number
  commission_amount: number
  adjustments: number
  adjustment_reason?: string
  adjusted_by?: string
  status: string
  paid_at?: string
  payment_reference?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface ApprovalRequest {
  id: string
  definition_id?: string
  record_type: string
  record_id: string
  status: ApprovalStatus
  current_level: number
  max_level: number
  requested_by?: string
  requested_at: string
  reason?: string
  previous_value?: Record<string, unknown>
  new_value?: Record<string, unknown>
  resolved_by?: string
  resolved_at?: string
  resolution_notes?: string
  created_at: string
  updated_at: string
}

export interface Alert {
  id: string
  branch_id?: string
  alert_type: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  title: string
  message?: string
  reference_type?: string
  reference_id?: string
  is_read: boolean
  read_by?: string
  read_at?: string
  user_id?: string
  created_at: string
}

export interface AuditLog {
  id: string
  branch_id?: string
  user_id?: string
  action: string
  table_name?: string
  record_id?: string
  old_values?: Record<string, unknown>
  new_values?: Record<string, unknown>
  ip_address?: string
  user_agent?: string
  created_at: string
}

export interface DashboardStats {
  totalSales: number
  totalCustomers: number
  totalProducts: number
  pendingOrders: number
  lowStockItems: number
  pendingApprovals: number
  salesGrowth: number
  revenueGrowth: number
}
