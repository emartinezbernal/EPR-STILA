'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Truck, 
  Wrench, 
  MapPin, 
  Phone, 
  Calendar, 
  Clock,
  FileText,
  Plus,
  Minus
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { LogisticsDetails, SERVICE_PRICES, WallType } from '../lib/types'

interface ServicesSectionProps {
  logistics: LogisticsDetails
  onLogisticsChange: (logistics: LogisticsDetails) => void
  deliveryEnabled: boolean
  installationEnabled: boolean
  onDeliveryToggle: (enabled: boolean) => void
  onInstallationToggle: (enabled: boolean) => void
}

// Wall types array
const WALL_TYPES = [
  { id: 'concreto', label: 'Concreto / Cemento' },
  { id: 'madera', label: 'Madera' },
  { id: 'tablaroca', label: 'Tablaroca / Yeso' },
  { id: 'ladrillo', label: 'Ladrillo' },
  { id: 'otro', label: 'Otro' },
] as const

// Time windows
const TIME_WINDOWS = [
  { id: 'manana', label: 'Mañana (9am - 12pm)' },
  { id: 'tarde', label: 'Tarde (12pm - 6pm)' },
  { id: 'noche', label: 'Noche (6pm - 9pm)' },
] as const

export function ServicesSection({
  logistics,
  onLogisticsChange,
  deliveryEnabled,
  installationEnabled,
  onDeliveryToggle,
  onInstallationToggle,
}: ServicesSectionProps) {
  return (
    <div className="border-t border-slate-200 pt-4 mt-4">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm text-slate-800 flex items-center">
          <Wrench className="h-4 w-4 mr-2 text-slate-600" />
          Servicios adicionales
        </h3>
      </div>

      {/* Delivery Card */}
      <div className={`rounded-lg border-2 transition-all duration-200 mb-3 ${
        deliveryEnabled 
          ? 'border-blue-500 bg-blue-50/50' 
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}>
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="delivery"
              checked={deliveryEnabled}
              onCheckedChange={(checked) => onDeliveryToggle(checked === true)}
              className="h-5 w-5"
            />
            <div>
              <Label 
                htmlFor="delivery" 
                className="flex items-center cursor-pointer font-semibold text-slate-800"
              >
                <Truck className="h-4 w-4 mr-2 text-blue-600" />
                Entrega a domicilio
              </Label>
              <p className="text-xs text-slate-500 mt-0.5">
                +{formatCurrency(SERVICE_PRICES.DELIVERY)}
              </p>
            </div>
          </div>
          {deliveryEnabled && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              Activo
            </span>
          )}
        </div>
        
        {deliveryEnabled && (
          <div className="px-3 pb-3 border-t border-blue-100 pt-3 space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">
                Dirección de entrega *
              </Label>
              <Input
                placeholder="Calle, número, colonia, ciudad"
                value={logistics.deliveryAddress || ''}
                onChange={(e) => onLogisticsChange({ ...logistics, deliveryAddress: e.target.value })}
                className="h-9 text-sm bg-white border-slate-300 focus:border-blue-500"
              />
            </div>
            
            {/* References field for delivery */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">
                Referencias
              </Label>
              <Input
                placeholder="Entre calles, color de casa, etc."
                value={logistics.deliveryReferences || ''}
                onChange={(e) => onLogisticsChange({ ...logistics, deliveryReferences: e.target.value })}
                className="h-9 text-sm bg-white border-slate-300 focus:border-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">Fecha *</Label>
                <Input
                  type="date"
                  value={logistics.deliveryDate || ''}
                  onChange={(e) => onLogisticsChange({ ...logistics, deliveryDate: e.target.value })}
                  className="h-9 text-sm bg-white border-slate-300"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">Ventana horaria</Label>
                <Select 
                  value={logistics.deliveryTimeWindow || ''}
                  onValueChange={(value) => onLogisticsChange({ ...logistics, deliveryTimeWindow: value })}
                >
                  <SelectTrigger className="h-9 text-sm bg-white border-slate-300">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_WINDOWS.map((tw) => (
                      <SelectItem key={tw.id} value={tw.id}>
                        {tw.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Notas</Label>
              <Input
                placeholder="Instrucciones especiales de entrega"
                value={logistics.deliveryNotes || ''}
                onChange={(e) => onLogisticsChange({ ...logistics, deliveryNotes: e.target.value })}
                className="h-9 text-sm bg-white border-slate-300"
              />
            </div>
          </div>
        )}
      </div>

      {/* Installation Card */}
      <div className={`rounded-lg border-2 transition-all duration-200 ${
        installationEnabled 
          ? 'border-emerald-500 bg-emerald-50/50' 
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}>
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="installation"
              checked={installationEnabled}
              onCheckedChange={(checked) => onInstallationToggle(checked === true)}
              className="h-5 w-5"
            />
            <div>
              <Label 
                htmlFor="installation" 
                className="flex items-center cursor-pointer font-semibold text-slate-800"
              >
                <Wrench className="h-4 w-4 mr-2 text-emerald-600" />
                Instalación profesional
              </Label>
              <p className="text-xs text-slate-500 mt-0.5">
                +{formatCurrency(SERVICE_PRICES.INSTALLATION)} (incl. IVA)
              </p>
            </div>
          </div>
          {installationEnabled && (
            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
              Activo
            </span>
          )}
        </div>
        
        {installationEnabled && (
          <div className="px-3 pb-3 border-t border-emerald-100 pt-3 space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">
                Dirección de instalación *
              </Label>
              <Input
                placeholder="Calle, número, colonia, ciudad"
                value={logistics.installationAddress || ''}
                onChange={(e) => onLogisticsChange({ ...logistics, installationAddress: e.target.value })}
                className="h-9 text-sm bg-white border-slate-300 focus:border-emerald-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">Nombre contacto *</Label>
                <Input
                  placeholder="Persona de contacto"
                  value={logistics.installationContactName || ''}
                  onChange={(e) => onLogisticsChange({ ...logistics, installationContactName: e.target.value })}
                  className="h-9 text-sm bg-white border-slate-300"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">Teléfono *</Label>
                <Input
                  placeholder="10 dígitos"
                  value={logistics.installationContactPhone || ''}
                  onChange={(e) => onLogisticsChange({ ...logistics, installationContactPhone: e.target.value })}
                  className="h-9 text-sm bg-white border-slate-300"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">Fecha *</Label>
                <Input
                  type="date"
                  value={logistics.installationDate || ''}
                  onChange={(e) => onLogisticsChange({ ...logistics, installationDate: e.target.value })}
                  className="h-9 text-sm bg-white border-slate-300"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">Ventana horaria</Label>
                <Select 
                  value={logistics.installationTimeWindow || ''}
                  onValueChange={(value) => onLogisticsChange({ ...logistics, installationTimeWindow: value })}
                >
                  <SelectTrigger className="h-9 text-sm bg-white border-slate-300">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_WINDOWS.map((tw) => (
                      <SelectItem key={tw.id} value={tw.id}>
                        {tw.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Wall Type Selection */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Tipo de muro</Label>
              <Select 
                value={logistics.installationWallType || ''}
                onValueChange={(value) => onLogisticsChange({ ...logistics, installationWallType: value as WallType })}
              >
                <SelectTrigger className="h-9 text-sm bg-white border-slate-300">
                  <SelectValue placeholder="Seleccionar tipo de muro" />
                </SelectTrigger>
                <SelectContent>
                  {WALL_TYPES.map((wt) => (
                    <SelectItem key={wt.id} value={wt.id}>
                      {wt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Notas</Label>
              <Input
                placeholder="Requisitos especiales de instalación"
                value={logistics.installationNotes || ''}
                onChange={(e) => onLogisticsChange({ ...logistics, installationNotes: e.target.value })}
                className="h-9 text-sm bg-white border-slate-300"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
