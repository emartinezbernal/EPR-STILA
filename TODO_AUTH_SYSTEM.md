# TODO - Sistema de Autenticación con Roles

## Acciones completadas:

- [x] 1. Crear pantalla de login (src/app/login/page.tsx)
- [x] 2. Actualizar auth-store con funciones login/logout
- [x] 3. Crear auth-provider.tsx
- [x] 4. Modificar layout.tsx
- [x] 5. Redirección por rol
- [x] 6. Proteger rutas (auth-guard)

## Estado: COMPLETADO

## Archivos creados/modificados:
- src/app/login/page.tsx (nuevo)
- src/stores/auth-store.ts (modificado)
- src/providers/auth-provider.tsx (nuevo)
- src/app/layout.tsx (modificado)
- src/components/auth-guard.tsx (nuevo)
- src/app/page.tsx (modificado)

## Roles y redirección:
- sales_user, sales_manager → /pos
- installer → /installations
- warehouse_admin → /inventory
- operations_admin → /shipping
- finance_admin → /commissions
- admin, super_admin → /dashboard
