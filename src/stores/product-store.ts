import { create } from 'zustand'
import { Product } from '@/types/database'
import { supabase } from '@/lib/supabase'

interface ProductStore {
  products: Product[]
  isLoading: boolean
  error: string | null
  setProducts: (products: Product[]) => void
  fetchProducts: () => Promise<void>
  addProduct: (product: Product) => Promise<boolean>
  updateProduct: (id: string, updates: Partial<Product>) => Promise<boolean>
  deleteProduct: (id: string) => Promise<boolean>
  getProductById: (id: string) => Product | undefined
}

// No fallback products - we load directly from Supabase
const fallbackProducts: Product[] = []

export const useProductStore = create<ProductStore>((set, get) => ({
  products: fallbackProducts,
  isLoading: false,
  error: null,

  setProducts: (products) => {
    set({ products })
  },

  fetchProducts: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) {
        console.error('Error fetching products from Supabase:', error)
        set({ products: fallbackProducts, isLoading: false })
        return
      }

      if (data && data.length > 0) {
        console.log('Products loaded from Supabase:', data.length)
        set({ products: data as Product[], isLoading: false })
      } else {
        console.log('No products found in Supabase')
        set({ products: fallbackProducts, isLoading: false })
      }
    } catch (err) {
      console.error('Exception fetching products:', err)
      set({ products: fallbackProducts, isLoading: false })
    }
  },

  addProduct: async (product: Product) => {
    // Generate ID if not provided
    const productWithId = {
      ...product,
      id: product.id || crypto.randomUUID(),
      created_at: product.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    try {
      // Build insert object - only include category_id and brand_id if they are defined
      const insertData: Record<string, unknown> = {
        sku: productWithId.sku,
        name: productWithId.name,
        description: productWithId.description || null,
        base_price: productWithId.base_price,
        cost_price: productWithId.cost_price ?? null,
        minimum_price: productWithId.minimum_price ?? null,
        maximum_discount: productWithId.maximum_discount ?? 0,
        track_inventory: productWithId.track_inventory ?? true,
        is_kit: productWithId.is_kit ?? false,
        is_active: productWithId.is_active ?? true,
        is_featured: productWithId.is_featured ?? false,
        stock: productWithId.stock ?? 0,
      }

      // Only add category_id if it's a valid UUID (not '1' or similar)
      if (productWithId.category_id && productWithId.category_id.length === 36) {
        insertData.category_id = productWithId.category_id
      }

      // Only add brand_id if it's a valid UUID (not '1' or similar)
      if (productWithId.brand_id && productWithId.brand_id.length === 36) {
        insertData.brand_id = productWithId.brand_id
      }

      const { data, error } = await supabase
        .from('products')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        console.error('Error adding product to Supabase:', error)
        alert(`Error al guardar en Supabase: ${error.message}`)
        return false
      }

      if (data) {
        const currentProducts = get().products
        const updatedProducts = [...currentProducts, data as Product]
        set({ products: updatedProducts })
        return true
      }
      return false
    } catch (err) {
      console.error('Exception adding product:', err)
      alert(`Error de conexión: ${err}`)
      return false
    }
  },

  updateProduct: async (id: string, updates: Partial<Product>) => {
    const updatedAt = new Date().toISOString()

    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          ...updates,
          updated_at: updatedAt,
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating product in Supabase:', error)
        alert(`Error al actualizar: ${error.message}`)
        return false
      }

      if (data) {
        const currentProducts = get().products
        const updatedProducts = currentProducts.map((p) =>
          p.id === id ? data as Product : p
        )
        set({ products: updatedProducts })
        return true
      }
      return false
    } catch (err) {
      console.error('Exception updating product:', err)
      alert(`Error de conexión: ${err}`)
      return false
    }
  },

  deleteProduct: async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id)

      if (error) {
        console.error('Error deleting product from Supabase:', error)
        alert(`Error al eliminar: ${error.message}`)
        return false
      }

      const currentProducts = get().products
      const updatedProducts = currentProducts.filter((p) => p.id !== id)
      set({ products: updatedProducts })
      return true
    } catch (err) {
      console.error('Exception deleting product:', err)
      alert(`Error de conexión: ${err}`)
      return false
    }
  },

  getProductById: (id: string) => get().products.find((p) => p.id === id),
}))
