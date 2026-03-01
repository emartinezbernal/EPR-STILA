'use client'

import { ReactNode, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { Loader2 } from 'lucide-react'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { initializeAuth, isLoading, initialized, user } = useAuthStore()

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  // Show loading while initializing
  if (!initialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Cargando sistema...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
