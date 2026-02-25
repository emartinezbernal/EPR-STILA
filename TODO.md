# POS Hybrid Operation - Implementation TODO

## Phase 1: Types & Logic Updates
- [ ] 1.1 Update `src/features/pos/lib/types.ts` - Add operation statuses, manufacturing fields, wall types
- [ ] 1.2 Update `src/features/pos/lib/cartLogic.ts` - Add fabrication item creation, enhanced validation

## Phase 2: ProductGrid Enhancements
- [ ] 2.1 Add "Fabrication/Under Order" badge for stock <= 0
- [ ] 2.2 Add warning style for stock <= 3

## Phase 3: ServicesSection Enhancements
- [ ] 3.1 Add time window selection for delivery
- [ ] 3.2 Add wall type select for installation
- [ ] 3.3 Add reference fields

## Phase 4: CartPanel Enhancements
- [ ] 4.1 Add operational status pills
- [ ] 4.2 Add manufacturing order details section
- [ ] 4.3 Enhance total with animation
- [ ] 4.4 Separate products/services sections

## Phase 5: Main POS Page Updates
- [ ] 5.1 Add Product/Service tab separation
- [ ] 5.2 Add manufacturing flow with date/anticipo
- [ ] 5.3 Implement Ctrl+K search focus handler
- [ ] 5.4 Add localStorage draft persistence

## Phase 6: Validation & Testing
- [ ] 6.1 Add required field validation for services
- [ ] 6.2 Test all flows

---

## Completed:
