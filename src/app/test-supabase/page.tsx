'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface TestResult {
  table: string
  status: 'success' | 'error'
  data?: any
  error?: string
}

export default function TestSupabasePage() {
  const [status, setStatus] = useState<'testing' | 'success' | 'error'>('testing')
  const [message, setMessage] = useState('Testing Supabase connection...')
  const [results, setResults] = useState<TestResult[]>([])

  useEffect(() => {
    async function testConnection() {
      try {
        // Test tables with correct English names (as used in the app)
        const tables = ['products', 'branches', 'customers', 'sales']
        const testResults: TestResult[] = []

        for (const table of tables) {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(5)

          testResults.push({
            table,
            status: error ? 'error' : 'success',
            data: data || [],
            error: error?.message
          })
        }

        setResults(testResults)

        const hasErrors = testResults.some(r => r.status === 'error')
        if (hasErrors) {
          setStatus('error')
          setMessage('Some tables returned errors')
        } else {
          setStatus('success')
          setMessage('Supabase connection successful!')
        }
      } catch (err: any) {
        setStatus('error')
        setMessage(`Connection failed: ${err.message}`)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      
      <div className={`p-4 rounded-md mb-4 ${
        status === 'success' ? 'bg-green-100 text-green-800' :
        status === 'error' ? 'bg-red-100 text-red-800' :
        'bg-yellow-100 text-yellow-800'
      }`}>
        <p className="font-medium">{message}</p>
      </div>

      <div className="space-y-4">
        {results.map((result) => (
          <div key={result.table} className="border rounded-md p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Table: {result.table}</h2>
              <span className={`px-2 py-1 rounded text-sm ${
                result.status === 'success' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {result.status === 'success' ? '✓ Success' : '✗ Error'}
              </span>
            </div>
            
            {result.error ? (
              <p className="text-red-600">{result.error}</p>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Records found: {result.data?.length || 0}
                </p>
                {result.data && result.data.length > 0 && (
                  <pre className="bg-gray-100 p-2 rounded-md overflow-auto max-h-48 text-xs">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
