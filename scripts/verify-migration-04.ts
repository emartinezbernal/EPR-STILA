/**
 * Verify Migration 04 - Check if all new tables exist
 * Run with: npx tsx scripts/verify-migration-04.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Load .env.local file manually
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

const tables = [
  // Base tables from migration 20260223000000
  'branches',
  'departments',
  'cost_centers',
  'user_profiles',
  'products',
  'product_categories',
  'product_brands',
  'warehouses',
  'customers',
  'sales',
  // New tables from migration 04
  'sale_items',
  'inventory_lots',
  'shipments',
  'installations',
  'commissions',
  'approval_requests',
  'alerts',
  'audit_log'
]

async function verifyTables() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    console.error('❌ Missing environment variables')
    process.exit(1)
  }

  const supabase = createClient(url, anonKey)

  console.log('\n')
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║    VERIFICATION: Migration 04 - New Tables                ║')
  console.log('╚════════════════════════════════════════════════════════════╝')
  console.log('\n')

  let allPassed = true

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count', { count: 'exact', head: true })
        .limit(1)

      if (error) {
        console.log(`✗ ${table}: ERROR - ${error.message}`)
        allPassed = false
      } else {
        console.log(`✓ ${table}: EXISTS`)
      }
    } catch (err: any) {
      console.log(`✗ ${table}: EXCEPTION - ${err.message}`)
      allPassed = false
    }
  }

  console.log('\n')
  
  // Check sample data in new tables
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║    Checking Sample Data in New Tables                      ║')
  console.log('╚════════════════════════════════════════════════════════════╝')
  console.log('\n')

  const newTables = ['sale_items', 'inventory_lots', 'shipments', 'installations', 'commissions', 'approval_requests', 'alerts', 'audit_log']

  for (const table of newTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)

      if (error) {
        console.log(`✗ ${table}: ERROR - ${error.message}`)
      } else if (data && data.length > 0) {
        console.log(`✓ ${table}: Has data (${data.length} record(s) shown)`)
      } else {
        console.log(`⚠ ${table}: Table exists but no data`)
      }
    } catch (err: any) {
      console.log(`✗ ${table}: EXCEPTION - ${err.message}`)
    }
  }

  console.log('\n')

  if (allPassed) {
    console.log('✅ All tables verified successfully!')
    process.exit(0)
  } else {
    console.log('❌ Some tables are missing or have errors')
    process.exit(1)
  }
}

verifyTables().catch(console.error)
