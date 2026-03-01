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

async function createOpsOrdersTable() {
  console.log('\n--- Creating ops_orders table ---\n')
  
  console.log('Checking if table exists...')
  
  // Try to select from the table - if it doesn't exist, we'll get an error
  const { data: testData, error: testError } = await supabase
    .from('ops_orders')
    .select('id')
    .limit(1)
  
  if (testError) {
    console.log('❌ Table does not exist. Error:', testError.message)
    console.log('\n⚠️  Please create the table manually in Supabase Dashboard → SQL Editor:')
    console.log(`
-- Run this SQL in Supabase SQL Editor:

-- Create ops_orders table
CREATE TABLE IF NOT EXISTS ops_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  order_type VARCHAR(50) NOT NULL CHECK (order_type IN ('delivery', 'installation', 'fabrication')),
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'in_progress', 'completed', 'issue', 'cancelled')),
  scheduled_date DATE,
  time_window VARCHAR(50),
  address TEXT,
  reference TEXT,
  contact_name VARCHAR(255),
  contact_phone VARCHAR(50),
  wall_type VARCHAR(50),
  notes TEXT,
  promised_date DATE,
  advance_payment DECIMAL(12,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE ops_orders ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Allow all operations on ops_orders" ON ops_orders
  FOR ALL USING (true) WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ops_orders_sale_id ON ops_orders(sale_id);
CREATE INDEX IF NOT EXISTS idx_ops_orders_status ON ops_orders(status);
CREATE INDEX IF NOT EXISTS idx_ops_orders_type ON ops_orders(order_type);
CREATE INDEX IF NOT EXISTS idx_ops_orders_scheduled_date ON ops_orders(scheduled_date);
`)
    return false
  }
  
  console.log('✅ Table ops_orders already exists!')
  return true
}

createOpsOrdersTable().then(success => {
  process.exit(success ? 0 : 1)
}).catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
