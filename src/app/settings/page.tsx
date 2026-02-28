'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Settings, User, Bell, Lock, Database, Palette, Save, Upload, Plus, Edit, Trash2, Search, Eye, EyeOff } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'
import { UserProfile, UserRole } from '@/types/database'

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Administrador' },
  { value: 'sales_manager', label: 'Gerente de Ventas' },
  { value: 'sales_user', label: 'Vendedor' },
  { value: 'installer', label: 'Instalador' },
  { value: 'warehouse_admin', label: 'Almacenista' },
  { value: 'operations_admin', label: 'Operaciones' },
  { value: 'finance_admin', label: 'Finanzas' },
  { value: 'viewer', label: 'Solo Lectura' },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'users', name: 'Usuarios', icon: User },
    { id: 'profile', name: 'Perfil', icon: User },
    { id: 'notifications', name: 'Notificaciones', icon: Bell },
    { id: 'security', name: 'Seguridad', icon: Lock },
    { id: 'database', name: 'Base de Datos', icon: Database },
    { id: 'appearance', name: 'Apariencia', icon: Palette },
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Configuración del sistema</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
          </CardHeader>
          <CardContent>
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          {activeTab === 'general' && <GeneralSettings />}
          {activeTab === 'users' && <UsersSettings />}
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'database' && <DatabaseSettings />}
          {activeTab === 'appearance' && <AppearanceSettings />}
        </Card>
      </div>
    </div>
  )
}

function GeneralSettings() {
  return (
    <>
      <CardHeader>
        <CardTitle>Configuración General</CardTitle>
        <CardDescription>Configuración general del sistema</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre de la Empresa</label>
          <input type="text" defaultValue="ERP STILA" className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Zona Horaria</label>
          <select className="w-full px-3 py-2 border rounded-md">
            <option>America/Mexico_City</option>
            <option>America/Monterrey</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Idioma</label>
          <select className="w-full px-3 py-2 border rounded-md">
            <option>Español</option>
            <option>English</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Moneda</label>
          <select className="w-full px-3 py-2 border rounded-md">
            <option>MXN - Peso Mexicano</option>
            <option>USD - Dólar</option>
          </select>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <Save className="h-4 w-4" />
          Guardar Cambios
        </button>
      </CardContent>
    </>
  )
}

function UsersSettings() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'sales_user' as UserRole,
    phone: '',
    position: '',
    commission_rate: 3,
    is_active: true,
    password: '',
  })

  useEffect(() => { loadUsers() }, [])

  const resetForm = () => {
    setFormData({ 
      email: '', 
      first_name: '', 
      last_name: '', 
      role: 'sales_user', 
      phone: '', 
      position: '', 
      commission_rate: 3, 
      is_active: true, 
      password: '' 
    })
  }

  const loadUsers = async () => {
    setLoading(true)
    setError('')
    
    try {
      const { data, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (fetchError) {
        console.log('Error fetching from Supabase:', fetchError)
        const stored = localStorage.getItem('stila_users')
        if (stored) {
          setUsers(JSON.parse(stored))
        }
      } else if (data) {
        setUsers(data)
        localStorage.setItem('stila_users', JSON.stringify(data))
      }
    } catch (err) {
      console.log('Error:', err)
      const stored = localStorage.getItem('stila_users')
      if (stored) {
        setUsers(JSON.parse(stored))
      }
    }
    
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    const emailLower = formData.email.toLowerCase().trim()
    
    try {
      if (editingUser) {
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            first_name: formData.first_name,
            last_name: formData.last_name,
            role: formData.role,
            phone: formData.phone || null,
            position: formData.position || null,
            commission_rate: formData.commission_rate,
            is_active: formData.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingUser.id)
        
        if (updateError) {
          console.log('Update error:', updateError)
          setError('Error al actualizar usuario')
        } else {
          await loadUsers()
        }
      } else {
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            email: emailLower,
            first_name: formData.first_name,
            last_name: formData.last_name,
            role: formData.role,
            phone: formData.phone || null,
            position: formData.position || null,
            commission_rate: formData.commission_rate,
            is_active: formData.is_active,
            password: formData.password,
          })
        
        if (insertError) {
          console.log('Insert error:', insertError)
          const newUserWithPassword = {
            ...formData,
            email: emailLower,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
          const storedUsers = localStorage.getItem('stila_users')
          const existingUsers = storedUsers ? JSON.parse(storedUsers) : []
          localStorage.setItem('stila_users', JSON.stringify([newUserWithPassword, ...existingUsers]))
          await loadUsers()
        } else {
          await loadUsers()
        }
      }
      
      setShowForm(false)
      setEditingUser(null)
      resetForm()
    } catch (err) {
      console.error('Error:', err)
      setError('Error al guardar usuario')
    }
  }

  const handleEdit = (user: UserProfile) => {
    setEditingUser(user)
    setFormData({
      email: user.email || '',
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      phone: user.phone || '',
      position: user.position || '',
      commission_rate: user.commission_rate || 3,
      is_active: user.is_active,
      password: '',
    })
    setShowForm(true)
  }

  const handleDelete = async (user: UserProfile) => {
    if (!confirm(`Eliminar usuario ${user.first_name} ${user.last_name}?`)) return
    
    setDeletingId(user.id)
    
    try {
      // Delete from Supabase
      await supabase
        .from('user_profiles')
        .delete()
        .eq('id', user.id)
      
      // Update localStorage
      const stored = localStorage.getItem('stila_users')
      if (stored) {
        const usersList = JSON.parse(stored)
        const filtered = usersList.filter((u: UserProfile) => u.id !== user.id)
        localStorage.setItem('stila_users', JSON.stringify(filtered))
      }
      
      // Update local state to remove user from UI
      setUsers(prevUsers => prevUsers.filter(u => u.id !== user.id))
      
      alert('Usuario eliminado correctamente')
    } catch (err) {
      console.error('Error:', err)
      // Still update local state even on error
      setUsers(prevUsers => prevUsers.filter(u => u.id !== user.id))
      alert('Error al eliminar usuario')
    } finally {
      setDeletingId(null)
    }
  }

  const filteredUsers = users.filter(u => 
    `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      <CardHeader>
        <CardTitle>Gestión de Usuarios</CardTitle>
        <CardDescription>Usuarios guardados en Supabase</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-md">
            {error}
          </div>
        )}
        
        {!showForm ? (
          <>
            <div className="flex justify-between gap-4 mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Buscar usuarios..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <Button onClick={() => { setShowForm(true); setEditingUser(null); resetForm(); }}>
                <Plus className="h-4 w-4 mr-2" /> Nuevo Usuario
              </Button>
            </div>
            
            {loading ? (
              <div className="text-center py-8">Cargando de Supabase...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay usuarios. Crea uno nuevo.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b"><th className="text-left py-3 px-2">Nombre</th><th className="text-left py-3 px-2">Email</th><th className="text-left py-3 px-2">Rol</th><th className="text-left py-3 px-2">Estado</th><th className="text-right py-3 px-2">Acciones</th></tr></thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-2">{user.first_name} {user.last_name}</td>
                        <td className="py-3 px-2 text-gray-600">{user.email}</td>
                        <td className="py-3 px-2"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">{ROLES.find(r => r.value === user.role)?.label || user.role}</span></td>
                        <td className="py-3 px-2"><span className={`px-2 py-1 rounded text-xs ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{user.is_active ? 'Activo' : 'Inactivo'}</span></td>
                        <td className="py-3 px-2 text-right">
                          <button onClick={() => handleEdit(user)} className="p-1 text-blue-600 hover:bg-blue-50 rounded mr-1" title="Editar"><Edit className="h-4 w-4" /></button>
                          <button onClick={() => handleDelete(user)} disabled={deletingId === user.id} className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50" title="Eliminar">
                            {deletingId === user.id ? '...' : <Trash2 className="h-4 w-4" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
              <button type="button" onClick={() => { setShowForm(false); setEditingUser(null); }} className="text-gray-500 hover:text-gray-700">Cancelar</button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Nombre</label><Input value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} required placeholder="Juan" /></div>
              <div><label className="block text-sm font-medium mb-1">Apellido</label><Input value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} required placeholder="Pérez" /></div>
            </div>
            
            <div><label className="block text-sm font-medium mb-1">Email</label><Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required disabled={!!editingUser} placeholder="juan@stila.com" /></div>
            
            {!editingUser && (
              <div>
                <label className="block text-sm font-medium mb-1">Contraseña</label>
                <div className="flex gap-2">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    value={formData.password} 
                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    required 
                    placeholder="Contraseña"
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="px-3 py-2 border rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Rol</label><select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})} className="w-full px-3 py-2 border rounded-md">{ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}</select></div>
              <div><label className="block text-sm font-medium mb-1">Teléfono</label><Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="55-1234-5678" /></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Puesto</label><Input value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} placeholder="Vendedor" /></div>
              <div><label className="block text-sm font-medium mb-1">Comisión (%)</label><Input type="number" min="0" max="100" value={formData.commission_rate} onChange={(e) => setFormData({...formData, commission_rate: parseFloat(e.target.value)})} /></div>
            </div>
            
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} className="rounded" />
              <label htmlFor="is_active" className="text-sm">Usuario activo</label>
            </div>
            
            <Button type="submit" className="w-full"><Save className="h-4 w-4 mr-2" />{editingUser ? 'Actualizar Usuario' : 'Crear Usuario'}</Button>
          </form>
        )}
      </CardContent>
    </>
  )
}

function ProfileSettings() {
  return (
    <>
      <CardHeader>
        <CardTitle>Perfil de Usuario</CardTitle>
        <CardDescription>Información personal</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Nombre</label><input type="text" defaultValue="Admin" className="w-full px-3 py-2 border rounded-md" /></div>
          <div><label className="block text-sm font-medium mb-1">Apellido</label><input type="text" defaultValue="User" className="w-full px-3 py-2 border rounded-md" /></div>
        </div>
        <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" defaultValue="admin@stila.com" className="w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm font-medium mb-1">Teléfono</label><input type="tel" defaultValue="55-1234-5678" className="w-full px-3 py-2 border rounded-md" /></div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"><Save className="h-4 w-4" /> Guardar Cambios</button>
      </CardContent>
    </>
  )
}

function NotificationSettings() {
  return (
    <>
      <CardHeader>
        <CardTitle>Notificaciones</CardTitle>
        <CardDescription>Configura tus notificaciones</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between py-2 border-b">
          <div><p className="font-medium">Notificaciones por Email</p><p className="text-sm text-gray-500">Recibe actualizaciones por correo</p></div>
          <input type="checkbox" defaultChecked className="rounded" />
        </div>
        <div className="flex items-center justify-between py-2 border-b">
          <div><p className="font-medium">Alertas de Stock</p><p className="text-sm text-gray-500">Notificaciones de inventario bajo</p></div>
          <input type="checkbox" defaultChecked className="rounded" />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"><Save className="h-4 w-4" /> Guardar</button>
      </CardContent>
    </>
  )
}

function SecuritySettings() {
  return (
    <>
      <CardHeader>
        <CardTitle>Seguridad</CardTitle>
        <CardDescription>Configura la seguridad de tu cuenta</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div><label className="block text-sm font-medium mb-1">Contraseña Actual</label><input type="password" className="w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm font-medium mb-1">Nueva Contraseña</label><input type="password" className="w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm font-medium mb-1">Confirmar Contraseña</label><input type="password" className="w-full px-3 py-2 border rounded-md" /></div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"><Save className="h-4 w-4" /> Actualizar</button>
      </CardContent>
    </>
  )
}

function DatabaseSettings() {
  return (
    <>
      <CardHeader>
        <CardTitle>Base de Datos</CardTitle>
        <CardDescription>Gestión de la base de datos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div><label className="block text-sm font-medium mb-1">Host</label><input type="text" defaultValue="localhost" className="w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm font-medium mb-1">Puerto</label><input type="text" defaultValue="5432" className="w-full px-3 py-2 border rounded-md" /></div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"><Database className="h-4 w-4" /> Respaldar</button>
          <button className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"><Upload className="h-4 w-4" /> Restaurar</button>
        </div>
      </CardContent>
    </>
  )
}

function AppearanceSettings() {
  return (
    <>
      <CardHeader>
        <CardTitle>Apariencia</CardTitle>
        <CardDescription>Personaliza la interfaz</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Tema</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2"><input type="radio" name="theme" defaultChecked className="rounded" /><span>Claro</span></label>
            <label className="flex items-center gap-2"><input type="radio" name="theme" className="rounded" /><span>Oscuro</span></label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Color</label>
          <div className="flex gap-2">
            <button className="h-8 w-8 rounded-full bg-blue-600 border-2 border-white shadow"></button>
            <button className="h-8 w-8 rounded-full bg-purple-600 border-2 border-transparent"></button>
            <button className="h-8 w-8 rounded-full bg-green-600 border-2 border-transparent"></button>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"><Save className="h-4 w-4" /> Guardar</button>
      </CardContent>
    </>
  )
}
