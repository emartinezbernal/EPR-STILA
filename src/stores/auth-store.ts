import { create } from 'zustand'
import { UserProfile, UserRole } from '@/types/database'

interface AuthState {
  user: UserProfile | null
  isLoading: boolean
  setUser: (user: UserProfile | null) => void
  setLoading: (loading: boolean) => void
  hasPermission: (requiredRoles: UserRole[]) => boolean
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  
  setUser: (user) => set({ user }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  hasPermission: (requiredRoles) => {
    const { user } = get()
    if (!user) return false
    if (user.role === 'super_admin') return true
    return requiredRoles.includes(user.role)
  },
  
  isAdmin: () => {
    const { user } = get()
    if (!user) return false
    return ['super_admin', 'admin', 'finance_admin', 'operations_admin'].includes(user.role)
  },
}))
