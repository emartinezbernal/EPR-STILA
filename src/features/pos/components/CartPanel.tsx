'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  Truck,
  Wrench,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { CartItem, LogisticsDetails } from '../lib/types'
import { calculateTotals } from '../lib/cartLogic'
import { ServicesSection } from './ServicesSection'

interface CartPanelProps {
  items: CartItem[]
  logistics: LogisticsDetails
  onLogisticsChange: (logistics: LogisticsDetails) => void
  deliveryEnabled: boolean
  installationEnabled: boolean
  onDeliveryToggle: (enabled: boolean) => void
  onInstallationToggle: (enabled: boolean) => void
  onUpdateQuantity: (itemId: string, delta: number) => void
  onRemoveItem: (itemId: string) => void
  onCheckout: () => void
  isCheckingOut?: boolean
}

export function CartPanel({
  items,
  logistics,
  onLogisticsChange,
  deliveryEnabled,
  installationEnabled,
  onDeliveryToggle,
  onInstallationToggle,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  isCheckingOut = false,
}: CartPanelProps) {
  const [customerName, setCustomerName] = useState('')
  
  const totals = calculateTotals(items)
  const isEmpty = items.length === 0

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center text-slate-800">
          <ShoppingCart className="mr-2 h-5 w-5" />
          Carrito
        </h2>
        <span className="text-sm text-gray-500">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4">
        {isEmpty ? (
          <div className="text-center py-12 text-gray-500">
            <ShoppingCart className="mx-auto h-12 w-12 mb-2 opacity-50" />
            <p>Carrito vacío</p>
            <p className="text-xs mt-1">Agrega productos para comenzar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item.id} className="border-gray-100">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {item.isService && (
                          item.serviceType === 'delivery' ? (
                            <Truck className="h-3 w-3 text-blue-600" />
                          ) : (
                            <Wrench className="h-3 w-3 text-green-600" />
                          )
                        )}
                        <p className="font-medium text-sm truncate">{item.name}</p>
                      </div>
                      <p className="text-xs text-gray-500 font-mono">{item.sku}</p>
                      <p className="text-sm font-bold text-slate-700 mt-1 tabular-nums">
                        {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    
                    {!item.isService && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => onUpdateQuantity(item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => onUpdateQuantity(item.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500 ml-2"
                      onClick={() => onRemoveItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Service indicators */}
                  {item.isService && (
                    <div className="mt-2 text-xs text-gray-500">
                      {item.serviceType === 'delivery' && logistics.deliveryAddress && (
                        <span>📍 {logistics.deliveryAddress}</span>
                      )}
                      {item.serviceType === 'installation' && logistics.installationAddress && (
                        <span>📍 {logistics.installationAddress}</span>
                      )}
                    </div>
                  )}
                  
                  <p className="text-right font-semibold mt-2 tabular-nums">
                    {formatCurrency(item.total)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Services Section */}
      {items.length > 0 && (
        <ServicesSection
          logistics={logistics}
          onLogisticsChange={onLogisticsChange}
          deliveryEnabled={deliveryEnabled}
          installationEnabled={installationEnabled}
          onDeliveryToggle={onDeliveryToggle}
          onInstallationToggle={onInstallationToggle}
        />
      )}

      {/* Customer Input */}
      <div className="p-4 border-t">
        <Label htmlFor="customer" className="text-xs text-gray-500">
          Cliente (opcional)
        </Label>
        <Input
          id="customer"
          placeholder="Nombre del cliente"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="mt-1"
        />
      </div>

      {/* Totals - Sticky */}
      <div className="border-t bg-gray-50 p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium tabular-nums">{formatCurrency(totals.subtotal)}</span>
        </div>
        
        {totals.servicesTotal > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Servicios</span>
            <span className="font-medium tabular-nums">{formatCurrency(totals.servicesTotal)}</span>
          </div>
        )}
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">IVA (16%)</span>
          <span className="font-medium tabular-nums">{formatCurrency(totals.productsTax + totals.servicesTax)}</span>
        </div>
        
        <div className="flex justify-between text-xl font-bold pt-2 border-t">
          <span>Total</span>
          <span className="text-green-600 tabular-nums">{formatCurrency(totals.total)}</span>
        </div>
      </div>

      {/* Checkout Button */}
      <div className="p-4 border-t">
        <Button
          className="w-full h-12 text-lg font-semibold"
          onClick={onCheckout}
          disabled={isEmpty || isCheckingOut}
        >
          {isCheckingOut ? (
            <>Procesando...</>
          ) : (
            <>
              <CheckCircle className="mr-2 h-5 w-5" />
              Cobrar {formatCurrency(totals.total)}
            </>
          )}
        </Button>
        
        {/* Keyboard hint */}
        <p className="text-xs text-center text-gray-400 mt-2">
          F4: Cobrar | Esc: Cancelar
        </p>
      </div>
    </div>
  )
}
