'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Package, AlertTriangle, Warehouse, Plus, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useProductStore } from '@/stores/product-store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddStockOpen, setIsAddStockOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState('')
  const [addQuantity, setAddQuantity] = useState(1)
  
  const { products, updateProduct, fetchProducts, isLoading } = useProductStore()

  // Fetch products from Supabase on mount
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleAddStock = () => {
    if (selectedProductId && addQuantity > 0) {
      const product = products.find(p => p.id === selectedProductId)
      if (product) {
        updateProduct(selectedProductId, {
          stock: (product.stock || 0) + addQuantity
        })
        setIsAddStockOpen(false)
        setSelectedProductId('')
        setAddQuantity(1)
      }
    }
  }

  const selectedProduct = products.find(p => p.id === selectedProductId)

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalItems = products.reduce((sum, p) => sum + (p.stock || 0), 0)
  const totalValue = products.reduce((sum, p) => sum + ((p.stock || 0) * (p.cost_price || 0)), 0)
  const lowStock = products.filter((p) => (p.stock || 0) < 10).length

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-500">Manage inventory and products</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Warehouse className="mr-2 h-4 w-4" />
            Lots
          </Button>
          <Button onClick={() => setIsAddStockOpen(true)}>
            <Package className="mr-2 h-4 w-4" />
            Add Stock
          </Button>
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center justify-center py-8 mb-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Cargando inventario desde Supabase...</span>
        </div>
      )}

      {!isLoading && (
        <>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalItems}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{lowStock}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Products Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">SKU</th>
                      <th className="text-left py-3 px-4 font-medium">Product Name</th>
                      <th className="text-right py-3 px-4 font-medium">Stock</th>
                      <th className="text-right py-3 px-4 font-medium">Cost Price</th>
                      <th className="text-right py-3 px-4 font-medium">Base Price</th>
                      <th className="text-right py-3 px-4 font-medium">Value</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-sm">{product.sku}</td>
                        <td className="py-3 px-4">{product.name}</td>
                        <td className="py-3 px-4 text-right font-medium">
                          <span className={(product.stock || 0) < 10 ? 'text-red-600' : ''}>
                            {product.stock || 0}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">{formatCurrency(product.cost_price || 0)}</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(product.base_price)}</td>
                        <td className="py-3 px-4 text-right">{formatCurrency((product.stock || 0) * (product.cost_price || 0))}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            (product.stock || 0) > 0 ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {(product.stock || 0) > 0 ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={isAddStockOpen} onOpenChange={setIsAddStockOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Stock</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="product">Product</Label>
              <select
                id="product"
                className="w-full border rounded-md p-2 bg-background"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
              >
                <option value="">Select a product...</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.sku} - {product.name} (Current Stock: {product.stock || 0})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity to Add</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={addQuantity}
                onChange={(e) => setAddQuantity(parseInt(e.target.value) || 0)}
              />
            </div>
            {selectedProduct && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">New Stock Level:</p>
                <p className="text-2xl font-bold">
                  {(selectedProduct.stock || 0) + addQuantity}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddStockOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStock} disabled={!selectedProductId || addQuantity <= 0}>
              <Plus className="mr-2 h-4 w-4" />
              Add Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
