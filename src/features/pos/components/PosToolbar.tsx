'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  Search, 
  Scan, 
  X,
  Filter
} from 'lucide-react'
import { useDebouncedValue } from '../hooks/usePosShortcuts'

interface PosToolbarProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  categories?: string[]
  selectedCategory?: string
  onCategoryChange?: (category: string) => void
  onBarcodeSubmit?: (barcode: string) => void
}

export function PosToolbar({
  searchTerm,
  onSearchChange,
  categories = [],
  selectedCategory = 'all',
  onCategoryChange,
  onBarcodeSubmit,
}: PosToolbarProps) {
  const [localSearch, setLocalSearch] = useState(searchTerm)
  const [barcodeInput, setBarcodeInput] = useState('')
  const [showBarcode, setShowBarcode] = useState(false)
  const barcodeRef = useRef<HTMLInputElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  // Debounce search (300ms)
  const [debouncedSearch] = useDebouncedValue(localSearch, 300)

  useEffect(() => {
    onSearchChange(debouncedSearch)
  }, [debouncedSearch, onSearchChange])

  // Handle barcode submission
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (barcodeInput.trim() && onBarcodeSubmit) {
      onBarcodeSubmit(barcodeInput.trim())
      setBarcodeInput('')
      setShowBarcode(false)
    }
  }

  // Focus search on F2
  useEffect(() => {
    const handleFocusSearch = () => {
      searchRef.current?.focus()
    }
    window.addEventListener('focus-search', handleFocusSearch)
    return () => {
      window.removeEventListener('focus-search', handleFocusSearch)
    }
  }, [])

  return (
    <div className="space-y-3 mb-4">
      {/* Fast Bar - Barcode & Search */}
      <div className="flex gap-2">
        {/* Barcode Quick Input */}
        <div className="relative">
          <Button
            variant={showBarcode ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setShowBarcode(!showBarcode)
              if (!showBarcode) {
                setTimeout(() => barcodeRef.current?.focus(), 100)
              }
            }}
            className="h-10 px-3"
            title="F2: Buscar (Ctrl+K)"
          >
            <Scan className="h-4 w-4 mr-1" />
            <span className="text-xs hidden sm:inline">SKU/Barcode</span>
          </Button>
          
          {showBarcode && (
            <form 
              onSubmit={handleBarcodeSubmit}
              className="absolute left-0 top-full mt-1 w-64 z-50"
            >
              <Input
                ref={barcodeRef}
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Escanear o escribir SKU..."
                className="h-10 font-mono"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">Presiona Enter para agregar</p>
            </form>
          )}
        </div>

        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            ref={searchRef}
            placeholder="Buscar productos... (Ctrl+K)"
            className="pl-10 h-10"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Chips */}
      {categories.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => onCategoryChange?.('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange?.(category)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-slate-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
