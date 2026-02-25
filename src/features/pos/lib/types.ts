import { Product, Customer, Sale } from '@/types/database'

// Operation Status Types
export type SaleStatus = 'draft' | 'paid' | 'invoiced'
export type DeliveryStatus = 'pending' | 'en_ruta' | 'delivered'
export type InstallationStatus = 'scheduled' | 'in_progress' | 'completed' | 'issue'

// Wall Types for Installation
export type WallType = 'concreto' | 'madera' | 'tablaroca' | 'ladrillo' | 'otro'

// Time Windows for Delivery/Installation
export const TIME_WINDOWS = [
  { id: 'manana', label: 'Mañana (9am - 12pm)', start: '09:00', end: '12:00' },
  { id: 'tarde', label: 'Tarde (12pm - 6pm)', start: '12:00', end: '18:00' },
  { id: 'noche', label: 'Noche (6pm - 9pm)', start: '18:00', end: '21:00' },
] as const

// Wall Types Array
export const WALL_TYPES: { id: WallType; label: string }[] = [
  { id: 'concreto', label: 'Concreto / Cemento' },
  { id: 'madera', label: 'Madera' },
  { id: 'tablaroca', label: 'Tablaroca / Yeso' },
  { id: 'ladrillo', label: 'Ladrillo' },
  { id: 'otro', label: 'Otro' },
]

// Manufacturing/Pre-order Details (UI only)
export interface FabricationDetails {
  isFabrication: boolean
  promisedDate?: string
  advancePayment?: number
  advanceRequired: boolean
}

// Cart Item Types
export interface CartItem {
  id: string
  productId: string
  product?: Product
  name: string
  sku: string
  barcode?: string
  quantity: number
  unitPrice: number
  discount: number
  subtotal: number
  tax: number
  total: number
  isService?: boolean
  serviceType?: 'delivery' | 'installation' | 'warranty'
  // Manufacturing/Pre-order fields (UI only)
  fabricationDetails?: FabricationDetails
}

// Service Types
export interface ServiceOption {
  id: string
  type: 'delivery' | 'installation' | 'warranty'
  name: string
  description: string
  price: number
  taxable: boolean
  enabled: boolean
}

// Delivery/Installation Details
export interface LogisticsDetails {
  // Delivery
  deliveryAddress?: string
  deliveryCity?: string
  deliveryDate?: string
  deliveryTime?: string
  deliveryTimeWindow?: string // 'manana' | 'tarde' | 'noche'
  deliveryReferences?: string // References for delivery location
  deliveryNotes?: string
  
  // Installation
  installationAddress?: string
  installationCity?: string
  installationContactName?: string
  installationContactPhone?: string
  installationDate?: string
  installationTime?: string
  installationTimeWindow?: string // 'manana' | 'tarde' | 'noche'
  installationWallType?: WallType // Wall type for installation
  installationNotes?: string
}

// Checkout Data
export interface CheckoutData {
  customerId?: string
  customerName?: string
  items: CartItem[]
  subtotal: number
  discount: number
  tax: number
  servicesTotal: number
  total: number
  paymentMethod: PaymentMethod
  paymentReference?: string
  logistics: LogisticsDetails
}

export type PaymentMethod = 'EFECTIVO' | 'TARJETA_CREDITO' | 'TARJETA_DEBITO' | 'TRANSFERENCIA' | 'QR'

// Sale Response
export interface SaleResponse {
  success: boolean
  sale?: Sale
  folio: string
  ticketUrl?: string
  shippingOrderId?: string
  installationOrderId?: string
  error?: string
}

// Service Prices (configure these)
export const SERVICE_PRICES = {
  DELIVERY: 350, // $350 MXN
  INSTALLATION: 500, // $500 MXN
  EXTENDED_WARRANTY: 299, // $299 MXN - 1 año extra de garantía
} as const

export const DEFAULT_SERVICES: ServiceOption[] = [
  {
    id: 'delivery',
    type: 'delivery',
    name: 'Entrega a domicilio',
    description: 'Entrega en la dirección especificada',
    price: SERVICE_PRICES.DELIVERY,
    taxable: false,
    enabled: false,
  },
  {
    id: 'installation',
    type: 'installation',
    name: 'Instalación profesional',
    description: 'Instalación por técnicos certificados',
    price: SERVICE_PRICES.INSTALLATION,
    taxable: true,
    enabled: false,
  },
  {
    id: 'extended_warranty',
    type: 'warranty',
    name: 'Garantía extendida',
    description: '1 año adicional de garantía',
    price: SERVICE_PRICES.EXTENDED_WARRANTY,
    taxable: true,
    enabled: false,
  },
]

// Extended Warranty type
export type ServiceType = 'delivery' | 'installation' | 'warranty'

// Customer Quick Entry
export interface CustomerQuickEntry {
  name: string
  phone: string
  notes?: string
}

// Recommended Product
export interface RecommendedProduct {
  id: string
  name: string
  sku: string
  price: number
  category: string
}
