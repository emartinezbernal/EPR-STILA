'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  FileSpreadsheet, 
  FileText, 
  BarChart3,
  PieChart,
  TrendingUp,
  Loader2
} from 'lucide-react'
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
  Legend
} from 'recharts'
import { useSalesStore } from '@/stores/sales-store'
import { useProductStore } from '@/stores/product-store'
import { useCustomerStore } from '@/stores/customer-store'
import { formatCurrency, formatDate, exportToExcel } from '@/lib/utils'
import { 
  generatePDFReport,
  getSalesSummaryPDF,
  getSalesByCustomerPDF,
  getInventoryStatusPDF,
  getLowStockPDF,
  getInventoryValuationPDF,
  getCommissionReportPDF,
  getAccountsReceivablePDF,
  getProfitLossPDF
} from '@/lib/pdfGenerator'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export default function ReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [generatingReport, setGeneratingReport] = useState<string | null>(null)

  const { sales, fetchSales, isLoading: salesLoading } = useSalesStore()
  const { products, fetchProducts, isLoading: productsLoading } = useProductStore()
  const { customers, fetchCustomers, isLoading: customersLoading } = useCustomerStore()

  useEffect(() => {
    fetchSales()
    fetchProducts()
    fetchCustomers()
  }, [fetchSales, fetchProducts, fetchCustomers])

  const isLoading = salesLoading || productsLoading || customersLoading

  const totalSales = sales.length
  const totalRevenue = sales.reduce((sum, s) => sum + (s.total || 0), 0)
  const totalProducts = products.length
  const totalCustomers = customers.length

  // Chart data
  const salesChartData = sales.slice(0, 10).map(s => ({
    name: s.sale_number?.slice(-5) || 'N/A',
    ventas: s.total || 0,
  }))

  const paymentMethodData = sales.reduce((acc: {name: string, value: number}[], s) => {
    const method = s.payment_method || 'Efectivo'
    const existing = acc.find(item => item.name === method)
    if (existing) {
      existing.value += s.total || 0
    } else {
      acc.push({ name: method, value: s.total || 0 })
    }
    return acc
  }, [])

  const inventoryChartData = products.slice(0, 8).map(p => ({
    name: p.name?.substring(0, 15) || 'Producto',
    stock: p.stock || 0,
  }))

  const handleExportExcel = (reportName: string) => {
    setGeneratingReport(reportName)
    
    setTimeout(() => {
      setGeneratingReport(null)
      
      let exportData: { [key: string]: string | number }[] = []
      let filename = ''
      
      switch(reportName) {
        case 'Sales Summary':
          exportData = sales.map(s => ({
            'Folio': s.sale_number || '',
            'Fecha': formatDate(s.sale_date),
            'Estado': s.status || '',
            'Estado de Pago': s.payment_status || '',
            'Total': s.total || 0,
            'Método de Pago': s.payment_method || 'Efectivo',
          }))
          filename = 'resumen_ventas'
          break
        case 'Sales by Customer':
          exportData = sales.map(s => ({
            'ID Cliente': s.customer_id || '',
            'Folio Venta': s.sale_number || '',
            'Fecha': formatDate(s.sale_date),
            'Total': s.total || 0,
            'Estado': s.status || '',
          }))
          filename = 'ventas_por_cliente'
          break
        case 'Inventory Status':
          exportData = products.map(p => ({
            'SKU': p.sku || '',
            'Producto': p.name || '',
            'Stock': p.stock || 0,
            'Precio': p.base_price || 0,
            'Costo': p.cost_price || 0,
            'Valor Total': (p.stock || 0) * (p.cost_price || 0),
          }))
          filename = 'estado_inventario'
          break
        case 'Low Stock Report':
          exportData = products.filter(p => (p.stock || 0) < 10).map(p => ({
            'SKU': p.sku || '',
            'Producto': p.name || '',
            'Stock Actual': p.stock || 0,
            'Stock Mínimo': 10,
            'Precio': p.base_price || 0,
          }))
          filename = 'stock_bajo'
          break
        case 'Inventory Valuation':
          exportData = products.map(p => ({
            'Producto': p.name || '',
            'Categoría': p.category_id || '',
            'Stock': p.stock || 0,
            'Costo Unitario': p.cost_price || 0,
            'Valor Total': (p.stock || 0) * (p.cost_price || 0),
          }))
          filename = 'valoracion_inventario'
          break
        case 'Commission Report':
          exportData = sales.filter(s => s.status === 'completed').map(s => ({
            'Folio': s.sale_number || '',
            'Fecha': formatDate(s.sale_date),
            'Venta Total': s.total || 0,
            'Comisión (5%)': (s.total || 0) * 0.05,
          }))
          filename = 'reporte_comisiones'
          break
        case 'Accounts Receivable':
          exportData = sales.filter(s => s.payment_status === 'pending').map(s => ({
            'Folio': s.sale_number || '',
            'Cliente': `Cliente #${s.customer_id || ''}`,
            'Fecha': formatDate(s.sale_date),
            'Total': s.total || 0,
            'Estado': s.payment_status || '',
          }))
          filename = 'cuentas_por_cobrar'
          break
        default:
          exportData = []
      }
      
      if (exportData.length > 0) {
        exportToExcel(exportData, filename)
      } else {
        alert('No hay datos para exportar en este reporte')
      }
    }, 500)
  }

  const handleExportPDF = (reportName: string) => {
    setGeneratingReport(reportName)
    
    setTimeout(() => {
      setGeneratingReport(null)
      
      let reportData: any = null
      
      switch(reportName) {
        case 'Sales Summary':
          reportData = getSalesSummaryPDF(sales)
          break
        case 'Sales by Customer':
          reportData = getSalesByCustomerPDF(sales)
          break
        case 'Inventory Status':
          reportData = getInventoryStatusPDF(products)
          break
        case 'Low Stock Report':
          reportData = getLowStockPDF(products)
          break
        case 'Inventory Valuation':
          reportData = getInventoryValuationPDF(products)
          break
        case 'Commission Report':
          reportData = getCommissionReportPDF(sales)
          break
        case 'Commission Summary':
          reportData = getCommissionReportPDF(sales)
          break
        case 'Accounts Receivable':
          reportData = getAccountsReceivablePDF(sales)
          break
        case 'Profit & Loss':
          reportData = getProfitLossPDF(sales, products)
          break
      }
      
      if (reportData) {
        generatePDFReport(reportData)
      } else {
        alert('Reporte no disponible para PDF')
      }
    }, 500)
  }

  const reports = [
    { id: '1', name: 'Sales Summary', description: 'Daily, weekly, monthly sales breakdown', category: 'Sales' },
    { id: '2', name: 'Sales by Product', description: 'Product-wise sales analysis', category: 'Sales' },
    { id: '3', name: 'Sales by Customer', description: 'Customer purchase history', category: 'Sales' },
    { id: '4', name: 'Inventory Status', description: 'Current stock levels', category: 'Inventory' },
    { id: '5', name: 'Low Stock Report', description: 'Items below minimum threshold', category: 'Inventory' },
    { id: '6', name: 'Inventory Valuation', description: 'Stock value by warehouse', category: 'Inventory' },
    { id: '7', name: 'Commission Report', description: 'Seller commission breakdown', category: 'Commissions' },
    { id: '8', name: 'Commission Summary', description: 'Monthly commission totals', category: 'Commissions' },
    { id: '9', name: 'Accounts Receivable', description: 'Outstanding customer payments', category: 'Finance' },
    { id: '10', name: 'Profit & Loss', description: 'Income statement', category: 'Finance' },
  ]

  const categories = ['All', 'Sales', 'Inventory', 'Commissions', 'Finance']

  const filteredReports = reports.filter(r => {
    const matchesCategory = selectedCategory === 'All' || r.category === selectedCategory
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Reports Center</h1>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8 mb-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Cargando datos desde Supabase...</span>
        </div>
      )}

      {!isLoading && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Sales</p>
                    <p className="text-2xl font-bold">{totalSales}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <PieChart className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Products</p>
                    <p className="text-2xl font-bold">{totalProducts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <FileText className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Customers</p>
                    <p className="text-2xl font-bold">{totalCustomers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Sales Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ventas Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Bar dataKey="ventas" fill="#0088FE" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Métodos de Pago</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={paymentMethodData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry: {name: string}) => entry.name}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {paymentMethodData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Inventory Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Inventario por Producto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={inventoryChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={100} />
                      <Tooltip />
                      <Bar dataKey="stock" fill="#00C49F" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map(report => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{report.name}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                    </div>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {report.category}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1"
                      onClick={() => handleExportExcel(report.name)}
                      disabled={generatingReport === report.name}
                    >
                      {generatingReport === report.name ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                      )}
                      Excel
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleExportPDF(report.name)}
                      disabled={generatingReport === report.name}
                    >
                      {generatingReport === report.name ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <FileText className="mr-2 h-4 w-4" />
                      )}
                      PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredReports.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No reports found matching your criteria.</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
