# REPORTE DE ANÁLISIS: Base de Datos del Programa vs Supabase

**Fecha de análisis:** 2024
**Proyecto:** ERP STILA

---

## RESUMEN EJECUTIVO

Se realizó una comparación entre las tablas definidas en el código TypeScript del programa (`src/types/database.ts`, stores) y las tablas existentes en la migración de Supabase (`supabase/migrations/20260223000000_initial_setup.sql`).

**Resultado:** Se encontraron **8 tablas faltantes** en Supabase que son utilizadas por el código de la aplicación.

---

## TABLAS EXISTENTES EN SUPABASE

| # | Tabla | Estado | Notas |
|---|-------|--------|-------|
| 1 | branches | ✅ Existe | Sucursales |
| 2 | departments | ✅ Existe | Departamentos |
| 3 | cost_centers | ✅ Existe | Centros de costo |
| 4 | user_profiles | ✅ Existe | Perfiles de usuario |
| 5 | products | ✅ Existe | Productos |
| 6 | product_categories | ✅ Existe | Categorías de productos |
| 7 | product_brands | ✅ Existe | Marcas de productos |
| 8 | warehouses | ✅ Existe | Almacenes |
| 9 | customers | ✅ Existe | Clientes |
| 10 | sales | ✅ Existe | Ventas |

---

## ERRORES ENCONTRADOS: TABLAS FALTANTES

### 1. ❌ `sale_items` - Artículos de Venta
**Usado en:**
- `src/app/api/pos/checkout/route.ts` - Inserta items en checkout
- `src/app/analytics/page.tsx` - Consulta items para analytics
- `src/types/database.ts` - Interfaz `SaleItem` definida

**Descripción:** Tabla necesaria para almacenar los detalles de cada producto vendido en una venta.

**Campos requeridos (según interfaz SaleItem):**
```
typescript
interface SaleItem {
  id: string
  sale_id: string           // FK a sales
  product_id?: string       // FK a products
  lot_id?: string           // FK a inventory_lots
  quantity: number
  unit_price: number
  discount_percent: number
  discount_amount: number
  subtotal: number
  tax_amount: number
  total: number
  unit_cost?: number
  total_cost?: number
  status: string
  notes?: string
  serial_numbers?: string[]
  created_at: string
}
```

---

### 2. ❌ `inventory_lots` - Lotes de Inventario
**Usado en:**
- `src/types/database.ts` - Interfaz `InventoryLot` definida

**Descripción:** Tabla necesaria para control de inventario por lotes (lotes, fechas de expiración, costos).

**Campos requeridos:**
```
typescript
interface InventoryLot {
  id: string
  lot_number: string
  product_id: string        // FK a products
  warehouse_id?: string     // FK a warehouses
  quantity: number
  reserved_quantity: number
  available_quantity: number
  unit_cost?: number
  total_cost?: number
  receipt_date?: string
  expiration_date?: string
  status: string
  auto_assigned: boolean
  assigned_by?: string
  assigned_at?: string
  created_at: string
  updated_at: string
}
```

---

### 3. ❌ `shipments` - Envíos
**Usado en:**
- `src/app/shipping/page.tsx` - Página de envíos
- `src/app/api/pos/checkout/route.ts` - Crea envío al hacer checkout

**Descripción:** Tabla necesaria para el control de envíos/logística.

**Campos requeridos:**
```
typescript
interface Shipment {
  id: string
  branch_id?: string
  shipment_number: string
  sale_id?: string          // FK a sales
  status: ShippingStatus
  carrier?: string
  tracking_number?: string
  shipping_method?: string
  sender_name?: string
  sender_address?: string
  recipient_name?: string
  recipient_address?: string
  recipient_phone?: string
  shipped_at?: string
  delivered_at?: string
  notes?: string
  created_by?: string
  created_at: string
  updated_at: string
}
```

---

### 4. ❌ `installations` - Instalaciones
**Usado en:**
- `src/app/installations/page.tsx` - Página de instalaciones
- `src/app/api/pos/checkout/route.ts` - Crea instalación al hacer checkout

**Descripción:** Tabla necesaria para el control de instalaciones a clientes.

**Campos requeridos:**
```
typescript
interface Installation {
  id: string
  branch_id?: string
  installation_number: string
  sale_id?: string          // FK a sales
  customer_id?: string      // FK a customers
  status: InstallationStatus
  scheduled_date?: string
  scheduled_time?: string
  estimated_duration?: number
  address?: string
  city?: string
  contact_name?: string
  contact_phone?: string
  assigned_to?: string      // FK a user_profiles
  team_members?: string[]
  started_at?: string
  completed_at?: string
  notes?: string
  completion_notes?: string
  created_by?: string
  created_at: string
  updated_at: string
}
```

---

### 5. ❌ `commissions` - Comisiones
**Usado en:**
- `src/app/commissions/page.tsx` - Página de comisiones

**Descripción:** Tabla necesaria para el cálculo y seguimiento de comisiones de vendedores.

**Campos requeridos:**
```
typescript
interface Commission {
  id: string
  sale_id?: string          // FK a sales
  seller_id?: string        // FK a user_profiles
  period_id?: string
  sale_amount: number
  commission_rate: number
  commission_amount: number
  adjustments: number
  adjustment_reason?: string
  adjusted_by?: string
  status: string
  paid_at?: string
  payment_reference?: string
  notes?: string
  created_at: string
  updated_at: string
}
```

---

### 6. ❌ `approval_requests` - Solicitudes de Aprobación
**Usado en:**
- `src/app/dashboard/page.tsx` - Consulta aprobaciones pendientes
- `src/app/approvals/page.tsx` - Página de aprobaciones

**Descripción:** Tabla necesaria para el flujo de aprobaciones (descuentos grandes, ventas a crédito, etc.).

**Campos requeridos:**
```
typescript
interface ApprovalRequest {
  id: string
  definition_id?: string
  record_type: string
  record_id: string
  status: ApprovalStatus
  current_level: number
  max_level: number
  requested_by?: string
  requested_at: string
  reason?: string
  previous_value?: Record<string, unknown>
  new_value?: Record<string, unknown>
  resolved_by?: string
  resolved_at?: string
  resolution_notes?: string
  created_at: string
  updated_at: string
}
```

---

### 7. ❌ `alerts` - Alertas
**Usado en:**
- `src/app/alerts/page.tsx` - Página de alertas

**Descripción:** Tabla necesaria para el sistema de notificaciones/alertas del sistema.

**Campos requeridos:**
```
typescript
interface Alert {
  id: string
  branch_id?: string
  alert_type: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  title: string
  message?: string
  reference_type?: string
  reference_id?: string
  is_read: boolean
  read_by?: string
  read_at?: string
  user_id?: string
  created_at: string
}
```

---

### 8. ❌ `audit_log` - Log de Auditoría
**Usado en:**
- `src/app/audit/page.tsx` - Página de auditoría
- `src/app/api/pos/checkout/route.ts` - Registra acciones en auditoría

**Descripción:** Tabla necesaria para el registro de auditoría de todas las operaciones del sistema.

**Campos requeridos:**
- id, branch_id, user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent, created_at

---

## ENUMS FALTANTES EN SUPABASE

Además de las tablas, se encontraron los siguientes tipos/enums que deben crearse:

| Enum | Descripción | Estado |
|------|-------------|--------|
| commission_status | Estados de comisión | ❌ Faltante |
| shipping_status | Estados de envío | ✅ Existe |
| installation_status | Estados de instalación | ✅ Existe |
| approval_status | Estados de aprobación | ✅ Existe |

---

## RECOMENDACIONES

### Alta Prioridad (Críticos para el funcionamiento)

1. **Crear tabla `sale_items`** - Necesaria para el checkout del POS
2. **Crear tabla `shipments`** - Necesaria para logística
3. **Crear tabla `installations`** - Necesaria para servicios de instalación
4. **Crear tabla `audit_log`** - Necesaria para auditoría

### Media Prioridad

5. **Crear tabla `commissions`** - Sistema de comisiones
6. **Crear tabla `approval_requests`** - Flujo de aprobaciones
7. **Crear tabla `inventory_lots`** - Control de inventario
8. **Crear tabla `alerts`** - Sistema de notificaciones

---

## MIGRACIÓN SQL SUGERIDA

A continuación una migración de ejemplo para crear las tablas faltantes:

```
sql
-- =============================================================================
-- TABLAS FALTANTES PARA ERP STILA
-- =============================================================================

-- Enum para estado de comisiones
DO $$ BEGIN
    CREATE TYPE commission_status AS ENUM ('calculated', 'approved', 'paid', 'cancelled', 'adjusted');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Tabla: sale_items
CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id),
    lot_id UUID,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    discount_percent DECIMAL(5,4) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    subtotal DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total DECIMAL(15,2) NOT NULL,
    unit_cost DECIMAL(15,2),
    total_cost DECIMAL(15,2),
    status VARCHAR(20) DEFAULT 'active',
    notes TEXT,
    serial_numbers JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: inventory_lots
CREATE TABLE IF NOT EXISTS inventory_lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_number VARCHAR(50) UNIQUE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    warehouse_id UUID REFERENCES warehouses(id),
    quantity DECIMAL(10,2) DEFAULT 0,
    reserved_quantity DECIMAL(10,2) DEFAULT 0,
    available_quantity DECIMAL(10,2) DEFAULT 0,
    unit_cost DECIMAL(15,2),
    total_cost DECIMAL(15,2),
    receipt_date DATE,
    expiration_date DATE,
    status VARCHAR(20) DEFAULT 'active',
    auto_assigned BOOLEAN DEFAULT false,
    assigned_by UUID,
    assigned_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: shipments
CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branches(id),
    shipment_number VARCHAR(50) UNIQUE NOT NULL,
    sale_id UUID REFERENCES sales(id),
    status shipping',
    carrier VARCHAR_status DEFAULT 'pending(100),
    tracking_number VARCHAR(100),
    shipping_method VARCHAR(50),
    sender_name VARCHAR(255),
    sender_address TEXT,
    recipient_name VARCHAR(255),
    recipient_address TEXT,
    recipient_phone VARCHAR(20),
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: installations
CREATE TABLE IF NOT EXISTS installations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branches(id),
    installation_number VARCHAR(50) UNIQUE NOT NULL,
    sale_id UUID REFERENCES sales(id),
    customer_id UUID REFERENCES customers(id),
    status installation_status DEFAULT 'scheduled',
    scheduled_date DATE,
    scheduled_time VARCHAR(10),
    estimated_duration INTEGER,
    address TEXT,
    city VARCHAR(100),
    contact_name VARCHAR(255),
    contact_phone VARCHAR(20),
    assigned_to UUID,
    team_members JSONB,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    completion_notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: commissions
CREATE TABLE IF NOT EXISTS commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID REFERENCES sales(id),
    seller_id UUID,
    period_id UUID,
    sale_amount DECIMAL(15,2) NOT NULL,
    commission_rate DECIMAL(5,4) NOT NULL,
    commission_amount DECIMAL(15,2) NOT NULL,
    adjustments DECIMAL(15,2) DEFAULT 0,
    adjustment_reason TEXT,
    adjusted_by UUID,
    status commission_status DEFAULT 'calculated',
    paid_at TIMESTAMPTZ,
    payment_reference VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: approval_requests
CREATE TABLE IF NOT EXISTS approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    definition_id UUID,
    record_type VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    status approval_status DEFAULT 'pending',
    current_level INTEGER DEFAULT 1,
    max_level INTEGER DEFAULT 1,
    requested_by UUID,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    reason TEXT,
    previous_value JSONB,
    new_value JSONB,
    resolved_by UUID,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: alerts
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branches(id),
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) DEFAULT 'info',
    title VARCHAR(255) NOT NULL,
    message TEXT,
    reference_type VARCHAR(50),
    reference_id UUID,
    is_read BOOLEAN DEFAULT false,
    read_by UUID,
    read_at TIMESTAMPTZ,
    user_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: audit_log
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branches(id),
    user_id UUID,
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS en todas las tablas nuevas
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Políticas RLS simples (selección pública)
CREATE POLICY "sale_items_select" ON sale_items FOR SELECT USING (true);
CREATE POLICY "inventory_lots_select" ON inventory_lots FOR SELECT USING (true);
CREATE POLICY "shipments_select" ON shipments FOR SELECT USING (true);
CREATE POLICY "installations_select" ON installations FOR SELECT USING (true);
CREATE POLICY "commissions_select" ON commissions FOR SELECT USING (true);
CREATE POLICY "approval_requests_select" ON approval_requests FOR SELECT USING (true);
CREATE POLICY "alerts_select" ON alerts FOR SELECT USING (true);
CREATE POLICY "audit_log_select" ON audit_log FOR SELECT USING (true);
```

---

## CONCLUSIÓN

El análisis reveló que **8 tablas esenciales** para el funcionamiento completo del sistema ERP STILA no existen en la base de datos de Supabase. Esto causará errores cuando los usuarios intenten utilizar las funcionalidades de:

- Checkout/POS (venta con artículos)
- Envíos (shipping)
- Instalaciones
- Comisiones
- Aprobaciones
- Alertas
- Auditoría
- Control de inventario por lotes

**Se recomienda ejecutar la migración proporcionada** para crear las tablas faltantes antes de poner en producción estas funcionalidades.
