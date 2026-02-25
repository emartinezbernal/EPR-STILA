import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { 
  OpsOrder, 
  OpsOrdersStore, 
  OPS_ORDERS_STORAGE_KEY,
  generateOrderId,
  OpsOrderType,
  OpsOrderStatus,
  TimeWindow,
  WallType
} from './types'
import { CartItem, LogisticsDetails } from '@/features/pos/lib/types'

interface CreateOpsOrderParams {
  type: OpsOrderType
  saleId: string
  saleFolio?: string
  scheduledDate?: string
  timeWindow?: TimeWindow
  address?: string
  references?: string
  contactName?: string
  contactPhone?: string
  wallType?: WallType
  notes?: string
  promisedDate?: string
  advancePayment?: number
  createdBy?: string
}

export const useOpsOrdersStore = create<OpsOrdersStore>()(
  persist(
    (set, get) => ({
      orders: [],

      addOrder: (order: OpsOrder) => {
        set((state) => ({
          orders: [...state.orders, order]
        }))
      },

      addOrders: (orders: OpsOrder[]) => {
        set((state) => ({
          orders: [...state.orders, ...orders]
        }))
      },

      getOrdersBySaleId: (saleId: string) => {
        return get().orders.filter(order => order.saleId === saleId)
      },

      getOrdersByType: (type: OpsOrderType) => {
        return get().orders.filter(order => order.type === type)
      },

      updateOrderStatus: (orderId: string, status: OpsOrderStatus) => {
        set((state) => ({
          orders: state.orders.map(order => 
            order.id === orderId 
              ? { ...order, status, updatedAt: new Date().toISOString() }
              : order
          )
        }))
      },

      clearOrders: () => {
        set({ orders: [] })
      },
    }),
    {
      name: OPS_ORDERS_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// Function to create ops orders from checkout
export function createOpsOrdersFromCheckout(
  cart: CartItem[],
  logistics: LogisticsDetails,
  saleId: string,
  saleFolio: string,
  createdBy?: string
): OpsOrder[] {
  const orders: OpsOrder[] = []
  const now = new Date().toISOString()

  // Check for delivery service
  const hasDelivery = cart.some(item => item.isService && item.serviceType === 'delivery')
  if (hasDelivery && logistics.deliveryAddress) {
    orders.push({
      id: generateOrderId(),
      type: 'delivery',
      status: 'pending',
      saleId,
      saleFolio,
      scheduledDate: logistics.deliveryDate,
      timeWindow: logistics.deliveryTime as TimeWindow | undefined,
      address: logistics.deliveryAddress,
      references: logistics.deliveryNotes,
      createdAt: now,
      createdBy,
    })
  }

  // Check for installation service
  const hasInstallation = cart.some(item => item.isService && item.serviceType === 'installation')
  if (hasInstallation && logistics.installationAddress) {
    orders.push({
      id: generateOrderId(),
      type: 'installation',
      status: 'scheduled',
      saleId,
      saleFolio,
      scheduledDate: logistics.installationDate,
      timeWindow: logistics.installationTime as TimeWindow | undefined,
      address: logistics.installationAddress,
      contactName: logistics.installationContactName,
      contactPhone: logistics.installationContactPhone,
      notes: logistics.installationNotes,
      createdAt: now,
      createdBy,
    })
  }

  // Check for fabrication items
  const fabricationItems = cart.filter(item => 
    !item.isService && item.fabricationDetails?.isFabrication
  )
  
  if (fabricationItems.length > 0) {
    // Create one fabrication order per sale (or could be per item)
    const firstFabrication = fabricationItems[0]
    orders.push({
      id: generateOrderId(),
      type: 'fabrication',
      status: 'pending',
      saleId,
      saleFolio,
      promisedDate: firstFabrication.fabricationDetails?.promisedDate,
      advancePayment: firstFabrication.fabricationDetails?.advancePayment,
      notes: `${fabricationItems.length} items: ${fabricationItems.map(i => i.name).join(', ')}`,
      createdAt: now,
      createdBy,
    })
  }

  return orders
}

// Function to save orders (tries Supabase API, falls back to localStorage - NO ERROR if API fails)
export async function saveOpsOrders(orders: OpsOrder[]): Promise<{ success: boolean; ids?: string[]; error?: string }> {
  const store = useOpsOrdersStore.getState()
  
  // Try to save to Supabase API
  try {
    const response = await fetch('/api/ops/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orders }),
    })
    
    // If 404, endpoint doesn't exist - silently fallback to localStorage
    if (response.status === 404) {
      console.log('API /api/ops/orders not found, using localStorage fallback')
    } else if (response.ok) {
      const result = await response.json()
      if (result.success) {
        return { success: true, ids: orders.map(o => o.id) }
      }
    }
  } catch (error) {
    console.log('API not available, using localStorage fallback')
  }
  
  // Fallback: save to localStorage store (always succeeds)
  store.addOrders(orders)
  
  // Always return success with order IDs
  return { success: true, ids: orders.map(o => o.id) }
}

// Get all orders
export function getAllOpsOrders(): OpsOrder[] {
  return useOpsOrdersStore.getState().orders
}

// Get orders by sale
export function getOpsOrdersBySale(saleId: string): OpsOrder[] {
  return useOpsOrdersStore.getState().getOrdersBySaleId(saleId)
}
