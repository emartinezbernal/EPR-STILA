'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Bell, CheckCircle, XCircle, Info, Trash2, Eye, Filter, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDateTime } from '@/lib/utils'

interface Alert {
  id: string
  alert_type: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  title: string
  message: string
  reference_type: string
  reference_id: string
  is_read: boolean
  created_at: string
}

// Fallback mock data for demo/offline mode
const mockAlerts: Alert[] = [
  { id: '1', alert_type: 'inventory', severity: 'warning', title: 'Stock bajo', message: 'El producto SKU-001 tiene solo 5 unidades en inventario', reference_type: 'product', reference_id: '1', is_read: false, created_at: '2024-01-15T10:30:00Z' },
  { id: '2', alert_type: 'payment', severity: 'error', title: 'Pago fallido', message: 'El pago del cliente C-123 fue rechazado', reference_type: 'sale', reference_id: '1', is_read: false, created_at: '2024-01-15T10:25:00Z' },
  { id: '3', alert_type: 'customer', severity: 'info', title: 'Nuevo cliente', message: 'Se registro un nuevo cliente: Empresa ABC', reference_type: 'customer', reference_id: '1', is_read: true, created_at: '2024-01-15T10:20:00Z' },
  { id: '4', alert_type: 'sale', severity: 'info', title: 'Pedido completado', message: 'El pedido #1234 fue entregado exitosamente', reference_type: 'sale', reference_id: '2', is_read: true, created_at: '2024-01-15T10:15:00Z' },
  { id: '5', alert_type: 'commission', severity: 'warning', title: 'Comision pendiente', message: 'Hay 3 comisiones pendientes de aprobacion', reference_type: 'commission', reference_id: '1', is_read: false, created_at: '2024-01-15T10:10:00Z' },
]

export default function AlertsPage() {
  const [filter, setFilter] = useState('all')
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAlerts() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('alerts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50)
        
        if (error) {
          console.error('Error fetching alerts from Supabase:', error)
          setAlerts(mockAlerts)
        } else if (data && data.length > 0) {
          setAlerts(data as Alert[])
        } else {
          console.log('No alerts found in Supabase, using demo data')
          setAlerts(mockAlerts)
        }
      } catch (err) {
        console.error('Exception fetching alerts:', err)
        setAlerts(mockAlerts)
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
  }, [])

  const filteredAlerts = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter)

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />
      case 'critical': return <XCircle className="h-5 w-5 text-red-700" />
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />
      default: return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getBgColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-yellow-50 border-yellow-200'
      case 'error': return 'bg-red-50 border-red-200'
      case 'critical': return 'bg-red-100 border-red-300'
      case 'success': return 'bg-green-50 border-green-200'
      default: return 'bg-blue-50 border-blue-200'
    }
  }

  const unreadCount = alerts.filter(a => !a.is_read).length
  const warningCount = alerts.filter(a => a.severity === 'warning').length
  const errorCount = alerts.filter(a => a.severity === 'error' || a.severity === 'critical').length

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Alerts</h1>
        <p className="text-gray-500">Centro de notificaciones y alertas del sistema</p>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center justify-center py-8 mb-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Cargando alertas desde Supabase...</span>
        </div>
      )}

      {!loading && (
        <>
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{alerts.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sin Leer</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{unreadCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Advertencias</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{warningCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Errores</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{errorCount}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Todas las Alertas</CardTitle>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1 text-sm rounded-md ${filter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setFilter('warning')}
                    className={`px-3 py-1 text-sm rounded-md ${filter === 'warning' ? 'bg-yellow-500 text-white' : 'bg-gray-100'}`}
                  >
                    Advertencias
                  </button>
                  <button
                    onClick={() => setFilter('error')}
                    className={`px-3 py-1 text-sm rounded-md ${filter === 'error' ? 'bg-red-500 text-white' : 'bg-gray-100'}`}
                  >
                    Errores
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredAlerts.length > 0 ? (
                <div className="space-y-3">
                  {filteredAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border ${getBgColor(alert.severity)} ${!alert.is_read ? 'font-semibold' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        {getIcon(alert.severity)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{alert.title}</h3>
                            <span className="text-xs text-muted-foreground">{formatDateTime(alert.created_at)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-1 hover:bg-gray-200 rounded">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-1 hover:bg-gray-200 rounded">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No se encontraron alertas
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
