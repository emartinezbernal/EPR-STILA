/**
 * Sistema de Logging Centralizado para ERP STILA
 * Proporciona funciones de logging estructurado para diferentes niveles
 */

// Tipos de nivel de log
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

// Interfaz de configuración del logger
interface LoggerConfig {
  enabled: boolean
  minLevel: LogLevel
  showTimestamp: boolean
  showCaller: boolean
}

// Configuración por defecto
const defaultConfig: LoggerConfig = {
  enabled: true,
  minLevel: 'info',
  showTimestamp: true,
  showCaller: false,
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

// Formatear mensaje de log
function formatMessage(level: LogLevel, message: string, data?: unknown): string {
  const parts: string[] = []
  
  if (currentConfig.showTimestamp) {
    const timestamp = new Date().toISOString()
    parts.push(`[${timestamp}]`)
  }
  
  parts.push(`[${level.toUpperCase()}]`)
  parts.push(message)
  
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

/**
 * Log de nivel DEBUG - Información detallada para desarrollo
 */
export function debug(message: string, data?: unknown): void {
  if (shouldLog('debug')) {
    console.debug(formatMessage('debug', message, data))
  }
}

/**
 * Log de nivel INFO - Información general del sistema
 */
export function info(message: string, data?: unknown): void {
  if (shouldLog('info')) {
    console.info(formatMessage('info', message, data))
  }
}

/**
 * Log de nivel WARN - Advertencias que no rompen la aplicación
 */
export function warn(message: string, data?: unknown): void {
  if (shouldLog('warn')) {
    console.warn(formatMessage('warn', message, data))
  }
}

/**
 * Log de nivel ERROR - Errores que necesitan atención
 */
export function error(message: string, data?: unknown): void {
  if (shouldLog('error')) {
    console.error(formatMessage('error', message, data))
  }
}

/**
 * Logging específico para operaciones de Supabase
 */
export const supabaseLogger = {
  query: (operation: string, details?: unknown) => {
    info(`[SUPABASE] ${operation}`, details)
  },
  response: (operation: string, success: boolean, data?: unknown) => {
    if (success) {
      info(`[SUPABASE] ${operation} - SUCCESS`, data)
    } else {
      error(`[SUPABASE] ${operation} - FAILED`, data)
    }
  },
  error: (operation: string, err: unknown) => {
    error(`[SUPABASE] ${operation} - ERROR`, err)
  },
}

/**
 * Logging específico para operaciones del POS
 */
export const posLogger = {
  addToCart: (productId: string, quantity: number) => {
    debug(`[POS] Add to cart: ${productId} x${quantity}`)
  },
  checkout: (total: number, paymentMethod: string) => {
    info(`[POS] Checkout: $${total} via ${paymentMethod}`)
  },
  error: (operation: string, err: unknown) => {
    error(`[POS] ${operation}`, err)
  },
}

/**
 * Logging específico para autenticación
 */
export const authLogger = {
  login: (email: string) => {
    info(`[AUTH] Login attempt for: ${email}`)
  },
  success: (userId: string) => {
    info(`[AUTH] Login successful: ${userId}`)
  },
  failure: (email: string, reason: string) => {
    warn(`[AUTH] Login failed for ${email}: ${reason}`)
  },
  logout: (userId: string) => {
    info(`[AUTH] Logout: ${userId}`)
  },
  sessionExpired: () => {
    warn(`[AUTH] Session expired`)
  },
}

/**
 * Logging específico para operaciones de base de datos
 */
export const dbLogger = {
  migration: (name: string, status: 'started' | 'completed' | 'failed') => {
    if (status === 'started') {
      info(`[DB] Migration started: ${name}`)
    } else if (status === 'completed') {
      info(`[DB] Migration completed: ${name}`)
    } else {
      error(`[DB] Migration failed: ${name}`)
    }
  },
  query: (table: string, operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE', rows?: number) => {
    debug(`[DB] ${operation} on ${table}${rows ? ` - ${rows} rows` : ''}`)
  },
  error: (operation: string, err: unknown) => {
    error(`[DB] ${operation}`, err)
  },
}

export default {
  configureLogger,
  getLoggerConfig,
  debug,
  info,
  warn,
  error,
  supabaseLogger,
  posLogger,
  authLogger,
  dbLogger,
}
