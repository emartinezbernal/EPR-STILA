'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, getRedirectPath } from '@/stores/auth-store'

interface AuthGuardProps {
  children: ReactNode
  requiredRoles?: string[]
}

export function AuthGuard({ children, requiredRoles }: AuthGuardProps) {
  const router = useRouter()
  const { user, initialized, isLoading } = useAuthStore()

  // If still loading, show nothing
  if (!initialized || isLoading) {
    return null
  }

  // If no user, redirect to login
  if (!user) {
    if (typeof window !== 'undefined') {
      router.push('/login')
    }
    return null
  }

  // If roles are required, check permissions
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRole = requiredRoles.includes(user.role) || user.role === 'super_admin'
    if (!hasRole) {
      // Redirect to their default page based on role
      const redirectPath = getRedirectPath(user.role)
      router.push(redirectPath)
      return null
    }
  }

  return <>{children}</>
}
