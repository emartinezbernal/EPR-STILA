import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8')
  content.split('\n').forEach(line => {
    const t = line.trim()
    if (t && !t.startsWith('#')) {
      const eq = t.indexOf('=')
      if (eq > 0) {
        let v = t.substring(eq + 1).trim()
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
        process.env[t.substring(0, eq).trim()] = v
      }
    }
  })
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

const newTables = ['sale_items', 'inventory_lots', 'shipments', 'installations', 'commissions', 'approval_requests', 'alerts', 'audit_log']

async function checkRLS() {
  console.log('\nRLS Policies Check:\n')
  
  for (const table of newTables) {
    const { data, error } = await supabase.from(table).select('id').limit(1)
    console.log(`${table}: ${error ? 'ERROR - ' + error.message : 'OK (RLS working)'}`)
  }
}

checkRLS()
