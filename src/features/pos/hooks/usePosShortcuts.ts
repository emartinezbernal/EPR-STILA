'use client'

import { useEffect, useCallback } from 'react'

interface UsePosShortcutsProps {
  onSearchFocus?: () => void
  onCheckout?: () => void
  onEscape?: () => void
  onBarcodeSubmit?: (barcode: string) => void
}

export function usePosShortcuts({
  onSearchFocus,
  onCheckout,
  onEscape,
  onBarcodeSubmit,
}: UsePosShortcutsProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // F2 - Focus search
      if (event.key === 'F2') {
        event.preventDefault()
        onSearchFocus?.()
        return
      }

      // F4 - Open checkout
      if (event.key === 'F4') {
        event.preventDefault()
        onCheckout?.()
        return
      }

      // Escape - Close dialogs/clear
      if (event.key === 'Escape') {
        event.preventDefault()
        onEscape?.()
        return
      }

      // Ctrl+K - Focus search (alternative)
      if (event.ctrlKey && event.key === 'k') {
        event.preventDefault()
        onSearchFocus?.()
        return
      }

      // Ctrl+Enter - Checkout (alternative)
      if (event.ctrlKey && event.key === 'Enter') {
        event.preventDefault()
        onCheckout?.()
        return
      }
    },
    [onSearchFocus, onCheckout, onEscape]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])
}

// Hook for debounced search
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Import useState
import { useState } from 'react'

export function useDebouncedValue<T>(value: T, delay: number = 300): [T, T] {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return [value, debounced]
}
