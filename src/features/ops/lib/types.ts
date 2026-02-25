// Operational Orders Types
export type OpsOrderType = 'delivery' | 'installation' | 'fabrication'

export type OpsOrderStatus = 
  | 'pending' 
  | 'scheduled' 
  | 'in_progress' 
  | 'completed' 
  | 'issue' 
  | 'cancelled'

export type TimeWindow = 'manana' | 'tarde' | 'noche'

export type WallType = 'concreto' | 'madera' | 'tablaroca' | 'ladrillo' | 'otro'

export interface OpsOrder {
  id: string
  type: OpsOrderType
  status: OpsOrderStatus
  saleId: string
  saleFolio?: string
  
  // Scheduling
  scheduledDate?: string
  timeWindow?: TimeWindow
  
  // Address & Contact
  address?: string
  references?: string
  contactName?: string
  contactPhone?: string
  
  // Installation specific
  wallType?: WallType
  notes?: string
  
  // Fabrication specific
  promisedDate?: string
  advancePayment?: number
  
  // Metadata
  createdAt: string
  createdBy?: string
  updatedAt?: string
}

export interface OpsOrdersStore {
  orders: OpsOrder[]
  addOrder: (order: OpsOrder) => void
  addOrders: (orders: OpsOrder[]) => void
  getOrdersBySaleId: (saleId: string) => OpsOrder[]
  getOrdersByType: (type: OpsOrderType) => OpsOrder[]
  updateOrderStatus: (orderId: string, status: OpsOrderStatus) => void
  clearOrders: () => void
}

// LocalStorage key
export const OPS_ORDERS_STORAGE_KEY = 'stila_ops_orders_v1'

// Helper to generate order ID
export function generateOrderId(): string {
  return `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
}

// Helper to get status label
export function getStatusLabel(status: OpsOrderStatus): string {
  const labels: Record<OpsOrderStatus, string> = {
    pending: 'Pendiente',
    scheduled: 'Programada',
    in_progress: 'En progreso',
    completed: 'Completada',
    issue: 'Problema',
    cancelled: 'Cancelada',
  }
  return labels[status]
}

// Helper to get type label
export function getTypeLabel(type: OpsOrderType): string {
  const labels: Record<OpsOrderType, string> = {
    delivery: 'Entrega',
    installation: 'Instalación',
    fabrication: 'Fabricación',
  }
  return labels[type]
}
