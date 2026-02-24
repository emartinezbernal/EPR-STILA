'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  Search, 
  Plus, 
  FileText,
  Eye,
  Edit,
  Trash2,
  Check,
  Package,
  Truck,
  Loader2,
  Printer
} from 'lucide-react'
import { formatCurrency, formatDate, exportToExcel } from '@/lib/utils'
import { useSalesStore } from '@/stores/sales-store'
import { SaleStatus } from '@/types/database'

const statusColors: Record<SaleStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  confirmed: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-orange-100 text-orange-800',
}

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  partial: 'bg-orange-100 text-orange-800',
  paid: 'bg-green-100 text-green-800',
  refunded: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
}

export default function SalesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { sales, updateSale, deleteSale, fetchSales, isLoading } = useSalesStore()
  
  useEffect(() => {
    fetchSales()
  }, [fetchSales])

  const filteredSales = sales.filter((sale) => {
    const matchesSearch = sale.sale_number.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || sale.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleStatusChange = (saleId: string, newStatus: SaleStatus) => {
    updateSale(saleId, { 
      status: newStatus,
      ...(newStatus === 'completed' ? { completed_at: new Date().toISOString() } : {}),
      ...(newStatus === 'shipped' ? { shipped_at: new Date().toISOString() } : {}),
      ...(newStatus === 'delivered' ? { delivered_at: new Date().toISOString() } : {}),
    })
  }

  const handleDelete = (saleId: string) => {
    if (confirm('Are you sure you want to delete this sale?')) {
      deleteSale(saleId)
    }
  }

  const handlePrintTicket = (sale: typeof sales[0]) => {
    const params = new URLSearchParams({
      saleId: sale.id,
      saleNumber: sale.sale_number,
      total: sale.total.toString(),
      paymentMethod: sale.payment_method || 'EFECTIVO',
      amountReceived: sale.amount_paid.toString(),
      change: sale.change_given.toString(),
    })
    const ticketUrl = `/api/pos/ticket?${params.toString()}`
    window.open(ticketUrl, '_blank', 'width=400,height=600')
  }

  const handleExportSales = () => {
    const exportData = filteredSales.map(sale => ({
      'Folio': sale.sale_number,
      'Fecha': formatDate(sale.sale_date),
      'Cliente': `Cliente #${sale.customer_id}`,
      'Estado': sale.status,
      'Estado de Pago': sale.payment_status,
      'Total': sale.total,
      'Método de Pago': sale.payment_method,
    }))
    exportToExcel(exportData, 'ventas')
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales</h1>
          <p className="text-gray-500">Manage sales orders ({sales.length} total)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportSales}>
            <FileText className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
          <Button onClick={() => window.location.href = '/pos'}>
            <Plus className="mr-2 h-4 w-4" />
            New Sale
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search sales..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-3 py-2 border rounded-md"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="confirmed">Confirmed</option>
          <option value="paid">Paid</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Cargando ventas desde Supabase...</span>
        </div>
      )}

      {!isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Sales Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Sale #</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Customer</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Payment</th>
                    <th className="text-right py-3 px-4 font-medium">Total</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{sale.sale_number}</td>
                      <td className="py-3 px-4 text-gray-600">{formatDate(sale.sale_date)}</td>
                      <td className="py-3 px-4">Customer #{sale.customer_id}</td>
                      <td className="py-3 px-4">
                        <select
                          value={sale.status}
                          onChange={(e) => handleStatusChange(sale.id, e.target.value as SaleStatus)}
                          className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statusColors[sale.status]}`}
                        >
                          <option value="draft">Draft</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="paid">Paid</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${paymentStatusColors[sale.payment_status]}`}>
                          {sale.payment_status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatCurrency(sale.total)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" title="View">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Edit">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Print Ticket"
                            onClick={() => handlePrintTicket(sale)}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          {sale.status === 'paid' && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title="Ship"
                              onClick={() => handleStatusChange(sale.id, 'shipped')}
                            >
                              <Truck className="h-4 w-4" />
                            </Button>
                          )}
                          {sale.status === 'shipped' && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title="Deliver"
                              onClick={() => handleStatusChange(sale.id, 'delivered')}
                            >
                              <Package className="h-4 w-4" />
                            </Button>
                          )}
                          {sale.status === 'delivered' && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title="Complete"
                              onClick={() => handleStatusChange(sale.id, 'completed')}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500"
                            title="Delete"
                            onClick={() => handleDelete(sale.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredSales.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No sales found
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
