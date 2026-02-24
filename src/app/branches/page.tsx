'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, Plus, MapPin, Phone, Mail, Edit, Trash2, Eye, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Branch } from '@/types/database'

// Fallback mock data for demo/offline mode
const mockBranches: Branch[] = [
  { id: '1', code: 'STILA-001', name: 'Stila Matriz', legal_name: 'Stila Solutions S.A. de C.V.', rfc: 'SMA123456ABC', address: 'Av. Principal 123', city: 'Mexico City', state: 'CDMX', phone: '55-1234-5678', email: 'matriz@stila.com', is_active: true, is_warehouse: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: '2', code: 'STILA-002', name: 'Stila Norte', legal_name: 'Stila Norte S.A. de C.V.', rfc: 'SNR234567BCD', address: 'Blvd. Industrial 456', city: 'Monterrey', state: 'NL', phone: '81-2345-6789', email: 'norte@stila.com', is_active: true, is_warehouse: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: '3', code: 'STILA-003', name: 'Stila Occidente', legal_name: 'Stila Occidente S.A. de C.V.', rfc: 'SOC345678CDE', address: 'Calle Commercial 789', city: 'Guadalajara', state: 'JAL', phone: '33-3456-7890', email: 'occidente@stila.com', is_active: true, is_warehouse: false, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: '4', code: 'STILA-004', name: 'Stila Sur', legal_name: 'Stila Sur S.A. de C.V.', rfc: 'SSU456789DEF', address: 'Av. del Sur 321', city: 'Merida', state: 'YUC', phone: '999-456-7890', email: 'sur@stila.com', is_active: false, is_warehouse: false, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
]

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBranches() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('branches')
          .select('*')
          .order('name', { ascending: true })
        
        if (error) {
          console.error('Error fetching branches from Supabase:', error)
          setBranches(mockBranches)
        } else if (data && data.length > 0) {
          setBranches(data as Branch[])
        } else {
          console.log('No branches found in Supabase, using demo data')
          setBranches(mockBranches)
        }
      } catch (err) {
        console.error('Exception fetching branches:', err)
        setBranches(mockBranches)
      } finally {
        setLoading(false)
      }
    }

    fetchBranches()
  }, [])

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Branches</h1>
          <p className="text-gray-500">Gestion de sucursales y almacenes</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Sucursal
        </Button>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center justify-center py-8 mb-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Cargando sucursales desde Supabase...</span>
        </div>
      )}

      {!loading && (
        <>
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sucursales</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{branches.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Activas</CardTitle>
                <Building2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{branches.filter(b => b.is_active).length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Almacenes</CardTitle>
                <Building2 className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{branches.filter(b => b.is_warehouse).length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inactivas</CardTitle>
                <Building2 className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{branches.filter(b => !b.is_active).length}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {branches.map((branch) => (
              <Card key={branch.id} className={!branch.is_active ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-6 w-6" />
                      <div>
                        <CardTitle>{branch.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{branch.code}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{branch.address}, {branch.city}, {branch.state}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{branch.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{branch.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">RFC:</span>
                      <span>{branch.rfc}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${branch.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {branch.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                    {branch.is_warehouse && (
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        Almacen
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
