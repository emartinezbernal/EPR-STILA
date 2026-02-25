import { CartItem, LogisticsDetails, DEFAULT_SERVICES, SERVICE_PRICES, FabricationDetails } from './types'

const TAX_RATE = 0.16 // 16% VAT

export function createCartItem(
  product: { id: string; name: string; sku: string; barcode?: string; base_price: number; stock?: number },
  quantity: number = 1
): CartItem {
  const subtotal = product.base_price * quantity
  const tax = subtotal * TAX_RATE
  
  return {
    id: crypto.randomUUID(),
    productId: product.id,
    product: product as any,
    name: product.name,
    sku: product.sku,
    barcode: product.barcode,
    quantity,
    unitPrice: product.base_price,
    discount: 0,
    subtotal,
    tax,
    total: subtotal + tax,
    isService: false,
  }
}

export function createServiceItem(
  serviceType: 'delivery' | 'installation' | 'warranty'
): CartItem {
  const price = serviceType === 'delivery' 
    ? SERVICE_PRICES.DELIVERY 
    : serviceType === 'installation' 
      ? SERVICE_PRICES.INSTALLATION 
      : SERVICE_PRICES.EXTENDED_WARRANTY
  const taxable = serviceType !== 'delivery'
  
  const subtotal = price
  const tax = taxable ? subtotal * TAX_RATE : 0
  
  const serviceNames = {
    delivery: 'Entrega a domicilio',
    installation: 'Instalación profesional',
    warranty: 'Garantía extendida 1 año',
  }
  
  const serviceSkus = {
    delivery: 'SERVICE_DELIVERY',
    installation: 'SERVICE_INSTALLATION',
    warranty: 'SERVICE_WARRANTY',
  }
  
  return {
    id: crypto.randomUUID(),
    productId: `service-${serviceType}`,
    name: serviceNames[serviceType],
    sku: serviceSkus[serviceType],
    quantity: 1,
    unitPrice: price,
    discount: 0,
    subtotal,
    tax,
    total: subtotal + tax,
    isService: true,
    serviceType,
  }
}

// Create a fabrication/pre-order item (for products with no stock)
export function createFabricationItem(
  product: { id: string; name: string; sku: string; barcode?: string; base_price: number; stock?: number },
  quantity: number,
  fabricationDetails: FabricationDetails
): CartItem {
  const subtotal = product.base_price * quantity
  const tax = subtotal * TAX_RATE
  
  return {
    id: crypto.randomUUID(),
    productId: product.id,
    product: product as any,
    name: product.name,
    sku: product.sku,
    barcode: product.barcode,
    quantity,
    unitPrice: product.base_price,
    discount: 0,
    subtotal,
    tax,
    total: subtotal + tax,
    isService: false,
    fabricationDetails,
  }
}

export function calculateTotals(items: CartItem[]) {
  const productItems = items.filter(item => !item.isService)
  const serviceItems = items.filter(item => item.isService)
  
  const subtotal = productItems.reduce((sum, item) => sum + item.subtotal, 0)
  const productsTax = productItems.reduce((sum, item) => sum + item.tax, 0)
  const servicesTax = serviceItems.reduce((sum, item) => sum + item.tax, 0)
  const servicesTotal = serviceItems.reduce((sum, item) => sum + item.total, 0)
  
  const discount = 0 // Can be extended with discount logic
  
  const total = subtotal + productsTax + servicesTotal
  
  return {
    subtotal,
    productsTax,
    servicesTax,
    servicesTotal,
    discount,
    total,
  }
}

export function getServiceItems(items: CartItem[]) {
  return items.filter(item => item.isService)
}

export function hasDeliveryService(items: CartItem[]) {
  return items.some(item => item.isService && item.serviceType === 'delivery')
}

export function hasInstallationService(items: CartItem[]) {
  return items.some(item => item.isService && item.serviceType === 'installation')
}

export function updateItemQuantity(items: CartItem[], itemId: string, delta: number): CartItem[] {
  return items
    .map(item => {
      if (item.id === itemId && !item.isService) {
        const newQuantity = item.quantity + delta
        if (newQuantity <= 0) return null
        const subtotal = item.unitPrice * newQuantity
        const tax = subtotal * TAX_RATE
        return {
          ...item,
          quantity: newQuantity,
          subtotal,
          tax,
          total: subtotal + tax,
        }
      }
      return item
    })
    .filter(Boolean) as CartItem[]
}

export function validateCheckout(items: CartItem[], logistics: LogisticsDetails): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Empty cart
  if (items.length === 0) {
    errors.push('El carrito está vacío')
  }
  
  // Check stock for each item (only for non-fabrication items)
  items.forEach(item => {
    if (!item.isService && item.product && !item.fabricationDetails?.isFabrication) {
      const availableStock = item.product.stock || 0
      if (item.quantity > availableStock) {
        errors.push(`Stock insuficiente para ${item.name}`)
      }
    }
    
    // Validate fabrication items
    if (item.fabricationDetails?.isFabrication) {
      if (!item.fabricationDetails.promisedDate) {
        errors.push(`Fecha promesa requerida para ${item.name}`)
      }
      if (item.fabricationDetails.advanceRequired && !item.fabricationDetails.advancePayment) {
        errors.push(`Anticipo requerido para ${item.name}`)
      }
    }
  })
  
  // Validate delivery logistics
  if (hasDeliveryService(items)) {
    if (!logistics.deliveryAddress?.trim()) {
      errors.push('La dirección de entrega es requerida')
    }
    if (!logistics.deliveryDate) {
      errors.push('La fecha de entrega es requerida')
    }
  }
  
  // Validate installation logistics
  if (hasInstallationService(items)) {
    if (!logistics.installationAddress?.trim()) {
      errors.push('La dirección de instalación es requerida')
    }
    if (!logistics.installationContactName?.trim()) {
      errors.push('El nombre de contacto es requerido')
    }
    if (!logistics.installationContactPhone?.trim()) {
      errors.push('El teléfono de contacto es requerido')
    }
    if (!logistics.installationDate) {
      errors.push('La fecha de instalación es requerida')
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}

// Check if any item in cart is a fabrication/pre-order item
export function hasFabricationItems(items: CartItem[]): boolean {
  return items.some(item => item.fabricationDetails?.isFabrication === true)
}

// Get all fabrication items from cart
export function getFabricationItems(items: CartItem[]): CartItem[] {
  return items.filter(item => item.fabricationDetails?.isFabrication === true)
}
