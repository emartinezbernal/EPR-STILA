'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Package, 
  Truck, 
  Search, 
  MapPin, 
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  Plus,
  X
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'

interface Shipment {
  id: string
  shipment_number: string
  status: string
  carrier: string
  tracking_number: string
  recipient_name: string
  recipient_address: string
  shipped_at: string
  delivered_at: string | null
}

const mockShipments: Shipment[] = [
  {
    id: '1',
    shipment_number: 'SHP-001',
    status: 'in_transit',
    carrier: 'DHL',
    tracking_number: 'DHL123456789',
    recipient_name: 'Empresa Alpha',
    recipient_address: 'Av. Principal 100, Mexico City',
    shipped_at: '2024-01-15T10:00:00Z',
    delivered_at: null
  },
  {
    id: '2',
    shipment_number: 'SHP-002',
    status: 'delivered',
    carrier: 'FedEx',
    tracking_number: 'FX987654321',
    recipient_name: 'Corporativo Beta',
    recipient_address: 'Blvd. Central 200, Monterrey',
    shipped_at: '2024-01-14T09:00:00Z',
    delivered_at: '2024-01-15T14:30:00Z'
  },
  {
    id: '3',
    shipment_number: 'SHP-003',
    status: 'pending',
    carrier: 'UPS',
    tracking_number: 'UPS111222333',
    recipient_name: 'Industrias Gamma',
    recipient_address: 'Calle Norte 50, Guadalajara',
    shipped_at: '2024-01-16T08:00:00Z',
    delivered_at: null
  }
]

export default function ShippingPage() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newShipment, setNewShipment] = useState({
    carrier: '',
    tracking_number: '',
    recipient_name: '',
    recipient_address: '',
  })

  useEffect(() => {
    fetchShipments()
  }, [])

  async function fetchShipments() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error || !data || data.length === 0) {
        setShipments(mockShipments)
      } else {
        setShipments(data as Shipment[])
      }
    } catch (err) {
      setShipments(mockShipments)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateShipment() {
    if (!newShipment.carrier || !newShipment.recipient_name || !newShipment.recipient_address) {
      alert('Por favor complete los campos requeridos')
      return
    }

    setIsCreating(true)
    try {
      const shipmentNumber = `SHP-${Date.now().toString().slice(-6)}`
      
      const { data, error } = await supabase
        .from('shipments')
        .insert({
          shipment_number: shipmentNumber,
          status: 'pending',
          carrier: newShipment.carrier,
          tracking_number: newShipment.tracking_number,
          recipient_name: newShipment.recipient_name,
          recipient_address: newShipment.recipient_address,
        })
        .select()
        .single()

      if (error) {
        // Demo mode - add locally
        const newShip: Shipment = {
          id: Date.now().toString(),
          shipment_number: shipmentNumber,
          status: 'pending',
          carrier: newShipment.carrier,
          tracking_number: newShipment.tracking_number,
          recipient_name: newShipment.recipient_name,
          recipient_address: newShipment.recipient_address,
          shipped_at: new Date().toISOString(),
          delivered_at: null
        }
        setShipments([newShip, ...shipments])
      } else if (data) {
        setShipments([data as Shipment, ...shipments])
      }
      
      setShowNewDialog(false)
      setNewShipment({ carrier: '', tracking_number: '', recipient_name: '', recipient_address: '' })
    } catch (err) {
      alert('Error al crear el envío')
    } finally {
      setIsCreating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-50'
      case 'in_transit': return 'text-blue-600 bg-blue-50'
      case 'pending': return 'text-yellow-600 bg-yellow-50'
      case 'cancelled': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4" />
      case 'in_transit': return <Truck className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  const filteredShipments = shipments.filter(s => {
    const matchesSearch = s.shipment_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.recipient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.tracking_number?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: shipments.length,
    pending: shipments.filter(s => s.status === 'pending').length,
    inTransit: shipments.filter(s => s.status === 'in_transit').length,
    delivered: shipments.filter(s => s.status === 'delivered').length
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Shipping & Logistics</h1>
        <Button onClick={() => setShowNewDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Shipment
        </Button>
      </div>

      {/* New Shipment Dialog */}
      {showNewDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Nuevo Envío</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowNewDialog(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Transportista *</Label>
                <Input 
                  placeholder="DHL, FedEx, UPS, etc."
                  value={newShipment.carrier}
                  onChange={(e) => setNewShipment({...newShipment, carrier: e.target.value})}
                />
              </div>
              <div>
                <Label>Número de Tracking</Label>
                <Input 
                  placeholder="Número de seguimiento"
                  value={newShipment.tracking_number}
                  onChange={(e) => setNewShipment({...newShipment, tracking_number: e.target.value})}
                />
              </div>
              <div>
                <Label>Nombre del Destinatario *</Label>
                <Input 
                  placeholder="Nombre o empresa"
                  value={newShipment.recipient_name}
                  onChange={(e) => setNewShipment({...newShipment, recipient_name: e.target.value})}
                />
              </div>
              <div>
                <Label>Dirección de Entrega *</Label>
                <Input 
                  placeholder="Dirección completa"
                  value={newShipment.recipient_address}
                  onChange={(e) => setNewShipment({...newShipment, recipient_address: e.target.value})}
                />
              </div>
              <Button className="w-full" onClick={handleCreateShipment} disabled={isCreating}>
                {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Crear Envío
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8 mb-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Cargando envíos desde Supabase...</span>
        </div>
      )}

      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Shipments</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Pending</p>
                    <p className="text-2xl font-bold">{stats.pending}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">In Transit</p>
                    <p className="text-2xl font-bold">{stats.inTransit}</p>
                  </div>
                  <Truck className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Delivered</p>
                    <p className="text-2xl font-bold">{stats.delivered}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by shipment number, recipient, or tracking..."
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
                  <option value="pending">Pending</option>
                  <option value="in_transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipments</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredShipments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Shipment #</th>
                        <th className="text-left py-3 px-4">Carrier</th>
                        <th className="text-left py-3 px-4">Tracking</th>
                        <th className="text-left py-3 px-4">Recipient</th>
                        <th className="text-left py-3 px-4">Address</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Shipped</th>
                        <th className="text-left py-3 px-4">Delivered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredShipments.map((shipment) => (
                        <tr key={shipment.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{shipment.shipment_number}</td>
                          <td className="py-3 px-4">{shipment.carrier || '-'}</td>
                          <td className="py-3 px-4 font-mono text-sm">{shipment.tracking_number || '-'}</td>
                          <td className="py-3 px-4">{shipment.recipient_name || '-'}</td>
                          <td className="py-3 px-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {shipment.recipient_address || '-'}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(shipment.status)}`}>
                              {getStatusIcon(shipment.status)}
                              {shipment.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {shipment.shipped_at ? formatDate(shipment.shipped_at) : '-'}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {shipment.delivered_at ? formatDate(shipment.delivered_at) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-gray-500">No shipments found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
