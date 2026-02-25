'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { 
  X, 
  Banknote, 
  CreditCard, 
  Smartphone,
  CheckCircle,
  AlertCircle,
  Loader2,
  Truck,
  Wrench,
  Printer
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { PaymentMethod, SaleResponse, LogisticsDetails, CartItem } from '../lib/types'
import { calculateTotals } from '../lib/cartLogic'

interface CheckoutDrawerProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  lastSaleItems?: CartItem[]
  lastSaleTotals?: {
    subtotal: number
    productsTax: number
    servicesTax: number
    servicesTotal: number
    total: number
  }
  logistics: LogisticsDetails
  paymentMethod: PaymentMethod
  onPaymentMethodChange: (method: PaymentMethod) => void
  paymentReference: string
  onPaymentReferenceChange: (ref: string) => void
  onConfirm: (amountReceived?: string) => Promise<SaleResponse>
  isProcessing: boolean
  lastSale?: SaleResponse | null
}

const paymentMethods: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { value: 'EFECTIVO', label: 'Efectivo', icon: <Banknote className="h-5 w-5" /> },
  { value: 'TARJETA_CREDITO', label: 'Tarjeta Crédito', icon: <CreditCard className="h-5 w-5" /> },
  { value: 'TARJETA_DEBITO', label: 'Tarjeta Débito', icon: <CreditCard className="h-5 w-5" /> },
  { value: 'TRANSFERENCIA', label: 'Transferencia', icon: <Smartphone className="h-5 w-5" /> },
  { value: 'QR', label: 'QR', icon: <Smartphone className="h-5 w-5" /> },
]

const quickAmounts = [100, 200, 500, 1000, 2000, 5000]

export function CheckoutDrawer({
  isOpen,
  onClose,
  items,
  lastSaleItems,
  lastSaleTotals,
  logistics,
  paymentMethod,
  onPaymentMethodChange,
  paymentReference,
  onPaymentReferenceChange,
  onConfirm,
  isProcessing,
  lastSale,
}: CheckoutDrawerProps) {
  const [saleResponse, setSaleResponse] = useState<SaleResponse | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [amountReceived, setAmountReceived] = useState<string>('')
  const [savedChange, setSavedChange] = useState<number>(0)
  const [savedAmountReceived, setSavedAmountReceived] = useState<number>(0)
  
  const totals = calculateTotals(items)
  const amountNum = parseFloat(amountReceived) || 0
  const change = paymentMethod === 'EFECTIVO' ? Math.max(0, amountNum - totals.total) : 0
  const isExactAmount = paymentMethod === 'EFECTIVO' ? amountNum >= totals.total : true
  const needsMoreMoney = paymentMethod === 'EFECTIVO' && amountNum < totals.total

  useEffect(() => {
    if (isOpen) {
      setAmountReceived('')
      setSavedChange(0)
      setSavedAmountReceived(0)
      setSaleResponse(null)
      setErrors([])
    }
  }, [isOpen])

  useEffect(() => {
    if (paymentMethod !== 'EFECTIVO') {
      setAmountReceived('')
      setSavedChange(0)
      setSavedAmountReceived(0)
    }
  }, [paymentMethod])

  const handleQuickAmount = (amount: number) => {
    setAmountReceived(amount.toString())
  }

  const handleConfirm = async () => {
    console.log('CLICK_CONFIRM', { paymentMethod, amountReceived, total: totals.total, needsMoreMoney, paymentReference })
    setErrors([])
    
    const newErrors: string[] = []
    
    if (paymentMethod === 'EFECTIVO') {
      if (!amountReceived || parseFloat(amountReceived) < totals.total) {
        newErrors.push('El monto recibido debe ser mayor o igual al total')
        console.log('BLOCKED_REASON', 'EFECTIVO: amountReceived is empty or less than total')
      }
    }
    
    if (paymentMethod === 'TRANSFERENCIA' && !paymentReference.trim()) {
      newErrors.push('La referencia de transferencia es requerida')
      console.log('BLOCKED_REASON', 'TRANSFERENCIA: paymentReference is empty')
    }
    
    if (items.length === 0) {
      newErrors.push('El carrito está vacío')
      console.log('BLOCKED_REASON', 'Cart is empty')
    }
    
    const hasDelivery = items.some(i => i.isService && i.serviceType === 'delivery')
    const hasInstallation = items.some(i => i.isService && i.serviceType === 'installation')
    
    if (hasDelivery && !logistics.deliveryAddress) {
      newErrors.push('La dirección de entrega es requerida')
      console.log('BLOCKED_REASON', 'Delivery is enabled but deliveryAddress is missing')
    }
    
    if (hasInstallation && (!logistics.installationAddress || !logistics.installationContactName || !logistics.installationContactPhone)) {
      newErrors.push('Los datos de instalación son requeridos')
      console.log('BLOCKED_REASON', 'Installation is enabled but installation data is incomplete')
    }
    
    if (newErrors.length > 0) {
      setErrors(newErrors)
      console.log('BLOCKED_REASON', 'Validation errors found:', newErrors)
      return
    }
    
    if (paymentMethod === 'EFECTIVO') {
      setSavedChange(change)
      setSavedAmountReceived(amountNum)
    }
    
    console.log('CHECKOUT_START')
    const response = await onConfirm(amountReceived || '0')
    setSaleResponse(response)
  }

  const handleClose = () => {
    setSaleResponse(null)
    setErrors([])
    setAmountReceived('')
    setSavedChange(0)
    setSavedAmountReceived(0)
    onClose()
  }

  const handlePrintTicket = () => {
    if (!saleResponse) return

    const ticketTotals = lastSaleTotals || totals
    const ticketItems = lastSaleItems || items

    const received = savedAmountReceived > 0 ? savedAmountReceived : (amountReceived ? parseFloat(amountReceived) : ticketTotals.total)
    const changeAmount = savedChange > 0 ? savedChange : Math.max(0, received - ticketTotals.total)

    const params = new URLSearchParams({
      saleId: saleResponse.folio || 'demo',
      saleNumber: saleResponse.folio || 'DEMO-001',
      total: ticketTotals.total.toString(),
      paymentMethod: paymentMethod,
      amountReceived: received.toString(),
      change: changeAmount.toString(),
    })

    const itemsData = ticketItems
      .filter(item => !item.isService)
      .map(item => ({
        name: item.name || 'Producto',
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        total: item.total || 0,
      }))
    
    if (itemsData.length > 0) {
      params.set('items', JSON.stringify(itemsData))
    }

    const ticketUrl = `/api/pos/ticket?${params.toString()}`
    window.open(ticketUrl, '_blank', 'width=400,height=600')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/80" onClick={handleClose} />
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col border-l border-slate-300">
        <div className="flex items-center justify-between p-4 border-b bg-slate-800 text-white">
          <h2 className="text-lg font-semibold">
            {saleResponse ? 'Venta Completada' : 'Confirmar Pago'}
          </h2>
          <Button variant="ghost" size="icon" onClick={handleClose} className="text-white hover:bg-slate-700">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {saleResponse?.success ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">¡Venta Exitosa!</h3>
              <p className="text-gray-600 mb-4">
                Folio: <span className="font-mono font-bold">{saleResponse.folio}</span>
              </p>
              
              {paymentMethod === 'EFECTIVO' && savedChange > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-green-700">Vuelto</p>
                  <p className="text-2xl font-bold text-green-700">{formatCurrency(savedChange)}</p>
                </div>
              )}
              
              <Button variant="outline" className="w-full mb-3" onClick={handlePrintTicket}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimir Ticket
              </Button>
              
              <div className="space-y-3 mt-2">
                {saleResponse.shippingOrderId && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={`/shipping/${saleResponse.shippingOrderId}`}>
                      <Truck className="mr-2 h-4 w-4" />
                      Ver Orden de Envío
                    </a>
                  </Button>
                )}
                {saleResponse.installationOrderId && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={`/installations/${saleResponse.installationOrderId}`}>
                      <Wrench className="mr-2 h-4 w-4" />
                      Ver Orden de Instalación
                    </a>
                  </Button>
                )}
              </div>
              
              <Button className="w-full mt-6" onClick={handleClose}>Cerrar</Button>
            </div>
          ) : (
            <>
              <Card className="mb-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Resumen de Venta</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Productos ({items.filter(i => !i.isService).length})</span>
                      <span>{formatCurrency(totals.subtotal)}</span>
                    </div>
                    {totals.servicesTotal > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Servicios</span>
                        <span>{formatCurrency(totals.servicesTotal)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">IVA</span>
                      <span>{formatCurrency(totals.productsTax + totals.servicesTax)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span className="text-green-600">{formatCurrency(totals.total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="mb-4">
                <Label className="text-sm font-medium mb-2 block">Método de Pago</Label>
                <div className="grid grid-cols-2 gap-2">
                  {paymentMethods.map((method) => (
                    <Button
                      key={method.value}
                      variant={paymentMethod === method.value ? 'default' : 'outline'}
                      className="h-12"
                      onClick={() => onPaymentMethodChange(method.value)}
                    >
                      {method.icon}
                      <span className="ml-2">{method.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {paymentMethod === 'EFECTIVO' && (
                <div className="mb-4">
                  <Label htmlFor="amountReceived" className="text-sm font-medium mb-2 block">
                    💰 Dinero Recibido *
                  </Label>
                  <Input
                    id="amountReceived"
                    type="number"
                    placeholder="0.00"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    className="text-xl h-12 font-mono"
                  />
                  
                  <div className="mt-2 flex flex-wrap gap-1">
                    {quickAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        className="text-xs h-8"
                        onClick={() => handleQuickAmount(amount)}
                      >
                        ${amount}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-8"
                      onClick={() => handleQuickAmount(Math.ceil(totals.total / 100) * 100)}
                    >
                      Exact
                    </Button>
                  </div>
                  
                  {amountReceived && isExactAmount && (
                    <div className="mt-3 p-3 rounded-lg border bg-green-50 border-green-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Recibido:</span>
                        <span className="font-mono font-bold">{formatCurrency(amountNum)}</span>
                      </div>
                      <div className="flex justify-between items-center text-green-700 pt-2 border-t border-green-200 mt-2">
                        <span className="text-sm font-medium">Vuelto:</span>
                        <span className="font-mono font-bold text-lg">{formatCurrency(change)}</span>
                      </div>
                    </div>
                  )}
                  
                  {amountReceived && needsMoreMoney && (
                    <div className="mt-3 p-3 rounded-lg border bg-red-50 border-red-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Recibido:</span>
                        <span className="font-mono font-bold">{formatCurrency(amountNum)}</span>
                      </div>
                      <div className="flex justify-between items-center text-red-600 pt-2 border-t border-red-200 mt-2">
                        <span className="text-sm font-medium">Falta:</span>
                        <span className="font-mono font-bold">{formatCurrency(totals.total - amountNum)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === 'TRANSFERENCIA' && (
                <div className="mb-4">
                  <Label htmlFor="reference">Referencia de Transferencia *</Label>
                  <Input
                    id="reference"
                    placeholder="Ingrese la referencia"
                    value={paymentReference}
                    onChange={(e) => onPaymentReferenceChange(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}

              {errors.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  {errors.map((error, i) => (
                    <p key={i} className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {error}
                    </p>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {!saleResponse?.success && (
          <div className="p-4 border-t bg-gray-50">
            <Button
              type="button"
              className="w-full h-12 text-lg font-semibold"
              onClick={handleConfirm}
              disabled={isProcessing || (paymentMethod === 'EFECTIVO' && needsMoreMoney)}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>Confirmar Pago {formatCurrency(totals.total)}</>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
