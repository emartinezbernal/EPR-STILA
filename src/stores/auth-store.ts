import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { authLogger } from '@/lib/logger'
import { UserProfile, UserRole } from '@/types/database'

interface AuthState {
  user: UserProfile | null
  isLoading: boolean
  initialized: boolean
  setUser: (user: UserProfile | null) => void
  setLoading: (loading: boolean) => void
  setInitialized: (initialized: boolean) => void
  initializeAuth: () => Promise<void>
  hasPermission: (requiredRoles: UserRole[]) => boolean
  isAdmin: () => boolean
}

// Get redirect path based on user role
export function getRedirectPath(role: string): string {
  switch (role) {
    case 'super_admin':
    case 'admin':
    case 'operations_admin':
      return '/dashboard'
    case 'sales_rep':
      return '/pos'
    case 'cashier':
      return '/pos'
    case 'finance_admin':
      return '/sales'
    default:
      return '/dashboard'
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  initialized: false,
  
  setUser: (user) => set({ user }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setInitialized: (initialized) => set({ initialized }),
  
  initializeAuth: async () => {
    const { setUser, setLoading, setInitialized } = get()
    
    try {
      setLoading(true)
      authLogger.login('system')
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        authLogger.failure('system', sessionError.message)
        setLoading(false)
        setInitialized(true)
        return
      }
      
      if (session?.user) {
        // Fetch user profile from database
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (profileError) {
          authLogger.failure(session.user.email || 'unknown', profileError.message)
          // Create a basic profile from auth data
          const basicProfile: UserProfile = {
            id: session.user.id,
            user_id: session.user.id,
            email: session.user.email || '',
            role: 'cashier' as UserRole,
            first_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Usuario',
            last_name: '',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
          setUser(basicProfile)
          authLogger.success(session.user.id)
        } else {
          setUser(profile as UserProfile)
          authLogger.success(session.user.id)
        }
      } else {
        authLogger.sessionExpired()
      }
      
    } catch (error) {
      authLogger.failure('system', String(error))
      console.error('Error initializing auth:', error)
    } finally {
      setLoading(false)
      setInitialized(true)
    }
  },
  
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

// Login function
export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      authLogger.failure(email, error.message)
      return { success: false, error: error.message }
    }
    
    if (data.user) {
      authLogger.success(data.user.id)
      // Trigger auth state update
      const { initializeAuth } = useAuthStore.getState()
      await initializeAuth()
      return { success: true }
    }
    
    return { success: false, error: 'Error desconocido' }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error de conexión'
    authLogger.failure(email, errorMessage)
    return { success: false, error: errorMessage }
  }
}

// Logout function
export async function logout(): Promise<void> {
  try {
    const { user } = useAuthStore.getState()
    if (user) {
      authLogger.logout(user.id)
    }
    
    await supabase.auth.signOut()
    useAuthStore.getState().setUser(null)
  } catch (error) {
    console.error('Error logging out:', error)
  }
}
