'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Phone, 
  CheckCircle,
  AlertCircle,
  Wrench,
  Search,
  Plus,
  Loader2
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'

interface Installation {
  id: string
  installation_number: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold'
  scheduled_date: string
  scheduled_time: string
  customer_name: string
  address: string
  city: string
  contact_name: string
  contact_phone: string
  assigned_to: string
  estimated_duration: number
  notes: string
}

// Fallback mock data for demo/offline mode
const mockInstallations: Installation[] = [
  {
    id: '1',
    installation_number: 'INST-001',
    status: 'scheduled',
    scheduled_date: '2024-01-20',
    scheduled_time: '09:00',
    customer_name: 'Empresa Alpha',
    address: 'Av. Principal 100',
    city: 'Mexico City',
    contact_name: 'Juan Perez',
    contact_phone: '5551234567',
    assigned_to: 'Antonio Mendez',
    estimated_duration: 120,
    notes: 'Instalacion de mobiliario de oficina'
  },
  {
    id: '2',
    installation_number: 'INST-002',
    status: 'in_progress',
    scheduled_date: '2024-01-19',
    scheduled_time: '10:00',
    customer_name: 'Corporativo Beta',
    address: 'Blvd. Central 200',
    city: 'Monterrey',
    contact_name: 'Maria Lopez',
    contact_phone: '5559876543',
    assigned_to: 'Jose Vargas',
    estimated_duration: 180,
    notes: 'Instalacion de cocina completa'
  },
  {
    id: '3',
    installation_number: 'INST-003',
    status: 'completed',
    scheduled_date: '2024-01-18',
    scheduled_time: '14:00',
    customer_name: 'Industrias Gamma',
    address: 'Calle Norte 50',
    city: 'Guadalajara',
    contact_name: 'Pedro Garcia',
    contact_phone: '5555555555',
    assigned_to: 'Francisco Cruz',
    estimated_duration: 90,
    notes: 'Instalacion de salon de juntas'
  },
  {
    id: '4',
    installation_number: 'INST-004',
    status: 'on_hold',
    scheduled_date: '2024-01-21',
    scheduled_time: '11:00',
    customer_name: 'Grupo Delta',
    address: 'Paseo del Mar 300',
    city: 'Cancun',
    contact_name: 'Laura Martinez',
    contact_phone: '5554443333',
    assigned_to: 'Antonio Mendez',
    estimated_duration: 150,
    notes: 'Esperando aprobacion del cliente'
  }
]

export default function InstallationsPage() {
  const [installations, setInstallations] = useState<Installation[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchInstallations() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('installations')
          .select('*')
          .order('scheduled_date', { ascending: true })
        
        if (error) {
          console.error('Error fetching installations from Supabase:', error)
          setInstallations(mockInstallations)
        } else if (data && data.length > 0) {
          setInstallations(data as Installation[])
        } else {
          console.log('No installations found in Supabase, using demo data')
          setInstallations(mockInstallations)
        }
      } catch (err) {
        console.error('Exception fetching installations:', err)
        setInstallations(mockInstallations)
      } finally {
        setLoading(false)
      }
    }

    fetchInstallations()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50'
      case 'in_progress': return 'text-blue-600 bg-blue-50'
      case 'scheduled': return 'text-yellow-600 bg-yellow-50'
      case 'on_hold': return 'text-orange-600 bg-orange-50'
      case 'cancelled': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'in_progress': return <Wrench className="h-4 w-4" />
      case 'scheduled': return <Calendar className="h-4 w-4" />
      case 'on_hold': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const filteredInstallations = installations.filter(i => {
    const matchesSearch = 
      i.installation_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.assigned_to?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || i.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: installations.length,
    scheduled: installations.filter(i => i.status === 'scheduled').length,
    inProgress: installations.filter(i => i.status === 'in_progress').length,
    completed: installations.filter(i => i.status === 'completed').length
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Installation Management</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Installation
        </Button>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center justify-center py-8 mb-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Cargando instalaciones desde Supabase...</span>
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
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Scheduled</p>
                    <p className="text-2xl font-bold">{stats.scheduled}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">In Progress</p>
                    <p className="text-2xl font-bold">{stats.inProgress}</p>
                  </div>
                  <Wrench className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Completed</p>
                    <p className="text-2xl font-bold">{stats.completed}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
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
                    placeholder="Search by number, customer, or installer..."
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
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Installations List */}
          {filteredInstallations.length > 0 ? (
            <div className="grid gap-4">
              {filteredInstallations.map((installation) => (
                <Card key={installation.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold">{installation.installation_number}</h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(installation.status)}`}>
                            {getStatusIcon(installation.status)}
                            {installation.status.replace('_', ' ')}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{installation.customer_name || '-'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{installation.address || '-'}, {installation.city || '-'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{installation.scheduled_date || '-'} at {installation.scheduled_time || '-'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>~{installation.estimated_duration || 0} min</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span>Installer: {installation.assigned_to || '-'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span>{installation.contact_name || '-'} - {installation.contact_phone || '-'}</span>
                          </div>
                        </div>
                        
                        {installation.notes && (
                          <p className="mt-3 text-sm text-gray-500 italic">{installation.notes}</p>
                        )}
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        {installation.status === 'scheduled' && (
                          <Button size="sm">Start</Button>
                        )}
                        {installation.status === 'in_progress' && (
                          <Button size="sm">Complete</Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-8">
                <Wrench className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-500">No installations found</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
