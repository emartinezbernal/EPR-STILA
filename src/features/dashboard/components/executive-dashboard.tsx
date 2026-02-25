'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useDashboardStore } from '../lib/store'
import { DashboardSkeleton } from './dashboard-skeletons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign, 
  TrendingUp, 
  Wrench, 
  Truck, 
  AlertTriangle, 
  ClipboardCheck,
  Users,
  Package,
  ChevronRight,
  Activity
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

// Format currency with MXN
const formatMXN = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// Format relative time
const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffMins < 60) return `hace ${diffMins} min`
  if (diffHours < 24) return `hace ${diffHours} hr`
  return `hace ${diffDays} días`
}

// Status badge colors
const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
    case 'delivered':
      return 'bg-green-500'
    case 'in_progress':
    case 'shipped':
      return 'bg-blue-500'
    case 'scheduled':
    case 'preparing':
      return 'bg-yellow-500'
    case 'on_hold':
    case 'pending':
      return 'bg-orange-500'
    default:
      return 'bg-gray-500'
  }
}

// Risk badge colors
const getRiskColor = (count: number, threshold: number) => {
  if (count >= threshold) return 'text-red-600 bg-red-50'
  if (count >= threshold * 0.7) return 'text-orange-600 bg-orange-50'
  return 'text-green-600 bg-green-50'
}

export function ExecutiveDashboard() {
  const { summary, isLoading, error, fetchSummary } = useDashboardStore()

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchSummary} className="mt-4">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { 
    todaySales, 
    ticketAverage, 
    todayServices, 
    goalProgress,
    todayInstallations,
    todayDeliveries,
    pendingToSchedule,
    salesAtRisk,
    lowStockItems,
    pendingApprovals,
    delayedOrders,
    topSellers,
    topProducts,
    activeCustomers,
    recentActivity
  } = summary

  const goalDifference = goalProgress.monthlyGoal - goalProgress.current

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Executive Command Center</h1>
          <p className="text-gray-500">Dashboard Ejecutivo - {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* ROW 1 - DINERO (Most dominant) */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          Resumen Financiero
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Ventas HOY - Principal - ENHANCED with larger size and yesterday comparison */}
          <Link href="/sales" className="group md:col-span-1 lg:col-span-1">
            <Card className="bg-gradient-to-br from-green-600 to-green-700 border-green-800 hover:shadow-xl transition-all cursor-pointer transform hover:scale-[1.02] h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-green-100">
                  Ventas HOY
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-white tabular-nums tracking-tight">
                  {formatMXN(todaySales.total)}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-sm text-green-200">
                    {todaySales.count} transacciones
                  </p>
                  <Badge className={`ml-auto text-xs ${goalProgress.yesterdayComparison >= 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {goalProgress.yesterdayComparison >= 0 ? '+' : ''}{goalProgress.yesterdayComparison}% vs ayer
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Ticket Promedio */}
          <Link href="/sales" className="group">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Ticket Promedio HOY
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 tabular-nums">
                  {formatMXN(ticketAverage)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  por transacción
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Ingresos por Servicios */}
          <Link href="/installations" className="group">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-purple-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Ingresos Servicios HOY
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 tabular-nums">
                  {formatMXN(todayServices.revenue)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {todayServices.installations} instalaciones + {todayServices.deliveries} entregas
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Meta vs Real - ENHANCED with stronger progress bar and warning */}
          <Link href="/sales" className="group">
            <Card className={`hover:shadow-lg transition-shadow cursor-pointer border-l-4 ${goalProgress.isOnTrack ? 'border-l-green-500' : 'border-l-red-500'}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Meta vs Real (Mes)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className={`text-3xl font-bold tabular-nums ${goalProgress.isOnTrack ? 'text-green-600' : 'text-red-600'}`}>
                    {goalProgress.percentage}%
                  </div>
                  {!goalProgress.isOnTrack && (
                    <Badge variant="destructive" className="text-xs">
                      ⚠️ Bajo meta
                    </Badge>
                  )}
                </div>
                <div className="mt-3">
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${goalProgress.isOnTrack ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'}`}
                      style={{ width: `${Math.min(goalProgress.percentage, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    Faltan: {formatMXN(goalDifference)}
                  </p>
                  <p className="text-xs font-medium text-gray-700">
                    Meta: {formatMXN(goalProgress.monthlyGoal)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* ROW 2 - OPERACIÓN DE HOY */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Instalaciones HOY */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Wrench className="h-5 w-5 text-blue-600" />
              Instalaciones HOY
              <Badge variant="outline" className="ml-auto bg-blue-50 text-blue-700">
                {todayInstallations.length}
              </Badge>
            </CardTitle>
            <Link href="/installations">
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                Ver todas <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {todayInstallations.slice(0, 5).map((inst) => (
                <div key={inst.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(inst.status)}`} />
                    <div>
                      <p className="text-sm font-medium">{inst.customerName}</p>
                      <p className="text-xs text-gray-500">{inst.scheduledTime} - {inst.address}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">
                    {inst.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Entregas HOY */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Truck className="h-5 w-5 text-purple-600" />
              Entregas HOY
              <Badge variant="outline" className="ml-auto bg-purple-50 text-purple-700">
                {todayDeliveries.length}
              </Badge>
            </CardTitle>
            <Link href="/shipping">
              <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-800">
                Ver todas <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {todayDeliveries.slice(0, 5).map((delivery) => (
                <div key={delivery.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(delivery.status)}`} />
                    <div>
                      <p className="text-sm font-medium">{delivery.customerName}</p>
                      <p className="text-xs text-gray-500">{delivery.saleNumber} - {delivery.address}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">
                    {delivery.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending to Schedule - PROMINENT */}
        <Card className={pendingToSchedule > 0 ? 'border-red-300 bg-red-50' : 'border-green-200'}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Pendientes de Agendar
              {pendingToSchedule > 0 && (
                <Badge variant="destructive" className="ml-auto">
                  {pendingToSchedule}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-center my-4">
              {pendingToSchedule}
            </div>
            <p className="text-xs text-center text-gray-500 mb-4">
              ventas sin instalación programada
            </p>
            <Link href="/installations">
              <Button className="w-full bg-red-600 hover:bg-red-700">
                <ChevronRight className="h-4 w-4 mr-2" />
                Revisar Pendientes
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* ROW 2.5 - SALES AT RISK */}
      {(salesAtRisk.salesWithoutInstallation > 0 || salesAtRisk.deliveriesWithoutDate > 0 || salesAtRisk.pendingQuotations > 0) && (
        <div className="grid gap-4 md:grid-cols-3">
          {/* Sales Without Installation */}
          <Card className="border-red-300 bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                Ventas sin Instalación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-700">{salesAtRisk.salesWithoutInstallation}</div>
              <p className="text-xs text-red-600 mt-1">ventas sin agendar</p>
              <Link href="/installations">
                <Button variant="outline" className="w-full mt-3 border-red-300 text-red-700 hover:bg-red-100">
                  Programar
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Deliveries Without Date */}
          <Card className="border-orange-300 bg-orange-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2 text-orange-700">
                <Truck className="h-5 w-5" />
                Entregas sin Fecha
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-700">{salesAtRisk.deliveriesWithoutDate}</div>
              <p className="text-xs text-orange-600 mt-1">entregas pendientes</p>
              <Link href="/shipping">
                <Button variant="outline" className="w-full mt-3 border-orange-300 text-orange-700 hover:bg-orange-100">
                  Asignar
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pending Quotations */}
          <Card className="border-yellow-300 bg-yellow-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2 text-yellow-700">
                <ClipboardCheck className="h-5 w-5" />
                Cotizaciones Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-700">{salesAtRisk.pendingQuotations}</div>
              <p className="text-xs text-yellow-600 mt-1">cotizaciones sin responder</p>
              <Link href="/sales">
                <Button variant="outline" className="w-full mt-3 border-yellow-300 text-yellow-700 hover:bg-yellow-100">
                  Revisar
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ROW 3 - RIESGOS */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Stock Bajo */}
        <Card className={lowStockItems.length > 0 ? 'border-red-200' : ''}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Package className="h-5 w-5 text-red-600" />
              Stock Bajo/Crítico
            </CardTitle>
            <Link href="/inventory">
              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getRiskColor(lowStockItems.length, 10)}`}>
              {lowStockItems.length}
            </div>
            <div className="mt-3 space-y-2">
              {lowStockItems.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{item.name}</span>
                  <Badge variant="destructive" className="text-xs">
                    {item.currentStock}/{item.minimumStock}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Aprobaciones Pendientes */}
        <Card className={pendingApprovals.length > 0 ? 'border-yellow-200' : ''}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-yellow-600" />
              Aprobaciones Pendientes
            </CardTitle>
            <Link href="/approvals">
              <Button variant="ghost" size="sm" className="text-yellow-600 hover:text-yellow-800">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${pendingApprovals.length > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
              {pendingApprovals.length}
            </div>
            <div className="mt-3 space-y-2">
              {pendingApprovals.slice(0, 3).map((approval) => (
                <div key={approval.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{approval.type}</span>
                  <span className="text-xs text-gray-500">{approval.requestedBy}</span>
                </div>
              ))}
              {pendingApprovals.length === 0 && (
                <p className="text-xs text-gray-500">Sin aprobaciones pendientes</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Órdenes Retrasadas */}
        <Card className={delayedOrders.length > 0 ? 'border-orange-200' : ''}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Órdenes Retrasadas
            </CardTitle>
            <Link href="/installations">
              <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-800">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${delayedOrders.length > 0 ? 'text-orange-600' : 'text-green-600'}`}>
              {delayedOrders.length}
            </div>
            <div className="mt-3 space-y-2">
              {delayedOrders.slice(0, 3).map((order) => (
                <div key={order.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{order.saleNumber}</span>
                  <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                    +{order.delayDays} días
                  </Badge>
                </div>
              ))}
              {delayedOrders.length === 0 && (
                <p className="text-xs text-gray-500">Sin órdenes retrasadas</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROW 4 - COMERCIAL */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Top Vendedor */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Top Vendedor (Mes)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topSellers.map((seller, index) => (
                <div key={seller.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                      index === 1 ? 'bg-gray-100 text-gray-700' : 
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium">{seller.name}</span>
                  </div>
                  <span className="text-sm tabular-nums">{formatMXN(seller.sales)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Productos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-600" />
              Top Productos (Mes)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium truncate max-w-[150px]">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.quantity} unidades</p>
                  </div>
                  <span className="text-sm tabular-nums">{formatMXN(product.revenue)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Clientes Activos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Clientes Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeCustomers.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium truncate max-w-[150px]">{customer.name}</p>
                    <p className="text-xs text-gray-500">{customer.totalOrders} pedidos totales</p>
                  </div>
                  <span className="text-xs text-gray-500">{formatRelativeTime(customer.lastOrderDate)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROW 5 - ACTIVIDAD */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Activity className="h-5 w-5 text-gray-600" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.color === 'green' ? 'bg-green-500' :
                  activity.color === 'blue' ? 'bg-blue-500' :
                  activity.color === 'purple' ? 'bg-purple-500' :
                  activity.color === 'yellow' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm">{activity.message}</p>
                </div>
                <span className="text-xs text-gray-500">{formatRelativeTime(activity.timestamp)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
