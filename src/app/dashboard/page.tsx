'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ShoppingCart, 
  Users, 
  Package, 
  AlertTriangle,
  DollarSign,
  ClipboardCheck,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'

interface DashboardStats {
  totalSales: number
  totalCustomers: number
  totalProducts: number
  pendingOrders: number
  lowStockItems: number
  pendingApprovals: number
  salesGrowth: number
  revenueGrowth: number
}

// Mock stats for demo/offline mode - always use these
const mockStats: DashboardStats = {
  totalSales: 1250000,
  totalCustomers: 250,
  totalProducts: 150,
  pendingOrders: 12,
  lowStockItems: 8,
  pendingApprovals: 5,
  salesGrowth: 12.5,
  revenueGrowth: 8.3,
}

// Sales data for the chart (last 7 days)
const salesData = [
  { name: 'Lun', sales: 18500 },
  { name: 'Mar', sales: 22300 },
  { name: 'Mié', sales: 19800 },
  { name: 'Jue', sales: 24500 },
  { name: 'Vie', sales: 28900 },
  { name: 'Sáb', sales: 31200 },
  { name: 'Dom', sales: 15800 },
]

// Monthly sales data
const monthlyData = [
  { name: 'Ene', sales: 185000 },
  { name: 'Feb', sales: 223000 },
  { name: 'Mar', sales: 198000 },
  { name: 'Abr', sales: 245000 },
  { name: 'May', sales: 289000 },
  { name: 'Jun', sales: 312000 },
]

export default function DashboardPage() {
  const [stats] = useState<DashboardStats>(mockStats)
  const [chartData, setChartData] = useState(salesData)
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week')

  // Toggle chart data based on time range
  useEffect(() => {
    if (timeRange === 'week') {
      setChartData(salesData)
    } else {
      setChartData(monthlyData)
    }
  }, [timeRange])

  const statCards = [
    {
      title: 'Ventas Totales',
      value: formatCurrency(stats.totalSales),
      growth: `+${stats.salesGrowth}%`,
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Clientes',
      value: stats.totalCustomers.toString(),
      growth: '',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Productos',
      value: stats.totalProducts.toString(),
      growth: '',
      icon: Package,
      color: 'bg-purple-500',
    },
    {
      title: 'Pedidos Pendientes',
      value: stats.pendingOrders.toString(),
      growth: '',
      icon: ShoppingCart,
      color: 'bg-orange-500',
    },
    {
      title: 'Stock Bajo',
      value: stats.lowStockItems.toString(),
      growth: '',
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
    {
      title: 'Aprobaciones',
      value: stats.pendingApprovals.toString(),
      growth: '',
      icon: ClipboardCheck,
      color: 'bg-yellow-500',
    },
  ]

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Bienvenido a ERP STILA</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Crecimiento de Ingresos:</span>
          <span className="text-sm font-medium text-green-600">+{stats.revenueGrowth}%</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.growth && (
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{stat.growth}</span> desde el mes pasado
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Resumen de Ventas</CardTitle>
            <div className="flex gap-2">
              <button
                onClick={() => setTimeRange('week')}
                className={`px-3 py-1 text-xs rounded-md ${
                  timeRange === 'week' 
                    ? 'bg-slate-800 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setTimeRange('month')}
                className={`px-3 py-1 text-xs rounded-md ${
                  timeRange === 'month' 
                    ? 'bg-slate-800 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Mes
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis 
                    dataKey={timeRange === 'week' ? 'day' : 'month'} 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Ventas']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorSales)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Nueva venta registrada</p>
                  <p className="text-xs text-muted-foreground">Hace 2 horas</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-blue-500 mr-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Cliente nuevo registrado</p>
                  <p className="text-xs text-muted-foreground">Hace 5 horas</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Aprobación requerida</p>
                  <p className="text-xs text-muted-foreground">Hace 1 día</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-red-500 mr-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Stock bajo en producto</p>
                  <p className="text-xs text-muted-foreground">Hace 2 días</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
