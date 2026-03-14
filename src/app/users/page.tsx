'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserPlus, Mail, Lock, User, Briefcase, Check } from 'lucide-react'

const ROLES = [
  { value: 'admin', label: 'Administrador' },
  { value: 'sales_manager', label: 'Gerente de Ventas' },
  { value: 'sales_user', label: 'Vendedor' },
  { value: 'cashier', label: 'Cajero' },
  { value: 'warehouse_admin', label: 'Administrador de Almacén' },
  { value: 'operations_admin', label: 'Administrador de Operaciones' },
  { value: 'installer', label: 'Instalador' },
  { value: 'viewer', label: 'Visor' },
]

export default function UsersPage() {
  const { user: currentUser } = useAuthStore()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'sales_user',
    employee_number: '',
    position: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      // 1. Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true,
        user_metadata: {
          full_name: `${formData.first_name} ${formData.last_name}`,
        }
      })

      if (authError) {
        setMessage({ type: 'error', text: authError.message })
        setLoading(false)
        return
      }

      if (authData.user) {
        // 2. Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            user_id: authData.user.id,
            email: formData.email,
            first_name: formData.first_name,
            last_name: formData.last_name,
            role: formData.role,
            employee_number: formData.employee_number || null,
            position: formData.position || null,
            is_active: true,
          })

        if (profileError) {
          setMessage({ type: 'error', text: profileError.message })
        } else {
          setMessage({ type: 'success', text: 'Usuario creado exitosamente!' })
          // Reset form
          setFormData({
            email: '',
            password: '',
            first_name: '',
            last_name: '',
            role: 'sales_user',
            employee_number: '',
            position: '',
          })
        }
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    }

    setLoading(false)
  }

  // Check if user has permission to create users
  if (!currentUser || !['super_admin', 'admin'].includes(currentUser.role)) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">No tienes permisos para acceder a esta página.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Alta de Usuarios</h1>
        <p className="text-gray-500">Registrar nuevos usuarios en el sistema</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Nuevo Usuario
          </CardTitle>
          <CardDescription>
            Completa los datos del nuevo usuario
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {message && (
              <div className={`p-3 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-100 text-green-800 border border-green-300' 
                  : 'bg-red-100 text-red-800 border border-red-300'
              }`}>
                {message.text}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre(s)</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Juan"
                    className="pl-10"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Apellido(s)</label>
                <Input
                  type="text"
                  placeholder="Pérez"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  className="pl-10"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Rol</label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  {ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Número de Empleado</label>
                <Input
                  type="text"
                  placeholder="EMP001"
                  value={formData.employee_number}
                  onChange={(e) => setFormData({ ...formData, employee_number: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Puesto</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Gerente de Ventas"
                  className="pl-10"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                'Creando usuario...'
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Crear Usuario
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
