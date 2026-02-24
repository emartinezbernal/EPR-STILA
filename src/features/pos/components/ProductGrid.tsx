'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Package, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Product } from '@/types/database'

interface ProductGridProps {
  products: Product[]
  onAddToCart: (product: Product) => void
  getAvailableStock?: (product: Product) => number
}

export function ProductGrid({ products, onAddToCart, getAvailableStock }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Package className="h-12 w-12 mb-2 opacity-50" />
        <p className="text-sm">No se encontraron productos</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {products.map((product) => {
        // Calculate available stock (total - reserved in cart)
        const totalStock = product.stock ?? 0
        const availableStock = getAvailableStock ? getAvailableStock(product) : totalStock
        const isLowStock = availableStock > 0 && availableStock <= 5
        const isOutOfStock = availableStock <= 0

        return (
          <Card
            key={product.id}
            className={`
              cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5
              ${isOutOfStock ? 'opacity-60' : ''}
              border-gray-200 hover:border-slate-300
            `}
            onClick={() => !isOutOfStock && onAddToCart(product)}
          >
            <CardContent className="p-3">
              {/* Product Image Placeholder */}
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-md mb-3 flex items-center justify-center">
                {product.images && product.images.length > 0 ? (
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <Package className="h-10 w-10 text-gray-400" />
                )}
              </div>

              {/* SKU */}
              <p className="text-[11px] text-gray-500 font-mono mb-1">
                {product.sku}
              </p>

              {/* Product Name */}
              <p className="font-medium text-sm mb-2 line-clamp-2 h-10">
                {product.name}
              </p>

              {/* Price - Premium Typography */}
              <p className="text-xl font-bold text-slate-800 tabular-nums">
                {formatCurrency(product.base_price)}
              </p>

              {/* Stock & Add Button */}
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {getAvailableStock ? (
                    // Show available stock (considering cart reservations)
                    isOutOfStock ? (
                      <span className="text-xs text-red-600 font-medium flex items-center">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Sin stock
                      </span>
                    ) : isLowStock ? (
                      <span className="text-xs text-amber-600 font-medium flex items-center">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {availableStock} disponibles
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">
                        {availableStock} en stock
                      </span>
                    )
                  ) : (
                    // Fallback to original behavior if no getAvailableStock provided
                    totalStock === undefined ? (
                      <span className="text-xs text-gray-500">Disponible</span>
                    ) : isOutOfStock ? (
                      <span className="text-xs text-red-600 font-medium flex items-center">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Sin stock
                      </span>
                    ) : isLowStock ? (
                      <span className="text-xs text-amber-600 font-medium flex items-center">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {totalStock} disponibles
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">
                        {totalStock} en stock
                      </span>
                    )
                  )}
                </div>

                {!isOutOfStock && (
                  <Button
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      onAddToCart(product)
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
