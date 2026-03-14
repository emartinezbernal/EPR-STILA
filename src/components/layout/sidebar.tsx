'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuthStore, logout } from '@/stores/auth-store'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  FileText,
  TrendingUp,
  Settings,
  Truck,
  Wrench,
  DollarSign,
  AlertTriangle,
  ClipboardCheck,
  BookOpen,
  BarChart3,
  Building2,
  ScrollText,
  LogOut,
  User,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['super_admin', 'admin', 'sales_manager', 'sales_user', 'viewer'] },
  { name: 'Catalog', href: '/catalog', icon: Package, roles: ['super_admin', 'admin', 'sales_manager', 'sales_user', 'viewer'] },
  { name: 'POS', href: '/pos', icon: ShoppingCart, roles: ['super_admin', 'admin', 'sales_manager', 'sales_user'] },
  { name: 'Sales', href: '/sales', icon: FileText, roles: ['super_admin', 'admin', 'sales_manager', 'sales_user'] },
  { name: 'Customers', href: '/customers', icon: Users, roles: ['super_admin', 'admin', 'sales_manager', 'sales_user'] },
  { name: 'Inventory', href: '/inventory', icon: Package, roles: ['super_admin', 'admin', 'warehouse_admin', 'sales_manager'] },
  { name: 'Shipping', href: '/shipping', icon: Truck, roles: ['super_admin', 'admin', 'operations_admin', 'sales_manager'] },
  { name: 'Installations', href: '/installations', icon: Wrench, roles: ['super_admin', 'admin', 'operations_admin', 'installer', 'sales_manager'] },
  { name: 'Commissions', href: '/commissions', icon: DollarSign, roles: ['super_admin', 'admin', 'finance_admin', 'sales_manager'] },
  { name: 'Reports', href: '/reports', icon: BarChart3, roles: ['super_admin', 'admin', 'sales_manager', 'finance_admin'] },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp, roles: ['super_admin', 'admin', 'sales_manager'] },
  { name: 'Approvals', href: '/approvals', icon: ClipboardCheck, roles: ['super_admin', 'admin', 'finance_admin', 'operations_admin'] },
  { name: 'Audit', href: '/audit', icon: BookOpen, roles: ['super_admin', 'admin', 'finance_admin'] },
  { name: 'Alerts', href: '/alerts', icon: AlertTriangle, roles: ['super_admin', 'admin', 'sales_manager', 'operations_admin', 'warehouse_admin'] },
  { name: 'Branches', href: '/branches', icon: Building2, roles: ['super_admin', 'admin'] },
  { name: 'Logs', href: '/logs', icon: ScrollText, roles: ['super_admin', 'admin'] },
  { name: 'Settings', href: '/settings', icon: Settings, roles: ['super_admin', 'admin'] },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuthStore()

  // Show all navigation items when no user is authenticated (for demo/development)
  // In production, you would filter based on user roles
  const filteredNavigation = user 
    ? navigation.filter(item => item.roles.includes(user.role))
    : navigation

  // Get display name and role
  const displayName = user ? `${user.first_name} ${user.last_name}`.trim() : 'Usuario'
  const displayRole = user?.role ? user.role.replace('_', ' ').toUpperCase() : 'SIN ROL'
  const userId = user?.id || 'N/A'

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">ERP STILA</h1>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {filteredNavigation.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      
      {/* User Info Section */}
      {user && (
        <div className="border-t border-gray-800 p-4">
          <div className="rounded-lg bg-gray-800 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-white" title={displayName}>
                  {displayName}
                </p>
                <p className="truncate text-xs text-gray-400" title={userId}>
                  ID: {userId.substring(0, 8)}...
                </p>
              </div>
            </div>
            <div className="mt-3">
              <span className="inline-block rounded-full bg-blue-900 px-2 py-1 text-xs font-medium text-blue-200">
                {displayRole}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 flex w-full items-center justify-center rounded-md bg-gray-700 px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
