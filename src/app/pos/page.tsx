'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useProductStore } from '@/stores/product-store'
import { useSalesStore } from '@/stores/sales-store'
import { PosToolbar } from '@/features/pos/components/PosToolbar'
import { ProductGrid } from '@/features/pos/components/ProductGrid'
import { CartPanel } from '@/features/pos/components/CartPanel'
import { CheckoutDrawer } from '@/features/pos/components/CheckoutDrawer'
import { RecommendedProducts } from '@/features/pos/components/RecommendedProducts'
import { usePosShortcuts } from '@/features/pos/hooks/usePosShortcuts'
import { CartItem, LogisticsDetails, PaymentMethod, SaleResponse, SaleStatus, DeliveryStatus, InstallationStatus, FabricationDetails } from '@/features/pos/lib/types'
import { createCartItem, createServiceItem, createFabricationItem, calculateTotals, validateCheckout, hasFabricationItems } from '@/features/pos/lib/cartLogic'
import { createOpsOrdersFromCheckout, saveOpsOrders } from '@/features/ops/lib/store'
// TODO: Re-enable when Supabase env vars are properly configured
// import { resolveSaleUUIDs } from '@/lib/pos-uuids'
import { Product } from '@/types/database'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, Package, Wrench } from 'lucide-react'

// LocalStorage key for draft persistence
const DRAFT_KEY = 'pos_draft'

interface DraftData {
  cart: CartItem[]
  logistics: LogisticsDetails
  deliveryEnabled: boolean
  installationEnabled: boolean
  warrantyEnabled: boolean
  timestamp: number
}

export default function POSPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [activeTab, setActiveTab] = useState('productos')
  
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([])
  
  const [deliveryEnabled, setDeliveryEnabled] = useState(false)
  const [installationEnabled, setInstallationEnabled] = useState(false)
  const [warrantyEnabled, setWarrantyEnabled] = useState(false)
  const [logistics, setLogistics] = useState<LogisticsDetails>({})
  
  // Operation statuses
  const [saleStatus, setSaleStatus] = useState<SaleStatus>('draft')
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>('pending')
  const [installationStatus, setInstallationStatus] = useState<InstallationStatus>('scheduled')
  
  // Validation errors
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  
  // Checkout state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('EFECTIVO')
  const [paymentReference, setPaymentReference] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastSale, setLastSale] = useState<SaleResponse | null>(null)
  
  // Store last sale data for ticket printing
  const [lastSaleItems, setLastSaleItems] = useState<CartItem[]>([])
  const [lastSaleTotals, setLastSaleTotals] = useState<{ subtotal: number; productsTax: number; servicesTax: number; servicesTotal: number; total: number }>({
    subtotal: 0,
    productsTax: 0,
    servicesTax: 0,
    servicesTotal: 0,
    total: 0,
  })

  const { products, fetchProducts } = useProductStore()
  const { addSale } = useSalesStore()
  
  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY)
      if (saved) {
        const draft: DraftData = JSON.parse(saved)
        if (Date.now() - draft.timestamp < 24 * 60 * 60 * 1000) {
          setCart(draft.cart)
          setLogistics(draft.logistics)
          setDeliveryEnabled(draft.deliveryEnabled)
          setInstallationEnabled(draft.installationEnabled)
          setWarrantyEnabled(draft.warrantyEnabled)
        }
      }
    } catch (e) {
      console.error('Error loading draft:', e)
    }
  }, [])

  // Save draft to localStorage
  useEffect(() => {
    if (cart.length > 0 || Object.keys(logistics).length > 0) {
      const draft: DraftData = {
        cart,
        logistics,
        deliveryEnabled,
        installationEnabled,
        warrantyEnabled,
        timestamp: Date.now(),
      }
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    }
  }, [cart, logistics, deliveryEnabled, installationEnabled, warrantyEnabled])
  
  // Fetch products from Supabase on mount
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Calculate reserved stock for each product based on cart
  const getReservedStock = useCallback((productId: string): number => {
    return cart
      .filter(item => item.productId === productId && !item.isService)
      .reduce((total, item) => total + item.quantity, 0)
  }, [cart])

  // Get available stock for a product
  const getAvailableStock = useCallback((product: Product): number => {
    const stock = product.stock ?? 0
    const reserved = getReservedStock(product.id)
    return Math.max(0, stock - reserved)
  }, [getReservedStock])

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.barcode && p.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || p.category_id === selectedCategory
    const isActive = p.is_active !== false
    return matchesSearch && matchesCategory && isActive
  })

  // Handle adding product to cart (supports fabrication mode)
  const handleAddToCart = useCallback((product: Product, isFabrication = false) => {
    const availableStock = getAvailableStock(product)
    const currentStock = product.stock ?? 0
    
    // If product has stock and not fabrication mode, check availability
    if (currentStock > 0 && availableStock <= 0 && !isFabrication) {
      return
    }
    
    setCart(prev => {
      // If fabrication mode or no stock, add as fabrication item
      if (isFabrication || currentStock <= 0) {
        const fabricationDetails: FabricationDetails = {
          isFabrication: true,
          promisedDate: '',
          advancePayment: 0,
          advanceRequired: true,
        }
        return [...prev, createFabricationItem(product, 1, fabricationDetails)]
      }
      
      const existingItem = prev.find(item => item.productId === product.id && !item.isService && !item.fabricationDetails?.isFabrication)
      
      if (existingItem) {
        if (currentStock > 0) {
          const newQuantity = existingItem.quantity + 1
          if (newQuantity > currentStock) {
            return prev
          }
        }
        
        return prev.map(item =>
          item.productId === product.id
            ? { 
                ...item, 
                quantity: item.quantity + 1, 
                subtotal: item.unitPrice * (item.quantity + 1), 
                tax: item.unitPrice * (item.quantity + 1) * 0.16, 
                total: item.unitPrice * (item.quantity + 1) * 1.16 
              }
            : item
        )
      }
      
      return [...prev, createCartItem(product)]
    })
  }, [getAvailableStock])

  // Handle fabrication details update
  const handleUpdateFabricationDetails = useCallback((itemId: string, details: FabricationDetails) => {
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, fabricationDetails: details }
      }
      return item
    }))
  }, [])

  // Handle barcode scan
  const handleBarcodeSubmit = useCallback((barcode: string) => {
    const product = products.find(p => p.barcode === barcode || p.sku === barcode)
    if (product) handleAddToCart(product)
  }, [products, handleAddToCart])

  // Handle delivery toggle
  const handleDeliveryToggle = useCallback((enabled: boolean) => {
    setDeliveryEnabled(enabled)
    setDeliveryStatus(enabled ? 'pending' : 'pending')
    setCart(prev => {
      if (enabled && !prev.some(i => i.isService && i.serviceType === 'delivery')) {
        return [...prev, createServiceItem('delivery')]
      }
      if (!enabled) return prev.filter(i => !(i.isService && i.serviceType === 'delivery'))
      return prev
    })
  }, [])

  // Handle installation toggle
  const handleInstallationToggle = useCallback((enabled: boolean) => {
    setInstallationEnabled(enabled)
    setInstallationStatus(enabled ? 'scheduled' : 'scheduled')
    setCart(prev => {
      if (enabled && !prev.some(i => i.isService && i.serviceType === 'installation')) {
        return [...prev, createServiceItem('installation')]
      }
      if (!enabled) return prev.filter(i => !(i.isService && i.serviceType === 'installation'))
      return prev
    })
  }, [])

  // Handle warranty toggle
  const handleWarrantyToggle = useCallback((enabled: boolean) => {
    setWarrantyEnabled(enabled)
    setCart(prev => {
      if (enabled && !prev.some(i => i.isService && i.serviceType === 'warranty')) {
        return [...prev, createServiceItem('warranty')]
      }
      if (!enabled) return prev.filter(i => !(i.isService && i.serviceType === 'warranty'))
      return prev
    })
  }, [])

  // Handle quantity update
  const handleUpdateQuantity = useCallback((itemId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.id === itemId && !item.isService) {
            if (item.fabricationDetails?.isFabrication) {
              return item
            }
            
            const newQuantity = item.quantity + delta
            if (newQuantity <= 0) return null
            
            const product = products.find(p => p.id === item.productId)
            if (product && product.stock !== null && product.stock !== undefined) {
              if (newQuantity > product.stock) {
                return item
              }
            }
            
            const subtotal = item.unitPrice * newQuantity
            const tax = subtotal * 0.16
            return { ...item, quantity: newQuantity, subtotal, tax, total: subtotal + tax }
          }
          return item
        })
        .filter(Boolean) as CartItem[]
    })
  }, [products])

  // Handle remove item
  const handleRemoveItem = useCallback((itemId: string) => {
    setCart(prev => {
      const item = prev.find(i => i.id === itemId)
      if (item?.isService) {
        if (item.serviceType === 'delivery') {
          setDeliveryEnabled(false)
          setDeliveryStatus('pending')
        }
        if (item.serviceType === 'installation') {
          setInstallationEnabled(false)
          setInstallationStatus('scheduled')
        }
        if (item.serviceType === 'warranty') setWarrantyEnabled(false)
      }
      return prev.filter(i => i.id !== itemId)
    })
  }, [])

  // Handle checkout with validation
  const handleCheckout = useCallback(() => {
    const validation = validateCheckout(cart, logistics)
    setValidationErrors(validation.errors)
    
    if (!validation.valid) {
      return
    }
    
    setIsCheckoutOpen(true)
  }, [cart, logistics])

  // Confirm checkout
  const handleConfirmCheckout = useCallback(async (amountReceived?: string): Promise<SaleResponse> => {
    console.log('CHECKOUT_START')
    setIsProcessing(true)
    
    try {
      const totals = calculateTotals(cart)
      
      // Get real UUIDs for the sale
      const { branchId, customerId, salesRepId } = { branchId: null, customerId: null, salesRepId: null }
      
      const payload = {
        branchId,
        customerId,
        salesRepId,
        items: cart,
        subtotal: totals.subtotal,
        discount: totals.discount,
        tax: totals.productsTax + totals.servicesTax,
        servicesTotal: totals.servicesTotal,
        total: totals.total,
        paymentMethod,
        paymentReference,
        amountReceived: amountReceived || '0',
        logistics,
      }
      console.log('CHECKOUT_POSTING', { 
        itemCount: cart.length, 
        total: totals.total, 
        paymentMethod,
        amountReceived 
      })
      
      const response = await fetch('/api/pos/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      
      const result = await response.json()
      console.log('CHECKOUT_RESPONSE', { status: response.status, success: result.success, folio: result.folio })
      
      if (result.success) {
        const saleNumber = result.folio
        const saleId = result.sale?.id || saleNumber
        
        setSaleStatus('paid')
        
        addSale({
          id: result.sale?.id || Date.now().toString(),
          sale_number: saleNumber,
          customer_id: undefined,
          sales_rep_id: undefined,
          branch_id: undefined,
          status: 'completed',
          payment_status: 'paid',
          subtotal: totals.subtotal,
          tax_amount: totals.productsTax + totals.servicesTax,
          discount_amount: totals.discount,
          total: totals.total,
          payment_method: paymentMethod,
          amount_paid: totals.total,
          change_given: 0,
          sale_date: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        
        // Generate Ops Orders from checkout (non-blocking)
        const opsOrders = createOpsOrdersFromCheckout(
          cart,
          logistics,
          saleId,
          saleNumber
        )
        
        // Save ops orders (with localStorage fallback - never fails)
        let shippingOrderId: string | undefined
        let installationOrderId: string | undefined
        
        if (opsOrders.length > 0) {
          try {
            const saveResult = await saveOpsOrders(opsOrders)
            if (saveResult.success && saveResult.ids) {
              const deliveryOrder = opsOrders.find(o => o.type === 'delivery')
              const installationOrder = opsOrders.find(o => o.type === 'installation')
              shippingOrderId = deliveryOrder?.id
              installationOrderId = installationOrder?.id
              console.log('Ops orders saved:', opsOrders.length, saveResult.ids)
            }
          } catch (opsError) {
            console.log('Ops orders save failed (non-blocking):', opsError)
          }
        }
        
        setLastSaleItems([...cart])
        setLastSaleTotals({ ...totals })
        
        setLastSale({
          success: true,
          folio: saleNumber,
          ticketUrl: result.ticketUrl,
          shippingOrderId,
          installationOrderId,
        })
        
        setCart([])
        setDeliveryEnabled(false)
        setInstallationEnabled(false)
        setWarrantyEnabled(false)
        setLogistics({})
        setPaymentReference('')
        setSaleStatus('draft')
        setDeliveryStatus('pending')
        setInstallationStatus('scheduled')
        
        localStorage.removeItem(DRAFT_KEY)
        
        await fetchProducts()
        
        return { success: true, folio: saleNumber }
      }
      
      return { success: false, folio: '', error: result.error || 'Error al procesar venta' }
    } catch (error) {
      console.error('CHECKOUT_ERROR', error)
      return { success: false, folio: '', error: 'Error de conexión' }
    } finally {
      console.log('CHECKOUT_END')
      setIsProcessing(false)
    }
  }, [cart, paymentMethod, paymentReference, logistics, addSale, fetchProducts])

  // Reset for new sale
  const handleNewSale = useCallback(() => {
    setLastSale(null)
    setSaleStatus('draft')
    setDeliveryStatus('pending')
    setInstallationStatus('scheduled')
  }, [])

  // Keyboard shortcuts - Ctrl+K already handled by usePosShortcuts
  const handleSearchFocus = useCallback(() => {
    const searchInput = document.querySelector('input[placeholder*="Buscar"]') as HTMLInputElement
    searchInput?.focus()
  }, [])

  const handleEscape = useCallback(() => {
    if (isCheckoutOpen) setIsCheckoutOpen(false)
  }, [isCheckoutOpen])

  usePosShortcuts({
    onSearchFocus: handleSearchFocus,
    onCheckout: () => cart.length > 0 && handleCheckout(),
    onEscape: handleEscape,
  })

  // Get unique categories
  const categories = Array.from(new Set(products.map(p => p.category_id).filter(Boolean) as string[]))

  // Check if there are fabrication items in cart
  const hasFabrication = hasFabricationItems(cart)

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Validation Errors Banner */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <div className="flex flex-wrap gap-2">
            {validationErrors.map((error, idx) => (
              <span key={idx} className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                {error}
              </span>
            ))}
          </div>
          <button 
            onClick={() => setValidationErrors([])}
            className="ml-auto text-xs text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}
      
      <div className="flex flex-1 overflow-hidden">
        {/* Products Panel */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList className="bg-slate-100">
              <TabsTrigger value="productos" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Productos
              </TabsTrigger>
              <TabsTrigger value="servicios" className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Servicios
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="productos" className="m-0">
              <PosToolbar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                onBarcodeSubmit={handleBarcodeSubmit}
              />
              
              <div className="flex-1 overflow-y-auto mt-4">
                <ProductGrid 
                  products={filteredProducts} 
                  onAddToCart={handleAddToCart}
                  getAvailableStock={getAvailableStock}
                />
                
                <RecommendedProducts 
                  onAddToCart={handleAddToCart}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="servicios" className="m-0">
              <div className="flex flex-col items-center justify-center h-[400px] text-slate-500">
                <Wrench className="h-16 w-16 mb-4 opacity-30" />
                <p className="text-lg font-medium">Servicios adicionales</p>
                <p className="text-sm mt-1">
                  Activa los servicios desde el carrito para agregar entrega, instalación o garantía.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Cart Panel */}
        <div className="w-[420px] p-4 pl-0 sticky top-0 h-full overflow-y-auto">
          <CartPanel
            items={cart}
            logistics={logistics}
            onLogisticsChange={setLogistics}
            deliveryEnabled={deliveryEnabled}
            installationEnabled={installationEnabled}
            warrantyEnabled={warrantyEnabled}
            onDeliveryToggle={handleDeliveryToggle}
            onInstallationToggle={handleInstallationToggle}
            onWarrantyToggle={handleWarrantyToggle}
            onUpdateQuantity={handleUpdateQuantity}
            onUpdateFabricationDetails={handleUpdateFabricationDetails}
            onRemoveItem={handleRemoveItem}
            onCheckout={handleCheckout}
            isCheckingOut={isProcessing}
          />
        </div>
      </div>

      {/* Checkout Drawer */}
      <CheckoutDrawer
        isOpen={isCheckoutOpen}
        onClose={() => { setIsCheckoutOpen(false); handleNewSale(); }}
        items={cart}
        lastSaleItems={lastSaleItems}
        lastSaleTotals={lastSaleTotals}
        logistics={logistics}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        paymentReference={paymentReference}
        onPaymentReferenceChange={setPaymentReference}
        onConfirm={handleConfirmCheckout}
        isProcessing={isProcessing}
        lastSale={lastSale}
      />
    </div>
  )
}
