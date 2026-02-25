'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Sparkles } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Product } from '@/types/database'

// Recommended products for upsell (mock data - in production these would come from backend)
const RECOMMENDED_PRODUCTS: Array<{ id: string; name: string; sku: string; price: number; category: string }> = [
  { id: 'led-001', name: 'Luz LED para espejo', sku: 'LED-MIRROR-01', price: 450, category: 'Accesorios' },
  { id: 'kit-001', name: 'Kit de montaje premium', sku: 'KIT-MOUNT-01', price: 280, category: 'Accesorios' },
  { id: 'hw-001', name: 'Herrajes decorativos', sku: 'HW-DECOR-01', price: 390, category: 'Accesorios' },
]

interface RecommendedProductsProps {
  onAddToCart: (product: Product) => void
  currentProductId?: string
}

// Helper to create mock product
function createMockProduct(product: { id: string; name: string; sku: string; price: number }): Product {
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    base_price: product.price,
    track_inventory: false,
    is_kit: false,
    is_featured: false,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

export function RecommendedProducts({ onAddToCart, currentProductId }: RecommendedProductsProps) {
  // Filter out current product if any
  const products = RECOMMENDED_PRODUCTS.filter(p => p.id !== currentProductId).slice(0, 3)

  const handleAddToCart = (product: { id: string; name: string; sku: string; price: number }) => {
    onAddToCart(createMockProduct(product))
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-amber-500" />
        <h3 className="font-semibold text-sm text-slate-800">
          Clientes también agregan
        </h3>
      </div>

      {/* Horizontal scroll container */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {products.map((product) => (
          <Card
            key={product.id}
            className="flex-shrink-0 w-[140px] cursor-pointer border-amber-100 hover:border-amber-300 hover:shadow-md transition-all"
            onClick={() => handleAddToCart(product)}
          >
            <CardContent className="p-2">
              {/* Icon placeholder */}
              <div className="aspect-square bg-gradient-to-br from-amber-50 to-amber-100 rounded-md mb-2 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-amber-400" />
              </div>

              {/* Product name */}
              <p className="text-xs font-medium text-slate-800 line-clamp-2 mb-1">
                {product.name}
              </p>

              {/* Price and add button */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">
                  {formatCurrency(product.price)}
                </span>
                <Button
                  size="sm"
                  className="h-6 w-6 p-0 rounded-full bg-amber-500 hover:bg-amber-600"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAddToCart(product)
                  }}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
