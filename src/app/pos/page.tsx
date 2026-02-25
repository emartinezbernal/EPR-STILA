'use client'

import { useState, useCallback, useEffect } from 'react'
import { useProductStore } from '@/stores/product-store'
import { useSalesStore } from '@/stores/sales-store'
import { PosToolbar } from '@/features/pos/components/PosToolbar'
import { ProductGrid } from '@/features/pos/components/ProductGrid'
import { CartPanel } from '@/features/pos/components/CartPanel'
import { CheckoutDrawer } from '@/features/pos/components/CheckoutDrawer'
import { RecommendedProducts } from '@/features/pos/components/RecommendedProducts'
import { usePosShortcuts } from '@/features/pos/hooks/usePosShortcuts'
import { CartItem, LogisticsDetails, PaymentMethod, SaleResponse } from '@/features/pos/lib/types'
import { createCartItem, createServiceItem, calculateTotals } from '@/features/pos/lib/cartLogic'
import { Product } from '@/types/database'

export default function POSPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([])
  
  const [deliveryEnabled, setDeliveryEnabled] = useState(false)
  const [installationEnabled, setInstallationEnabled] = useState(false)
  const [warrantyEnabled, setWarrantyEnabled] = useState(false)
  const [logistics, setLogistics] = useState<LogisticsDetails>({})
  
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

  // Get available stock for a product (total - reserved in cart)
  const getAvailableStock = useCallback((product: Product): number => {
    const stock = product.stock ?? 0
    const reserved = getReservedStock(product.id)
    return Math.max(0, stock - reserved)
  }, [getReservedStock])

  // Filter products - show all active products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.barcode && p.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || p.category_id === selectedCategory
    const isActive = p.is_active !== false
    return matchesSearch && matchesCategory && isActive
  })

  // Handle adding product to cart
  const handleAddToCart = useCallback((product: Product) => {
    const availableStock = getAvailableStock(product)
    const currentStock = product.stock ?? 0
    
    // If product has stock tracking, check availability
    if (currentStock > 0 && availableStock <= 0) {
      return // Cannot add more, no available stock
    }
    
    setCart(prev => {
      const existingItem = prev.find(item => item.productId === product.id)
      
      if (existingItem) {
        // Check if we can add more
        if (currentStock > 0) {
          const newQuantity = existingItem.quantity + 1
          if (newQuantity > currentStock) {
            return prev // Cannot exceed stock
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

  // Handle barcode scan
  const handleBarcodeSubmit = useCallback((barcode: string) => {
    const product = products.find(p => p.barcode === barcode || p.sku === barcode)
    if (product) handleAddToCart(product)
  }, [products, handleAddToCart])

  // Handle delivery toggle
  const handleDeliveryToggle = useCallback((enabled: boolean) => {
    setDeliveryEnabled(enabled)
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
            const newQuantity = item.quantity + delta
            if (newQuantity <= 0) return null
            
            // Check stock limit
            const product = products.find(p => p.id === item.productId)
            if (product && product.stock !== null && product.stock !== undefined) {
              if (newQuantity > product.stock) {
                return item // Cannot exceed stock
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
        if (item.serviceType === 'delivery') setDeliveryEnabled(false)
        if (item.serviceType === 'installation') setInstallationEnabled(false)
        if (item.serviceType === 'warranty') setWarrantyEnabled(false)
      }
      return prev.filter(i => i.id !== itemId)
    })
  }, [])

  // Handle checkout
  const handleCheckout = useCallback(() => {
    setIsCheckoutOpen(true)
  }, [])

  // Confirm checkout
  const handleConfirmCheckout = useCallback(async (amountReceived?: string): Promise<SaleResponse> => {
    setIsProcessing(true)
    
    try {
      const totals = calculateTotals(cart)
      
      const response = await fetch('/api/pos/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        const saleNumber = result.folio
        addSale({
          id: result.sale?.id || Date.now().toString(),
          sale_number: saleNumber,
          customer_id: 'demo',
          sales_rep_id: 'demo',
          branch_id: 'demo',
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
        
        // Store sale data for ticket printing before clearing cart
        setLastSaleItems([...cart])
        setLastSaleTotals({ ...totals })
        
        setLastSale({
          success: true,
          folio: saleNumber,
          ticketUrl: result.ticketUrl,
          shippingOrderId: result.shippingOrderId,
          installationOrderId: result.installationOrderId,
        })
        
        // Clear cart after successful sale
        setCart([])
        setDeliveryEnabled(false)
        setInstallationEnabled(false)
        setWarrantyEnabled(false)
        setLogistics({})
        setPaymentReference('')
        
        // Refresh products from Supabase to get updated stock
        await fetchProducts()
        
        return { success: true, folio: saleNumber }
      }
      
      return { success: false, folio: '', error: result.error || 'Error al procesar venta' }
    } catch (error) {
      console.error('Checkout error:', error)
      return { success: false, folio: '', error: 'Error de conexión' }
    } finally {
      setIsProcessing(false)
    }
  }, [cart, paymentMethod, paymentReference, logistics, addSale, fetchProducts])

  // Reset for new sale
  const handleNewSale = useCallback(() => {
    setLastSale(null)
  }, [])

  // Keyboard shortcuts
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

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* Products Panel */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        <PosToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onBarcodeSubmit={handleBarcodeSubmit}
        />
        
        <div className="flex-1 overflow-y-auto">
          <ProductGrid 
            products={filteredProducts} 
            onAddToCart={handleAddToCart}
            getAvailableStock={getAvailableStock}
          />
          
          {/* Recommended Products Upsell */}
          <RecommendedProducts 
            onAddToCart={handleAddToCart}
          />
        </div>
      </div>

      {/* Cart Panel - Checkout Dominance */}
      <div className="w-[420px] p-4 pl-0 sticky top-0 h-full">
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
          onRemoveItem={handleRemoveItem}
          onCheckout={handleCheckout}
          isCheckingOut={isProcessing}
        />
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
