/**
 * Supabase Connection Validator Script
 * Run with: npx tsx scripts/validate-supabase.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Load .env.local file manually (without dotenv dependency)
function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8')
    const lines = content.split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const equalIndex = trimmed.indexOf('=')
        if (equalIndex > 0) {
          const key = trimmed.substring(0, equalIndex).trim()
          let value = trimmed.substring(equalIndex + 1).trim()
          // Remove quotes if present
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1)
          }
          process.env[key] = value
        }
      }
    }
  }
}

loadEnvFile()

interface EnvConfig {
  url: string
  anonKey: string
  serviceRoleKey?: string
}

interface ValidationResult {
  success: boolean
  checks: {
    name: string
    status: 'pass' | 'fail' | 'warn'
    message: string
    details?: any
  }[]
  timestamp: string
}

function getEnvConfig(): EnvConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !anonKey) {
    return null
  }

  return { url, anonKey, serviceRoleKey }
}

function printBanner() {
  console.log('\n')
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║         SUPABASE CONNECTION VALIDATOR v1.0                 ║')
  console.log('╚════════════════════════════════════════════════════════════╝')
  console.log('\n')
}

function printResult(result: ValidationResult) {
  const { checks } = result

  console.log('┌─────────────────────────────────────────────────────────────┐')
  console.log('│ VALIDATION RESULTS                                          │')
  console.log('└─────────────────────────────────────────────────────────────┘\n')

  checks.forEach((check) => {
    const icon = check.status === 'pass' ? '✓' : check.status === 'warn' ? '⚠' : '✗'
    const color = check.status === 'pass' ? '\x1b[32m' : check.status === 'warn' ? '\x1b[33m' : '\x1b[31m'
    const reset = '\x1b[0m'

    console.log(`${color}${icon}${reset} ${check.name}`)
    console.log(`  └─ ${check.message}`)

    if (check.details) {
      console.log(`  └─ Details:`, JSON.stringify(check.details, null, 2))
    }
    console.log('')
  })

  const passed = checks.filter((c) => c.status === 'pass').length
  const failed = checks.filter((c) => c.status === 'fail').length
  const warnings = checks.filter((c) => c.status === 'warn').length

  console.log('┌─────────────────────────────────────────────────────────────┐')
  console.log('│ SUMMARY                                                      │')
  console.log('└─────────────────────────────────────────────────────────────┘')
  console.log(`  Passed:   ${passed}`)
  console.log(`  Failed:   ${failed}`)
  console.log(`  Warnings: ${warnings}`)
  console.log(`  Time:     ${result.timestamp}`)
  console.log('\n')

  return failed === 0
}

async function validateConnection(): Promise<ValidationResult> {
  const result: ValidationResult = {
    success: false,
    checks: [],
    timestamp: new Date().toISOString(),
  }

  // Check 1: Environment Variables
  const envConfig = getEnvConfig()

  if (!envConfig) {
    result.checks.push({
      name: 'Environment Variables',
      status: 'fail',
      message: 'NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not found in .env.local',
      details: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing',
      },
    })
    return result
  }

  result.checks.push({
    name: 'Environment Variables',
    status: 'pass',
    message: 'Environment variables configured',
    details: {
      NEXT_PUBLIC_SUPABASE_URL: envConfig.url.substring(0, 30) + '...',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: envConfig.anonKey.substring(0, 20) + '...',
    },
  })

  // Check 2: Validate URL format
  const isValidUrl = envConfig.url.startsWith('https://') && envConfig.url.includes('.supabase.co')
  result.checks.push({
    name: 'URL Format',
    status: isValidUrl ? 'pass' : 'fail',
    message: isValidUrl ? 'Supabase URL format is valid' : 'Invalid Supabase URL format',
    details: { url: envConfig.url },
  })

  if (!isValidUrl) {
    return result
  }

  // Check 3: Test Connection
  const supabase = createClient(envConfig.url, envConfig.anonKey)

  try {
    const { data: versionData, error: versionError } = await supabase.rpc('get_database_version')

    result.checks.push({
      name: 'Database Connection',
      status: versionError ? 'fail' : 'pass',
      message: versionError ? 'Failed to connect to database' : 'Successfully connected to database',
      details: versionError ? versionError : { version: versionData || 'unknown' },
    })

    if (versionError) {
      // Try alternative connection test
      const { data: testData, error: testError } = await supabase.from('products').select('count').limit(1)
      result.checks.push({
        name: 'Products Table Access',
        status: testError ? 'warn' : 'pass',
        message: testError ? `Cannot access products table: ${testError.message}` : 'Products table accessible',
        details: testError ? testError : testData,
      })
    }
  } catch (err: any) {
    result.checks.push({
      name: 'Database Connection',
      status: 'fail',
      message: `Connection failed: ${err.message}`,
      details: err,
    })
  }

  // Check 4: Check Tables
  try {
    const tablesToCheck = ['products', 'customers', 'users', 'branches']
    const tableResults: Record<string, any> = {}

    for (const table of tablesToCheck) {
      const { data, error } = await supabase.from(table).select('count').limit(1)
      tableResults[table] = {
        accessible: !error,
        error: error?.message,
        count: data?.[0]?.count ?? 'unknown'
      }
    }

    const accessibleTables = Object.values(tableResults).filter((t: any) => t.accessible).length
    result.checks.push({
      name: 'Table Access',
      status: accessibleTables > 0 ? 'pass' : 'warn',
      message: `${accessibleTables}/${tablesToCheck} tables accessible`,
      details: tableResults,
    })
  } catch (err: any) {
    result.checks.push({
      name: 'Table Access',
      status: 'warn',
      message: `Could not verify table access: ${err.message}`,
    })
  }

  // Check 5: RLS Status
  try {
    const { data: rlsData, error: rlsError } = await supabase.rpc('check_rls_enabled')

    result.checks.push({
      name: 'Row Level Security (RLS)',
      status: rlsError ? 'warn' : 'pass',
      message: rlsError ? 'Could not verify RLS status' : 'RLS status retrieved',
      details: rlsError ? rlsError : rlsData,
    })
  } catch (err: any) {
    result.checks.push({
      name: 'Row Level Security (RLS)',
      status: 'warn',
      message: 'RLS check not available (may require admin access)',
    })
  }

  // Check 6: Auth Configuration
  try {
    const { data: authData, error: authError } = await supabase.auth.getSession()

    result.checks.push({
      name: 'Auth Service',
      status: authError ? 'fail' : 'pass',
      message: authError ? 'Auth service error' : 'Auth service responding',
      details: authError ? authError : { session: authData.session ? 'active' : 'none' },
    })
  } catch (err: any) {
    result.checks.push({
      name: 'Auth Service',
      status: 'warn',
      message: `Auth check failed: ${err.message}`,
    })
  }

  result.success = result.checks.filter((c) => c.status === 'fail').length === 0

  return result
}

async function main() {
  printBanner()

  const config = getEnvConfig()

  if (!config) {
    console.log('╔════════════════════════════════════════════════════════════╗')
    console.log('║  ERROR: Missing Environment Configuration                    ║')
    console.log('╚════════════════════════════════════════════════════════════╝')
    console.log('\nPlease create a .env.local file with:\n')
    console.log('  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
    console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key\n')
    console.log('You can find these in your Supabase dashboard:\n')
    console.log('  → Settings → API → Project URL and anon public key\n')
    process.exit(1)
  }

  console.log('🔄 Running validation...\n')

  const result = await validateConnection()
  const success = printResult(result)

  if (success) {
    console.log('\x1b[32m🎉 All checks passed! Supabase connection is working.\x1b[0m\n')
    process.exit(0)
  } else {
    console.log('\x1b[31m⚠️  Some checks failed. Please review the errors above.\x1b[0m\n')
    process.exit(1)
  }
}

main().catch(console.error)
