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

// Use service role key for admin operations if available
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function testInsert() {
  console.log('\n--- Testing INSERT with stock column ---\n')
  
  const { data, error } = await supabase.from('products').insert({
    sku: 'TEST-' + Date.now(),
    name: 'Producto de Prueba',
    description: 'Test description',
    base_price: 1000,
    stock: 10,
    track_inventory: true,
    is_kit: false,
    is_active: true,
    is_featured: false,
  }).select()

  if (error) {
    console.log('❌ INSERT FAILED:', error.message)
    console.log('Error code:', error.code)
    if (error.message.includes('stock')) {
      console.log('\n⚠️  La columna "stock" NO existe en la tabla products')
      console.log('Necesitas ejecutar esta SQL en Supabase Dashboard → SQL Editor:')
      console.log('ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0;')
    }
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
  console.error('Error:', err)
  process.exit(1)
})
