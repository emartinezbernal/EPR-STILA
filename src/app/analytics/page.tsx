'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Users, DollarSign, ShoppingCart, BarChart3, PieChart, LineChart } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
  Legend
} from 'recharts'

interface SalesData {
  month: string
  sales: number
}

interface CategoryData {
  name: string
  value: number
}

interface TrendData {
  date: string
  sales: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalCustomers, setTotalCustomers] = useState(0)
  const [totalOrders, setTotalOrders] = useState(0)
  const [conversionRate, setConversionRate] = useState(0)
  const [salesByMonth, setSalesByMonth] = useState<SalesData[]>([])
  const [salesByCategory, setSalesByCategory] = useState<CategoryData[]>([])
  const [salesTrend, setSalesTrend] = useState<TrendData[]>([])

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)

      // Fetch total revenue from completed sales
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('total, sale_date, status')
        .in('status', ['completed', 'delivered', 'paid', 'shipped'])

      if (salesError) throw salesError

      // Calculate total revenue
      const revenue = salesData?.reduce((sum, sale) => sum + (sale.total || 0), 0) || 0
      setTotalRevenue(revenue)
      setTotalOrders(salesData?.length || 0)

      // Fetch total customers
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('id', { count: 'exact' })

      if (customersError) throw customersError
      setTotalCustomers(customersData?.length || 0)

      // Calculate conversion rate (completed vs total)
      const { data: allSales } = await supabase
        .from('sales')
        .select('status')

      if (allSales && allSales.length > 0) {
        const completed = allSales.filter(s => 
          ['completed', 'delivered'].includes(s.status)
        ).length
        setConversionRate((completed / allSales.length) * 100)
      }

      // Fetch sales by month (last 6 months)
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

      const { data: monthlySales } = await supabase
        .from('sales')
        .select('total, sale_date')
        .gte('sale_date', sixMonthsAgo.toISOString())
        .in('status', ['completed', 'delivered', 'paid', 'shipped'])

      if (monthlySales) {
        // Group by month
        const monthlyMap = new Map<string, number>()
        monthlySales.forEach(sale => {
          const date = new Date(sale.sale_date)
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          const monthName = date.toLocaleDateString('es-MX', { month: 'short' })
          const key = `${monthName} ${date.getFullYear()}`
          monthlyMap.set(key, (monthlyMap.get(key) || 0) + (sale.total || 0))
        })

        const monthlyData: SalesData[] = Array.from(monthlyMap.entries()).map(([month, sales]) => ({
          month,
          sales: Math.round(sales)
        })).sort((a, b) => {
          const dateA = new Date(a.month.split(' ')[1] + '-' + a.month.split(' ')[0])
          const dateB = new Date(b.month.split(' ')[1] + '-' + b.month.split(' ')[0])
          return dateA.getTime() - dateB.getTime()
        })

        setSalesByMonth(monthlyData)
      }

      // Fetch sales by category - simplified approach
      const { data: saleItems } = await supabase
        .from('sale_items')
        .select('id, quantity, subtotal, product_id')

      const { data: productsData } = await supabase
        .from('products')
        .select('id, category_id')

      const { data: categories } = await supabase
        .from('product_categories')
        .select('id, name')

      if (saleItems && productsData && categories) {
        const categoryMap = new Map<string, number>()
        
        saleItems.forEach(item => {
          const product = productsData.find(p => p.id === item.product_id)
          const category = categories.find(c => c.id === product?.category_id)
          const categoryName = category?.name || 'Sin categoría'
          categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + (item.subtotal || 0))
        })

        const categoryData: CategoryData[] = Array.from(categoryMap.entries()).map(([name, value]) => ({
          name,
          value: Math.round(value)
        }))

        setSalesByCategory(categoryData)
      }

      // Fetch daily sales trend (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: dailySales } = await supabase
        .from('sales')
        .select('total, sale_date')
        .gte('sale_date', thirtyDaysAgo.toISOString())
        .in('status', ['completed', 'delivered', 'paid', 'shipped'])

      if (dailySales) {
        const dailyMap = new Map<string, number>()
        dailySales.forEach(sale => {
          const date = new Date(sale.sale_date).toLocaleDateString('es-MX')
          dailyMap.set(date, (dailyMap.get(date) || 0) + (sale.total || 0))
        })

        const trendData: TrendData[] = Array.from(dailyMap.entries()).map(([date, sales]) => ({
          date,
          sales: Math.round(sales)
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        setSalesTrend(trendData)
      }

    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando datos de analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500">Analisis y metricas detalladas del negocio</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">+12.5% del mes anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">+15 este mes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">+8.2% del mes anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">+2.1% del mes anterior</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Ventas por Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {salesByMonth.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                    />
                    <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No hay datos disponibles
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="mr-2 h-5 w-5" />
              Distribucion por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {salesByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={salesByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {salesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No hay datos disponibles
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <LineChart className="mr-2 h-5 w-5" />
            Tendencias de Ventas (Ultimos 30 dias)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {salesTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={false}
                    name="Ventas"
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No hay datos disponibles
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
