import { Product, Customer, Sale } from '@/types/database'

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
  serviceType?: 'delivery' | 'installation'
}

// Service Types
export interface ServiceOption {
  id: string
  type: 'delivery' | 'installation'
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
  deliveryNotes?: string
  
  // Installation
  installationAddress?: string
  installationCity?: string
  installationContactName?: string
  installationContactPhone?: string
  installationDate?: string
  installationTime?: string
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
]
