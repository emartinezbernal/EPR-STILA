'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  DollarSign, 
  TrendingUp, 
  User, 
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Filter,
  Download,
  Eye,
  Loader2
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

interface Commission {
  id: string
  sale_number: string
  seller_name: string
  sale_amount: number
  commission_rate: number
  commission_amount: number
  status: 'calculated' | 'approved' | 'paid' | 'cancelled' | 'adjusted'
  period: string
  paid_at: string | null
  payment_reference: string | null
}

// Fallback mock data for demo/offline mode
const mockCommissions: Commission[] = [
  {
    id: '1',
    sale_number: 'SALE-20240115-000001',
    seller_name: 'Luis Garcia',
    sale_amount: 25000,
    commission_rate: 0.03,
    commission_amount: 750,
    status: 'paid',
    period: 'January 2024',
    paid_at: '2024-01-20',
    payment_reference: 'PAGO-00123'
  },
  {
    id: '2',
    sale_number: 'SALE-20240116-000002',
    seller_name: 'Carmen Lopez',
    sale_amount: 45000,
    commission_rate: 0.03,
    commission_amount: 1350,
    status: 'approved',
    period: 'January 2024',
    paid_at: null,
    payment_reference: null
  },
  {
    id: '3',
    sale_number: 'SALE-20240117-000003',
    seller_name: 'Pedro Martinez',
    sale_amount: 18000,
    commission_rate: 0.04,
    commission_amount: 720,
    status: 'calculated',
    period: 'January 2024',
    paid_at: null,
    payment_reference: null
  },
  {
    id: '4',
    sale_number: 'SALE-20240118-000004',
    seller_name: 'Laura Rodriguez',
    sale_amount: 62000,
    commission_rate: 0.03,
    commission_amount: 1860,
    status: 'paid',
    period: 'January 2024',
    paid_at: '2024-01-22',
    payment_reference: 'PAGO-00124'
  },
  {
    id: '5',
    sale_number: 'SALE-20240110-000005',
    seller_name: 'Diego Hernandez',
    sale_amount: 15000,
    commission_rate: 0.03,
    commission_amount: 450,
    status: 'adjusted',
    period: 'December 2023',
    paid_at: null,
    payment_reference: null
  }
]

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCommissions() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('commissions')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) {
          console.error('Error fetching commissions from Supabase:', error)
          setCommissions(mockCommissions)
        } else if (data && data.length > 0) {
          // Map the data to match our interface
          const mappedData = data.map((c: any) => ({
            id: c.id,
            sale_number: c.sale?.sale_number || `SALE-${c.id}`,
            seller_name: c.seller?.first_name + ' ' + c.seller?.last_name || 'Unknown',
            sale_amount: c.sale_amount,
            commission_rate: c.commission_rate,
            commission_amount: c.commission_amount,
            status: c.status,
            period: new Date(c.created_at).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }),
            paid_at: c.paid_at,
            payment_reference: c.payment_reference
          }))
          setCommissions(mappedData)
        } else {
          console.log('No commissions found in Supabase, using demo data')
          setCommissions(mockCommissions)
        }
      } catch (err) {
        console.error('Exception fetching commissions:', err)
        setCommissions(mockCommissions)
      } finally {
        setLoading(false)
      }
    }

    fetchCommissions()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-50'
      case 'approved': return 'text-blue-600 bg-blue-50'
      case 'calculated': return 'text-yellow-600 bg-yellow-50'
      case 'adjusted': return 'text-orange-600 bg-orange-50'
      case 'cancelled': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />
      case 'approved': return <CheckCircle className="h-4 w-4" />
      case 'calculated': return <Clock className="h-4 w-4" />
      case 'adjusted': return <TrendingUp className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      default: return <DollarSign className="h-4 w-4" />
    }
  }

  const filteredCommissions = commissions.filter(c => {
    const matchesSearch = 
      c.sale_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.seller_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.period?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: commissions.reduce((sum, c) => sum + c.commission_amount, 0),
    pending: commissions.filter(c => c.status === 'calculated').reduce((sum, c) => sum + c.commission_amount, 0),
    approved: commissions.filter(c => c.status === 'approved').reduce((sum, c) => sum + c.commission_amount, 0),
    paid: commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.commission_amount, 0)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Commission Management</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center justify-center py-8 mb-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Cargando comisiones desde Supabase...</span>
        </div>
      )}

      {!loading && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Commissions</p>
                    <p className="text-2xl font-bold">{formatCurrency(stats.total)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Pending</p>
                    <p className="text-2xl font-bold">{formatCurrency(stats.pending)}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Approved</p>
                    <p className="text-2xl font-bold">{formatCurrency(stats.approved)}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Paid</p>
                    <p className="text-2xl font-bold">{formatCurrency(stats.paid)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by sale number, seller, or period..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="calculated">Calculated</option>
                  <option value="approved">Approved</option>
                  <option value="paid">Paid</option>
                  <option value="adjusted">Adjusted</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Commissions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Commissions</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredCommissions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Sale #</th>
                        <th className="text-left py-3 px-4">Seller</th>
                        <th className="text-right py-3 px-4">Sale Amount</th>
                        <th className="text-right py-3 px-4">Rate</th>
                        <th className="text-right py-3 px-4">Commission</th>
                        <th className="text-left py-3 px-4">Period</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Paid At</th>
                        <th className="text-left py-3 px-4">Reference</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCommissions.map((commission) => (
                        <tr key={commission.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-mono text-sm">{commission.sale_number}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              {commission.seller_name}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">{formatCurrency(commission.sale_amount)}</td>
                          <td className="py-3 px-4 text-right">{(commission.commission_rate * 100).toFixed(1)}%</td>
                          <td className="py-3 px-4 text-right font-semibold">{formatCurrency(commission.commission_amount)}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              {commission.period}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(commission.status)}`}>
                              {getStatusIcon(commission.status)}
                              {commission.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {commission.paid_at ? commission.paid_at : '-'}
                          </td>
                          <td className="py-3 px-4 text-sm font-mono">
                            {commission.payment_reference || '-'}
                          </td>
                          <td className="py-3 px-4">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-gray-500">No commissions found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
