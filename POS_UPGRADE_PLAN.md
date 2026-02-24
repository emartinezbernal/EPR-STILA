# POS Premium Upgrade Plan

## Overview
Upgrade the current POS to a premium retail experience for a modern mirror retail business.

## Current State Analysis
- **Current POS**: `src/app/pos/page.tsx` - Basic grid layout with cart
- **Products**: 5 mock products in store
- **Services needed**: Delivery + Installation as line items

## Implementation Phases

### Phase 1: Visual & UI Improvements (Premium)
- [ ] Reduce sidebar visual dominance
- [ ] Neutral warm grays for surfaces
- [ ] Typographic hierarchy: prices 20-24px, totals 26-30px
- [ ] Tabular-nums for money values

### Phase 2: Fast Bar & Product Grid
- [ ] Add top "Fast Bar" with barcode/SKU input
- [ ] Add debounced search (300ms)
- [ ] Add category filter chips
- [ ] Product cards: image, name, SKU, price, stock, "+ Add" button
- [ ] Low stock badge

### Phase 3: Cart Panel Enhancement
- [ ] Make totals sticky at bottom
- [ ] Show subtotal, discounts, taxes, services, grand total
- [ ] Single strong "Checkout" CTA
- [ ] Inline validations

### Phase 4: Services as Line Items
- [ ] Add service products: SERVICE_DELIVERY, SERVICE_INSTALLATION
- [ ] "Servicios adicionales" section in cart
- [ ] Toggle services on/off
- [ ] Auto-add/remove service line items

### Phase 5: Logistics Capture
- [ ] Delivery: address, date/time, notes
- [ ] Installation: address, contact name/phone, date/time, notes

### Phase 6: Checkout Drawer
- [ ] Replace multiple payment buttons with one "Checkout"
- [ ] Right-side drawer with payment method selection
- [ ] Transfer reference field
- [ ] Success: clear cart, show summary, ticket link

### Phase 7: Backend Integration
- [ ] POST /api/pos/checkout - RPC call
- [ ] Create shipping_order if delivery
- [ ] Create installation_order if installation
- [ ] Generate/store ticket PDF

## File Structure Changes

### New Files to Create:
1. `src/features/pos/components/PosToolbar.tsx`
2. `src/features/pos/components/ProductGrid.tsx`
3. `src/features/pos/components/CartPanel.tsx`
4. `src/features/pos/components/ServicesSection.tsx`
5. `src/features/pos/components/CheckoutDrawer.tsx`
6. `src/features/pos/hooks/usePosShortcuts.ts`
7. `src/features/pos/lib/types.ts`
8. `src/features/pos/lib/cartLogic.ts`
9. `src/app/api/pos/checkout/route.ts`

### Files to Modify:
1. `src/app/pos/page.tsx` - Main POS page
2. `src/stores/product-store.ts` - Add barcode field
3. `src/types/database.ts` - Add cart item types

## Testing Checklist
- [ ] Add product via barcode input
- [ ] Toggle delivery/installation services
- [ ] Checkout with transfer reference
- [ ] Verify ticket stored
- [ ] Verify shipping/installation orders created

## Start Date: 2024
