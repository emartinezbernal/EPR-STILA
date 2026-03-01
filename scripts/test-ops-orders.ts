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

console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Service Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'exists' : 'MISSING')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function testInsert() {
  console.log('\n--- Testing INSERT into ops_orders ---\n')
  
  const testOrder = {
    id: 'test-order-' + Date.now(),
    sale_id: null,  // Try with null first
    order_type: 'delivery',
    status: 'pending',
    scheduled_date: '2026-03-01',
    time_window: '9:00 - 12:00',
    address: 'Test Address 123',
    reference: 'Near park',
    contact_name: 'John Doe',
    contact_phone: '1234567890',
    wall_type: 'concrete',
    notes: 'Test order',
    created_at: new Date().toISOString(),
  }
  
  console.log('Attempting to insert:', JSON.stringify(testOrder, null, 2))
  
  const { data, error } = await supabase
    .from('ops_orders')
    .upsert([testOrder], { onConflict: 'id' })
    .select()

  if (error) {
    console.log('❌ INSERT FAILED!')
    console.log('Error message:', error.message)
    console.log('Error details:', error.details)
    console.log('Error hint:', error.hint)
    console.log('Error code:', error.code)
    return false
  } else {
    console.log('✅ INSERT SUCCESS!')
    console.log('Data:', JSON.stringify(data, null, 2))
    return true
  }
}

testInsert().then(success => {
  process.exit(success ? 0 : 1)
}).catch(err => {
  console.error('Exception:', err)
  process.exit(1)
})
