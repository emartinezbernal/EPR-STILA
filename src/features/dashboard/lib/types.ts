// Dashboard Executive Types

export interface TodaySales {
  total: number
  count: number
  averageTicket: number
}

export interface TodayServices {
  installations: number
  deliveries: number
  revenue: number
}

export interface GoalProgress {
  monthlyGoal: number
  current: number
  percentage: number
  yesterdayComparison: number // percentage difference vs yesterday (e.g., +15 or -5)
  delta: number // absolute dollar difference from target
  isOnTrack: boolean // true if >= 80% of expected progress
}

export interface TodayInstallation {
  id: string
  scheduledTime: string
  customerName: string
  address: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'on_hold'
}

export interface TodayDelivery {
  id: string
  saleNumber: string
  customerName: string
  address: string
  status: 'pending' | 'preparing' | 'shipped' | 'delivered'
}

export interface LowStockItem {
  id: string
  name: string
  sku: string
  currentStock: number
  minimumStock: number
}

export interface PendingApproval {
  id: string
  type: string
  requestedBy: string
  requestedAt: string
  reason?: string
}

export interface DelayedOrder {
  id: string
  type: 'installation' | 'delivery'
  saleNumber: string
  customerName: string
  scheduledDate: string
  delayDays: number
}

export interface TopSeller {
  id: string
  name: string
  sales: number
  orders: number
}

export interface TopProduct {
  id: string
  name: string
  sku: string
  quantity: number
  revenue: number
}

export interface ActiveCustomer {
  id: string
  name: string
  lastOrderDate: string
  totalOrders: number
}

export interface RecentActivity {
  id: string
  type: 'sale' | 'installation' | 'delivery' | 'approval' | 'stock'
  message: string
  timestamp: string
  color: 'green' | 'blue' | 'yellow' | 'red' | 'purple'
}

export interface SalesAtRisk {
  salesWithoutInstallation: number
  deliveriesWithoutDate: number
  pendingQuotations: number
}

export interface DashboardSummary {
  // Row 1 - Money
  todaySales: TodaySales
  ticketAverage: number
  todayServices: TodayServices
  goalProgress: GoalProgress
  
  // Row 2 - Operation
  todayInstallations: TodayInstallation[]
  todayDeliveries: TodayDelivery[]
  pendingToSchedule: number
  salesAtRisk: SalesAtRisk
  
  // Row 3 - Risks
  lowStockItems: LowStockItem[]
  pendingApprovals: PendingApproval[]
  delayedOrders: DelayedOrder[]
  
  // Row 4 - Commercial
  topSellers: TopSeller[]
  topProducts: TopProduct[]
  activeCustomers: ActiveCustomer[]
  
  // Row 5 - Activity
  recentActivity: RecentActivity[]
}

// Default mock data for demo/offline mode
export const mockDashboardSummary: DashboardSummary = {
  todaySales: {
    total: 125000,
    count: 28,
    averageTicket: 4464.29,
  },
  ticketAverage: 4464.29,
  todayServices: {
    installations: 8,
    deliveries: 12,
    revenue: 45000,
  },
  goalProgress: {
    monthlyGoal: 5000000,
    current: 3250000,
    percentage: 65,
    yesterdayComparison: 12.5,
    delta: -1750000,
    isOnTrack: true,
  },
  salesAtRisk: {
    salesWithoutInstallation: 8,
    deliveriesWithoutDate: 5,
    pendingQuotations: 12,
  },
  todayInstallations: [
    { id: '1', scheduledTime: '09:00', customerName: 'Juan Pérez', address: 'Av. Principal 123', status: 'scheduled' },
    { id: '2', scheduledTime: '10:30', customerName: 'María García', address: 'Calle Oak 456', status: 'in_progress' },
    { id: '3', scheduledTime: '12:00', customerName: 'Carlos López', address: 'Blvd. Central 789', status: 'scheduled' },
    { id: '4', scheduledTime: '14:00', customerName: 'Ana Martínez', address: 'Plaza Mayor 321', status: 'scheduled' },
    { id: '5', scheduledTime: '16:00', customerName: 'Roberto Sánchez', address: 'Av. Norte 654', status: 'on_hold' },
  ],
  todayDeliveries: [
    { id: '1', saleNumber: 'SALE-001', customerName: 'Laura Díaz', address: 'Calle Sur 111', status: 'delivered' },
    { id: '2', saleNumber: 'SALE-002', customerName: 'Miguel Torres', address: 'Av. Este 222', status: 'shipped' },
    { id: '3', saleNumber: 'SALE-003', customerName: 'Sofia Ramírez', address: 'Calle Oeste 333', status: 'preparing' },
    { id: '4', saleNumber: 'SALE-004', customerName: 'David Flores', address: 'Blvd. Sur 444', status: 'pending' },
    { id: '5', saleNumber: 'SALE-005', customerName: 'Elena Ruiz', address: 'Av. Norte 555', status: 'pending' },
  ],
  pendingToSchedule: 5,
  lowStockItems: [
    { id: '1', name: 'Lámpara LED 60W', sku: 'LED-60W-001', currentStock: 3, minimumStock: 10 },
    { id: '2', name: 'Cable HDMI 2m', sku: 'HDMI-2M-002', currentStock: 5, minimumStock: 15 },
    { id: '3', name: 'Tornillo 5mm', sku: 'TOR-5MM-003', currentStock: 2, minimumStock: 50 },
    { id: '4', name: 'Interruptor Doble', sku: 'INT-DOB-004', currentStock: 8, minimumStock: 20 },
    { id: '5', name: 'Caja 10x10', sku: 'CAJ-10X10-005', currentStock: 1, minimumStock: 25 },
  ],
  pendingApprovals: [
    { id: '1', type: 'Descuento 25%', requestedBy: 'Pedro Gómez', requestedAt: '2024-01-15T10:00:00Z' },
    { id: '2', type: 'Precio Especial', requestedBy: 'María López', requestedAt: '2024-01-15T11:30:00Z' },
    { id: '3', type: 'Crédito 60 días', requestedBy: 'Juan Hernández', requestedAt: '2024-01-15T14:00:00Z' },
  ],
  delayedOrders: [
    { id: '1', type: 'installation', saleNumber: 'SALE-101', customerName: 'Cliente A', scheduledDate: '2024-01-10', delayDays: 5 },
    { id: '2', type: 'delivery', saleNumber: 'SALE-102', customerName: 'Cliente B', scheduledDate: '2024-01-12', delayDays: 3 },
    { id: '3', type: 'installation', saleNumber: 'SALE-103', customerName: 'Cliente C', scheduledDate: '2024-01-14', delayDays: 1 },
  ],
  topSellers: [
    { id: '1', name: 'Carlos Mendoza', sales: 45000, orders: 12 },
    { id: '2', name: 'Ana López', sales: 38000, orders: 10 },
    { id: '3', name: 'Pedro Sánchez', sales: 28000, orders: 8 },
  ],
  topProducts: [
    { id: '1', name: 'Lámpara LED Regulable', sku: 'LED-REG-001', quantity: 25, revenue: 37500 },
    { id: '2', name: 'Sistema de Rieles', sku: 'SYS-REL-002', quantity: 15, revenue: 30000 },
    { id: '3', name: 'Foco Empotrado', sku: 'FOC-EMP-003', quantity: 40, revenue: 20000 },
  ],
  activeCustomers: [
    { id: '1', name: 'Constructora ABC', lastOrderDate: '2024-01-15', totalOrders: 45 },
    { id: '2', name: 'Inmobiliaria XYZ', lastOrderDate: '2024-01-14', totalOrders: 32 },
    { id: '3', name: 'Arquitectos 2000', lastOrderDate: '2024-01-13', totalOrders: 28 },
  ],
  recentActivity: [
    { id: '1', type: 'sale', message: 'Venta registrada por $12,500', timestamp: '2024-01-15T14:30:00Z', color: 'green' },
    { id: '2', type: 'installation', message: 'Instalación iniciada - Juan Pérez', timestamp: '2024-01-15T13:00:00Z', color: 'blue' },
    { id: '3', type: 'delivery', message: 'Entrega realizada - Laura Díaz', timestamp: '2024-01-15T12:15:00Z', color: 'purple' },
    { id: '4', type: 'approval', message: 'Nueva aprobación requerida', timestamp: '2024-01-15T11:00:00Z', color: 'yellow' },
    { id: '5', type: 'stock', message: 'Stock bajo en Lámpara LED', timestamp: '2024-01-15T10:00:00Z', color: 'red' },
  ],
}
