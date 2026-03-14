/**
 * Sistema de Logging Centralizado para ERP STILA
 * Guarda logs en Supabase y muestra en consola
 */

import { createClient } from '@supabase/supabase-js'

// Inicializar cliente de Supabase (solo cliente, no servidor)
const supabaseUrl = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_SUPABASE_URL || '')
  : process.env.NEXT_PUBLIC_SUPABASE_URL || ''

const supabaseAnonKey = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '')
  : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Cliente solo para el navegador
const getSupabaseClient = () => {
  if (typeof window === 'undefined') return null
  if (!supabaseUrl || !supabaseAnonKey) return null
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Almacenar logs en memoria para mostrar en la UI
const inMemoryLogs: Array<{
  id: string
  timestamp: string
  level: string
  category: string
  message: string
  data?: unknown
}> = []

// Tipos de nivel de log
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

// Interfaz de configuración del logger
interface LoggerConfig {
  enabled: boolean
  minLevel: LogLevel
  showTimestamp: boolean
  showCaller: boolean
  saveToSupabase: boolean
}

// Configuración por defecto
const defaultConfig: LoggerConfig = {
  enabled: true,
  minLevel: 'debug',
  showTimestamp: true,
  showCaller: false,
  saveToSupabase: true,
}

let currentConfig: LoggerConfig = { ...defaultConfig }

// Niveles de prioridad
const levelPriority: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

// Configurar el logger
export function configureLogger(config: Partial<LoggerConfig>): void {
  currentConfig = { ...currentConfig, ...config }
}

// Obtener configuración actual
export function getLoggerConfig(): LoggerConfig {
  return { ...currentConfig }
}

// Obtener logs de memoria
export function getInMemoryLogs() {
  return [...inMemoryLogs]
}

// Limpiar logs de memoria
export function clearInMemoryLogs() {
  inMemoryLogs.length = 0
}

// Guardar log en Supabase
async function saveToSupabase(level: string, category: string, message: string, data?: unknown) {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) return

    const logEntry = {
      level,
      category,
      message,
      metadata: data ? JSON.stringify(data) : null,
    }

    const { error } = await supabase
      .from('system_logs')
      .insert(logEntry)

    if (error) {
      console.error('Error saving log to Supabase:', error)
    }
  } catch (err) {
    console.error('Exception saving log:', err)
  }
}

// Formatear mensaje de log
function formatMessage(level: LogLevel, message: string, data?: unknown): string {
  const parts: string[] = []
  
  if (currentConfig.showTimestamp) {
    const timestamp = new Date().toISOString()
    parts.push(`[${timestamp}]`)
  }
  
  parts.push(`[${level.toUpperCase()}]`)
  parts.push(`[${message}]`)
  
  if (data !== undefined) {
    parts.push(JSON.stringify(data, null, 2))
  }
  
  return parts.join(' ')
}

// Verificar si debe loguear según el nivel
function shouldLog(level: LogLevel): boolean {
  if (!currentConfig.enabled) return false
  return levelPriority[level] >= levelPriority[currentConfig.minLevel]
}

// Función interna de logging
function log(level: LogLevel, category: string, message: string, data?: unknown) {
  if (!shouldLog(level)) return

  // Agregar a memoria
  const logEntry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    level,
    category,
    message,
    data,
  }
  inMemoryLogs.unshift(logEntry)
  // keep last 1000 logs
  if (inMemoryLogs.length > 1000) {
    inMemoryLogs.pop()
  }

  // Log en consola
  const formatted = formatMessage(level, message, data)
  switch (level) {
    case 'debug':
      console.debug(formatted)
      break
    case 'info':
      console.info(formatted)
      break
    case 'warn':
      console.warn(formatted)
      break
    case 'error':
      console.error(formatted)
      break
  }

  // Guardar en Supabase si está habilitado
  if (currentConfig.saveToSupabase && typeof window !== 'undefined') {
    saveToSupabase(level, category, message, data)
  }
}

// Log de nivel DEBUG
export function debug(message: string, data?: unknown): void {
  log('debug', 'SYSTEM', message, data)
}

// Log de nivel INFO
export function info(message: string, data?: unknown): void {
  log('info', 'SYSTEM', message, data)
}

// Log de nivel WARN
export function warn(message: string, data?: unknown): void {
  log('warn', 'SYSTEM', message, data)
}

// Log de nivel ERROR
export function error(message: string, data?: unknown): void {
  log('error', 'SYSTEM', message, data)
}

// Logging específico para Supabase
export const supabaseLogger = {
  query: (operation: string, details?: unknown) => {
    log('debug', 'SUPABASE', operation, details)
  },
  response: (operation: string, success: boolean, data?: unknown) => {
    if (success) {
      log('info', 'SUPABASE', `${operation} - SUCCESS`, data)
    } else {
      log('error', 'SUPABASE', `${operation} - FAILED`, data)
    }
  },
  error: (operation: string, err: unknown) => {
    log('error', 'SUPABASE', operation, err)
  },
}

// Logging específico para POS
export const posLogger = {
  addToCart: (productId: string, quantity: number) => {
    log('debug', 'POS', `Add to cart: ${productId} x${quantity}`)
  },
  checkout: (total: number, paymentMethod: string) => {
    log('info', 'POS', `Checkout: $${total} via ${paymentMethod}`)
  },
  error: (operation: string, err: unknown) => {
    log('error', 'POS', operation, err)
  },
}

// Logging específico para autenticación
export const authLogger = {
  login: (email: string) => {
    log('info', 'AUTH', `Login attempt for: ${email}`)
  },
  success: (userId: string) => {
    log('info', 'AUTH', `Login successful: ${userId}`)
  },
  failure: (email: string, reason: string) => {
    log('warn', 'AUTH', `Login failed for ${email}: ${reason}`)
  },
  logout: (userId: string) => {
    log('info', 'AUTH', `Logout: ${userId}`)
  },
  sessionExpired: () => {
    log('warn', 'AUTH', 'Session expired')
  },
}

// Logging específico para base de datos
export const dbLogger = {
  migration: (name: string, status: 'started' | 'completed' | 'failed') => {
    if (status === 'started') {
      log('info', 'DB', `Migration started: ${name}`)
    } else if (status === 'completed') {
      log('info', 'DB', `Migration completed: ${name}`)
    } else {
      log('error', 'DB', `Migration failed: ${name}`)
    }
  },
  query: (table: string, operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE', rows?: number) => {
    log('debug', 'DB', `${operation} on ${table}${rows ? ` - ${rows} rows` : ''}`)
  },
  error: (operation: string, err: unknown) => {
    log('error', 'DB', operation, err)
  },
}

export default {
  configureLogger,
  getLoggerConfig,
  getInMemoryLogs,
  clearInMemoryLogs,
  debug,
  info,
  warn,
  error,
  supabaseLogger,
  posLogger,
  authLogger,
  dbLogger,
}
