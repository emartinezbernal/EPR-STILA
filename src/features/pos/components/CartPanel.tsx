'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
  Shield,
  User,
  Phone,
  FileText,
  CheckCircle,
  Sparkles,
  Zap
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { CartItem, LogisticsDetails, SERVICE_PRICES } from '../lib/types'
import { calculateTotals } from '../lib/cartLogic'
import { ServicesSection } from './ServicesSection'

interface CartPanelProps {
  items: CartItem[]
  logistics: LogisticsDetails
  onLogisticsChange: (logistics: LogisticsDetails) => void
  deliveryEnabled: boolean
  installationEnabled: boolean
  warrantyEnabled?: boolean
  onDeliveryToggle: (enabled: boolean) => void
  onInstallationToggle: (enabled: boolean) => void
  onWarrantyToggle?: (enabled: boolean) => void
  onAddBundle?: () => void
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
  warrantyEnabled = false,
  onDeliveryToggle,
  onInstallationToggle,
  onWarrantyToggle,
  onAddBundle,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  isCheckingOut = false,
}: CartPanelProps) {
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerNotes, setCustomerNotes] = useState('')
  const [totalAnimating, setTotalAnimating] = useState(false)
  const [prevTotal, setPrevTotal] = useState(0)
  
  const totals = calculateTotals(items)
  const isEmpty = items.length === 0
  const hasProducts = items.some(item => !item.isService)
  const hasMirror = items.some(item => !item.isService && 
    (item.name.toLowerCase().includes('espejo') || item.name.toLowerCase().includes('mirror')))
  
  // Animate total when it changes
  useEffect(() => {
    if (totals.total !== prevTotal && prevTotal > 0) {
      setTotalAnimating(true)
      const timer = setTimeout(() => setTotalAnimating(false), 500)
      setPrevTotal(totals.total)
      return () => clearTimeout(timer)
    } else if (prevTotal === 0) {
      setPrevTotal(totals.total)
    }
  }, [totals.total, prevTotal])

  // Get service icons
  const getServiceIcon = (serviceType?: string) => {
    switch (serviceType) {
      case 'delivery':
        return <Truck className="h-3 w-3 text-blue-600" />
      case 'installation':
        return <Wrench className="h-3 w-3 text-green-600" />
      case 'warranty':
        return <Shield className="h-3 w-3 text-purple-600" />
      default:
        return null
    }
  }

  // Bundle pricing
  const LED_PRICE = 450
  const INSTALL_PRICE = SERVICE_PRICES.INSTALLATION
  const MIRROR_SAMPLE = items.find(item => !item.isService)?.unitPrice || 0
  const BUNDLE_SAVING = 150
  const BUNDLE_PRICE = MIRROR_SAMPLE + LED_PRICE + INSTALL_PRICE - BUNDLE_SAVING

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg border-2 border-slate-200">
      {/* Header - Premium */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-slate-50 to-white">
        <h2 className="text-xl font-bold flex items-center text-slate-800">
          <ShoppingCart className="mr-2 h-5 w-5 text-slate-600" />
          Carrito de Compra
        </h2>
        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-sm font-medium rounded-full">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4">
        {isEmpty ? (
          <div className="text-center py-12 text-gray-500">
            <ShoppingCart className="mx-auto h-16 w-16 mb-3 opacity-30" />
            <p className="text-lg font-medium">Carrito vacío</p>
            <p className="text-sm mt-1">Agrega productos para comenzar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item.id} className="border-l-4 border-l-slate-300 hover:border-l-slate-400 transition-all">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {item.isService && getServiceIcon(item.serviceType)}
                        <p className="font-semibold text-sm truncate">{item.name}</p>
                      </div>
                      <p className="text-xs text-gray-500 font-mono">{item.sku}</p>
                      <p className="text-base font-bold text-slate-700 mt-1 tabular-nums">
                        {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    
                    {!item.isService && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onUpdateQuantity(item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-10 text-center text-sm font-bold">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onUpdateQuantity(item.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 ml-2 hover:bg-red-50"
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
                  
                  <p className="text-right font-bold text-lg mt-2 tabular-nums text-slate-800">
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

      {/* Bundle Suggestion Block */}
      {hasMirror && !installationEnabled && onAddBundle && (
        <div className="p-4 border-t bg-gradient-to-r from-amber-50 to-yellow-50">
          <div className="rounded-lg border-2 border-amber-300 bg-white p-3">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <span className="font-bold text-sm text-slate-800">🎁 Bundle Especial</span>
            </div>
            <p className="text-xs text-slate-600 mb-2">
              Espejo + LED + Instalación
            </p>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(BUNDLE_PRICE)}
                </span>
                <span className="text-xs text-slate-400 line-through ml-2">
                  {formatCurrency(MIRROR_SAMPLE + LED_PRICE + INSTALL_PRICE)}
                </span>
                <span className="text-xs text-green-600 font-medium ml-1">
                  -${BUNDLE_SAVING}
                </span>
              </div>
              <Button 
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-white"
                onClick={onAddBundle}
              >
                <Zap className="h-4 w-4 mr-1" />
                Agregar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Extended Warranty Block - Upsell */}
      {hasProducts && onWarrantyToggle && (
        <div className="p-4 border-t bg-gradient-to-r from-purple-50 to-white">
          <div className={`rounded-lg border-2 transition-all duration-200 ${
            warrantyEnabled 
              ? 'border-purple-500 bg-purple-50/50' 
              : 'border-purple-200 bg-white hover:border-purple-300'
          }`}>
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="warranty"
                  checked={warrantyEnabled}
                  onChange={(e) => onWarrantyToggle(e.target.checked)}
                  className="h-5 w-5 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <Label 
                    htmlFor="warranty" 
                    className="flex items-center cursor-pointer font-semibold text-slate-800"
                  >
                    <Shield className="h-4 w-4 mr-2 text-purple-600" />
                    Garantía extendida
                  </Label>
                  <p className="text-xs text-slate-500 mt-0.5">
                    +{formatCurrency(SERVICE_PRICES.EXTENDED_WARRANTY)} (1 año extra)
                  </p>
                </div>
              </div>
              {warrantyEnabled && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                  Activo
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Customer Entry - Premium */}
      <div className="p-4 border-t bg-slate-50">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-slate-800">TOTAL</span>
          <span className="text-3xl font-bold text-green-600 tabular-nums">
            {formatCurrency(totals.total)}
          </span>
        </div>
      </div>

      {/* Checkout Button - Full Width Dominant */}
      <div className="p-4 border-t bg-gradient-to-r from-green-50 to-white">
        <Button
          className="w-full h-14 text-xl font-bold shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
          onClick={onCheckout}
          disabled={isEmpty || isCheckingOut}
        >
          {isCheckingOut ? (
            <span className="flex items-center">
              <span className="animate-spin mr-2">⏳</span>
              Procesando...
            </span>
          ) : (
            <span className="flex items-center">
              <CheckCircle className="mr-3 h-6 w-6" />
              COBRAR {formatCurrency(totals.total)}
            </span>
          )}
        </Button>
        
        {/* Keyboard hint */}
        <p className="text-xs text-center text-slate-400 mt-3 font-medium">
          F4: Cobrar &nbsp;•&nbsp; Esc: Cancelar &nbsp;•&nbsp; F2: Nuevo cliente
        </p>
      </div>
    </div>
  )
}
