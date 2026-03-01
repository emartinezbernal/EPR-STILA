# TODO - Sistema de Comisiones con Vendedores

## Acciones completadas:

- [x] 1. POS page.tsx - Agregar import de useAuthStore y obtener currentUser
- [x] 2. POS page.tsx - Agregar sellerId y sellerName al payload del checkout
- [x] 3. Checkout API - Agregar sellerName a los tipos del body
- [x] 4. Checkout API - Extraer sellerName del body y crear registro de comisión
- [x] 5. Commissions page - Actualizar consulta con JOIN para obtener vendedor y venta

## Fecha de implementación: 2024

## Notas:
- El sistema ahora registra automáticamente las comisiones al hacer checkout
- La tasa de comisión se obtiene del perfil del usuario (default 3%)
- Sin usuario logueado, usa "Mostrador" como nombre de vendedor
