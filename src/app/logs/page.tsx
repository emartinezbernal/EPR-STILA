'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Trash2, 
  Download, 
  RefreshCw, 
  Info, 
  AlertTriangle, 
  XCircle, 
  Bug,
  FileText,
  RefreshCw as RotateIcon
} from 'lucide-react'

// Interfaz de log
interface LogEntry {
  id: string
  timestamp: string
  level: string
  category: string
  message: string
  data?: unknown
}

// Función para obtener logs (simulada - en memoria)
const getLogsFromMemory = (): LogEntry[] => {
  // En una implementación real, esto leería del estado global o storage
  return []
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  // Cargar logs
  const loadLogs = async () => {
    setIsLoading(true)
    
    try {
      // Intentar obtener de Supabase
      const supabase = (await import('@/lib/supabase')).supabase
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500)

      if (error) {
        console.error('Error fetching logs:', error)
        // Si falla, usar logs de memoria
        setLogs([])
      } else if (data) {
        const formattedLogs: LogEntry[] = data.map((log: any) => ({
          id: log.id,
          timestamp: log.created_at,
          level: log.level,
          category: log.category,
          message: log.message,
          data: log.metadata
        }))
        setLogs(formattedLogs)
      }
    } catch (error) {
      console.error('Error:', error)
      setLogs([])
    }
    
    setIsLoading(false)
  }

  useEffect(() => {
    loadLogs()
  }, [])

  // Filtrar logs
  useEffect(() => {
    let filtered = [...logs]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(term) ||
        log.category.toLowerCase().includes(term) ||
        log.level.toLowerCase().includes(term)
      )
    }

    if (levelFilter !== 'all') {
      filtered = filtered.filter(log => log.level === levelFilter)
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(log => log.category === categoryFilter)
    }

    setFilteredLogs(filtered)
  }, [logs, searchTerm, levelFilter, categoryFilter])

  // Obtener categorías únicas
  const categories = [...new Set(logs.map(log => log.category))]

  // Función para limpiar logs
  const clearLogs = async () => {
    if (!confirm('¿Estás seguro de limpiar todos los logs?')) return

    try {
      const supabase = (await import('@/lib/supabase')).supabase
      await supabase.from('system_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await loadLogs()
    } catch (error) {
      console.error('Error clearing logs:', error)
    }
  }

  // Función para exportar logs
  const exportLogs = () => {
    const blob = new Blob([JSON.stringify(filteredLogs, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `logs_${new Date().toISOString()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Obtener icono según nivel
  const getLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />
      case 'warn':
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'debug':
        return <Bug className="h-4 w-4 text-gray-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-400" />
    }
  }

  // Obtener color según nivel
  const getLevelBadgeColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'info':
        return 'bg-blue-100 text-blue-800'
      case 'warn':
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'debug':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Logs del Sistema</h1>
        <p className="text-gray-500">Historial de eventos y actividades</p>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            {/* Buscar */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Buscar en logs..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro por nivel */}
            <select 
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">Todos los niveles</option>
              <option value="info">Info</option>
              <option value="warn">Warning</option>
              <option value="error">Error</option>
              <option value="debug">Debug</option>
            </select>

            {/* Filtro por categoría */}
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Botones de acción */}
            <Button variant="outline" onClick={loadLogs}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
            <Button variant="outline" onClick={exportLogs}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" onClick={clearLogs} className="text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Registros ({filteredLogs.length})</span>
            <Badge variant="outline">
              {logs.length} total
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-500" />
              <p className="mt-2 text-gray-500">Cargando logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No hay logs disponibles</p>
              <p className="text-sm">Los eventos del sistema aparecerán aquí</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredLogs.map((log) => (
                <div 
                  key={log.id} 
                  className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {getLevelIcon(log.level)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getLevelBadgeColor(log.level)}>
                          {log.level}
                        </Badge>
                        <Badge variant="outline">{log.category}</Badge>
                        <span className="text-xs text-gray-500">
                          {formatDate(log.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 break-words">
                        {log.message}
                      </p>
                      {log.data && (
                        <details className="mt-2">
                          <summary className="text-xs text-blue-600 cursor-pointer">
                            Ver datos adicionales
                          </summary>
                          <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
