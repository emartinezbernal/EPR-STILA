'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, User, Clock, Activity, Search, Filter, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDateTime } from '@/lib/utils'

interface AuditLog {
  id: string
  action: string
  user_id: string
  table_name: string
  record_id: string
  ip_address: string
  created_at: string
}

// Fallback mock data for demo/offline mode
const mockAuditLogs: AuditLog[] = [
  { id: '1', action: 'user_login', user_id: 'admin@stila.com', table_name: 'users', record_id: '1', ip_address: '192.168.1.1', created_at: '2024-01-15T10:30:00Z' },
  { id: '2', action: 'sale_created', user_id: 'sales@stila.com', table_name: 'sales', record_id: '1', ip_address: '192.168.1.2', created_at: '2024-01-15T10:25:00Z' },
  { id: '3', action: 'inventory_updated', user_id: 'warehouse@stila.com', table_name: 'products', record_id: '1', ip_address: '192.168.1.3', created_at: '2024-01-15T10:20:00Z' },
  { id: '4', action: 'customer_created', user_id: 'sales@stila.com', table_name: 'customers', record_id: '1', ip_address: '192.168.1.2', created_at: '2024-01-15T10:15:00Z' },
  { id: '5', action: 'price_modified', user_id: 'admin@stila.com', table_name: 'products', record_id: '2', ip_address: '192.168.1.1', created_at: '2024-01-15T10:10:00Z' },
  { id: '6', action: 'user_logout', user_id: 'sales@stila.com', table_name: 'users', record_id: '2', ip_address: '192.168.1.2', created_at: '2024-01-15T10:05:00Z' },
  { id: '7', action: 'report_generated', user_id: 'admin@stila.com', table_name: 'reports', record_id: '1', ip_address: '192.168.1.1', created_at: '2024-01-15T10:00:00Z' },
  { id: '8', action: 'order_shipped', user_id: 'warehouse@stila.com', table_name: 'shipments', record_id: '1', ip_address: '192.168.1.3', created_at: '2024-01-15T09:55:00Z' },
]

export default function AuditPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [totalEvents, setTotalEvents] = useState(0)
  const [todayActions, setTodayActions] = useState(0)

  useEffect(() => {
    async function fetchAuditLogs() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('audit_log')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100)
        
        if (error) {
          console.error('Error fetching audit logs from Supabase:', error)
          setAuditLogs(mockAuditLogs)
        } else if (data && data.length > 0) {
          setAuditLogs(data as AuditLog[])
        } else {
          console.log('No audit logs found in Supabase, using demo data')
          setAuditLogs(mockAuditLogs)
        }
        
        // Get counts
        const { count: totalCount } = await supabase
          .from('audit_log')
          .select('*', { count: 'exact', head: true })
        
        const today = new Date().toISOString().split('T')[0]
        const { count: todayCount } = await supabase
          .from('audit_log')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today)
        
        setTotalEvents(totalCount || mockAuditLogs.length)
        setTodayActions(todayCount || 3)
      } catch (err) {
        console.error('Exception fetching audit logs:', err)
        setAuditLogs(mockAuditLogs)
        setTotalEvents(mockAuditLogs.length)
        setTodayActions(3)
      } finally {
        setLoading(false)
      }
    }

    fetchAuditLogs()
  }, [])

  const filteredLogs = auditLogs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.table_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'user_login': 'User login',
      'user_logout': 'User logout',
      'sale_created': 'Sale created',
      'inventory_updated': 'Inventory updated',
      'customer_created': 'Customer created',
      'price_modified': 'Price modified',
      'report_generated': 'Report generated',
      'order_shipped': 'Order shipped',
    }
    return labels[action] || action
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Audit</h1>
        <p className="text-gray-500">Registro de auditoria del sistema</p>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center justify-center py-8 mb-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Cargando registros de auditoría...</span>
        </div>
      )}

      {!loading && (
        <>
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Eventos</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalEvents}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">25</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Acciones Hoy</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayActions}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45ms</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Registros de Auditoria Recientes
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 pr-4 py-2 border rounded-md text-sm"
                    />
                  </div>
                  <button className="p-2 border rounded-md hover:bg-gray-100">
                    <Filter className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredLogs.length > 0 ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground pb-2 border-b">
                    <div>Accion</div>
                    <div>Usuario</div>
                    <div>Tabla</div>
                    <div>Fecha/Hora</div>
                  </div>
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="grid grid-cols-4 gap-4 text-sm py-2 border-b hover:bg-gray-50">
                      <div className="font-medium">{getActionLabel(log.action)}</div>
                      <div className="text-muted-foreground">{log.user_id || '-'}</div>
                      <div className="text-muted-foreground">{log.table_name || '-'}</div>
                      <div className="text-muted-foreground">{formatDateTime(log.created_at)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No se encontraron registros de auditoría
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
