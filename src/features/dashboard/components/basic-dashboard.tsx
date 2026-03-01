'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/auth-store'
import { 
  Wrench, 
  ShoppingCart, 
  Truck, 
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign
} from 'lucide-react'

interface DashboardData {
  todaySales: number
  todaySalesCount: number
  pendingInstallations: number
  myInstallations: Array<{
    id: string
    customerName: string
    address: string
    scheduledTime: string
    status: string
  }>
}

export function BasicDashboard() {
  const { user } = useAuthStore()
  const [data, setData] = useState<DashboardData>({
    todaySales: 0,
    todaySalesCount: 0,
    pendingInstallations: 0,
    myInstallations: []
  })
  const [isLoading, setIsLoading] = useState(true)

  const isInstaller = user?.role === 'installer'
  const isSalesUser = user?.role === 'sales_user'

  useEffect(() => {
    // Simulate loading data
    setIsLoading(false)
    // In production, this would fetch from API based on user role
  }, [user])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Buenos días'
    if (hour < 18) return 'Buenas tardes'
    return 'Buenas noches'
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      installer: 'Instalador',
      sales_user: 'Vendedor'
    }
    return labels[role] || role
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getGreeting()}, {user?.first_name} {user?.last_name}
          </h1>
          <p className="text-gray-500">{getRoleLabel(user?.role || '')} - {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {isSalesUser && (
          <>
            <Card className="bg-gradient-to-br from-green-600 to-green-700 border-green-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-green-100 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Ventas Hoy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  ${data.todaySales.toLocaleString('es-MX')}
                </div>
                <p className="text-xs text-green-200 mt-1">
                  {data.todaySalesCount} transacciones
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Tickets Hoy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {data.todaySalesCount}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Transacciones completadas
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {isInstaller && (
          <>
            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-blue-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-blue-100 flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  Mis Instalaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {data.myInstallations.length}
                </div>
                <p className="text-xs text-blue-200 mt-1">
                  Pendientes hoy
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Entregas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">0</div>
                <p className="text-xs text-gray-500 mt-1">
                  Programadas
                </p>
              </CardContent>
            </Card>
          </>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {data.pendingInstallations}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Sin agendar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* My Tasks Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            {isInstaller ? <Wrench className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
            {isInstaller ? 'Mis Instalaciones del Día' : 'Resumen de Ventas'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.myInstallations.length > 0 ? (
            <div className="space-y-3">
              {data.myInstallations.map((inst) => (
                <div key={inst.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      inst.status === 'completed' ? 'bg-green-500' :
                      inst.status === 'in_progress' ? 'bg-blue-500' :
                      'bg-yellow-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium">{inst.customerName}</p>
                      <p className="text-xs text-gray-500">{inst.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{inst.scheduledTime}</span>
                    <Badge variant="outline" className="text-xs capitalize">
                      {inst.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              {isInstaller ? (
                <Wrench className="mx-auto h-12 w-12 text-gray-300" />
              ) : (
                <ShoppingCart className="mx-auto h-12 w-12 text-gray-300" />
              )}
              <p className="mt-2 text-gray-500">
                {isInstaller 
                  ? 'No tienes instalaciones asignadas para hoy' 
                  : 'No hay ventas registradas hoy'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        {isSalesUser && (
          <a href="/pos" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-green-50 border-green-200">
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <ShoppingCart className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-green-900">Ir al POS</p>
                  <p className="text-sm text-green-700">Registrar nueva venta</p>
                </div>
              </CardContent>
            </Card>
          </a>
        )}

        {isInstaller && (
          <a href="/installations" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-blue-50 border-blue-200">
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Wrench className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-blue-900">Ver Mis Instalaciones</p>
                  <p className="text-sm text-blue-700">Administrar asignaciones</p>
                </div>
              </CardContent>
            </Card>
          </a>
        )}

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-gray-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Ayuda</p>
              <p className="text-sm text-gray-500">Guía rápida del sistema</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
