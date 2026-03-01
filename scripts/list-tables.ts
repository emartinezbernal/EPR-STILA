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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function listTables() {
  console.log('Checking tables in the database...')
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  
  // Try to query information_schema
  const { data, error } = await supabase
    .from('pg_tables')
    .select('tablename, schemaname')
    .eq('schemaname', 'public')

  if (error) {
    console.log('Error querying tables:', error.message)
    console.log('This likely means the database is empty or tables need to be created.')
    return
  }

  console.log('\nExisting tables:')
  if (data && data.length > 0) {
    data.forEach(t => console.log(`  - ${t.tablename}`))
  } else {
    console.log('  No tables found!')
  }
}

listTables()
