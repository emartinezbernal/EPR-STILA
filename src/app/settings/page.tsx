'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Settings, User, Bell, Lock, Database, Palette, Globe, Mail, Save, Upload } from 'lucide-react'
import { useState } from 'react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
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
        <p className="text-gray-500">Configuracion del sistema</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Configuracion</CardTitle>
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
          {activeTab === 'general' && (
            <>
              <CardHeader>
                <CardTitle>Configuracion General</CardTitle>
                <CardDescription>Configuracion general del sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre de la Empresa</label>
                  <input
                    type="text"
                    defaultValue="ERP STILA"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Zona Horaria</label>
                  <select className="w-full px-3 py-2 border rounded-md">
                    <option>America/Mexico_City</option>
                    <option>America/Monterrey</option>
                    <option>America/Guadalajara</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Idioma</label>
                  <select className="w-full px-3 py-2 border rounded-md">
                    <option>Espanol</option>
                    <option>English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Moneda</label>
                  <select className="w-full px-3 py-2 border rounded-md">
                    <option>MXN - Peso Mexicano</option>
                    <option>USD - Dolar Estadounidense</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="maintenance" className="rounded" />
                  <label htmlFor="maintenance" className="text-sm">Modo Mantenimiento</label>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  <Save className="h-4 w-4" />
                  Guardar Cambios
                </button>
              </CardContent>
            </>
          )}

          {activeTab === 'profile' && (
            <>
              <CardHeader>
                <CardTitle>Perfil de Usuario</CardTitle>
                <CardDescription>Informacion personal y de contacto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-20 w-20 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-10 w-10 text-gray-500" />
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50">
                    <Upload className="h-4 w-4" />
                    Cambiar Foto
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nombre</label>
                    <input type="text" defaultValue="Admin" className="w-full px-3 py-2 border rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Apellido</label>
                    <input type="text" defaultValue="User" className="w-full px-3 py-2 border rounded-md" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" defaultValue="admin@stila.com" className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Telefono</label>
                  <input type="tel" defaultValue="55-1234-5678" className="w-full px-3 py-2 border rounded-md" />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  <Save className="h-4 w-4" />
                  Guardar Cambios
                </button>
              </CardContent>
            </>
          )}

          {activeTab === 'notifications' && (
            <>
              <CardHeader>
                <CardTitle>Configuracion de Notificaciones</CardTitle>
                <CardDescription>Gestiona como recibes las notificaciones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">Notificaciones por Email</p>
                    <p className="text-sm text-muted-foreground">Recibe actualizaciones por correo electronico</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">Notificaciones Push</p>
                    <p className="text-sm text-muted-foreground">Recibe notificaciones en el navegador</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">Alertas de Stock</p>
                    <p className="text-sm text-muted-foreground">Notificaciones cuando el inventario esta bajo</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">Resumen Diario</p>
                    <p className="text-sm text-muted-foreground">Recibe un resumen diario de actividades</p>
                  </div>
                  <input type="checkbox" className="rounded" />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  <Save className="h-4 w-4" />
                  Guardar Cambios
                </button>
              </CardContent>
            </>
          )}

          {activeTab === 'security' && (
            <>
              <CardHeader>
                <CardTitle>Configuracion de Seguridad</CardTitle>
                <CardDescription>Gestiona la seguridad de tu cuenta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Contrasena Actual</label>
                  <input type="password" className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nueva Contrasena</label>
                  <input type="password" className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Confirmar Contrasena</label>
                  <input type="password" className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div className="flex items-center gap-2 py-2">
                  <input type="checkbox" id="2fa" className="rounded" />
                  <label htmlFor="2fa" className="text-sm">Habilitar autenticacion de dos factores</label>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  <Save className="h-4 w-4" />
                  Actualizar Contrasena
                </button>
              </CardContent>
            </>
          )}

          {activeTab === 'database' && (
            <>
              <CardHeader>
                <CardTitle>Configuracion de Base de Datos</CardTitle>
                <CardDescription>Gestion de la base de datos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Host de Base de Datos</label>
                  <input type="text" defaultValue="localhost" className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Puerto</label>
                  <input type="text" defaultValue="5432" className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre de Base de Datos</label>
                  <input type="text" defaultValue="erp_stila" className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                    <Database className="h-4 w-4" />
                    Respaldar BD
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700">
                    <Upload className="h-4 w-4" />
                    Restaurar BD
                  </button>
                </div>
              </CardContent>
            </>
          )}

          {activeTab === 'appearance' && (
            <>
              <CardHeader>
                <CardTitle>Configuracion de Apariencia</CardTitle>
                <CardDescription>Personaliza la interfaz</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tema</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="theme" defaultChecked className="rounded" />
                      <span>Claro</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="theme" className="rounded" />
                      <span>Oscuro</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="theme" className="rounded" />
                      <span>Sistema</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Color de Marca</label>
                  <div className="flex gap-2">
                    <button className="h-8 w-8 rounded-full bg-blue-600 border-2 border-white shadow"></button>
                    <button className="h-8 w-8 rounded-full bg-purple-600 border-2 border-transparent"></button>
                    <button className="h-8 w-8 rounded-full bg-green-600 border-2 border-transparent"></button>
                    <button className="h-8 w-8 rounded-full bg-red-600 border-2 border-transparent"></button>
                    <button className="h-8 w-8 rounded-full bg-gray-900 border-2 border-transparent"></button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tamano de Fuente</label>
                  <select className="w-full px-3 py-2 border rounded-md">
                    <option>Pequeño</option>
                    <option>Mediano</option>
                    <option>Grande</option>
                  </select>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  <Save className="h-4 w-4" />
                  Guardar Cambios
                </button>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
