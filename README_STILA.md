# ERP STILA - Enterprise Resource Planning System

A production-grade ERP web application with full data governance, security, internal control, auditability, and operational management.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Supabase Postgres, RLS, RPC functions
- **Deployment**: Vercel

## Features

### Core Modules
- Product Catalog
- Cart / POS
- Sales Management
- Inventory with LOT tracking
- Layaways
- Shipping logistics
- Installation management
- Commission system

### Enterprise Features
- Reports (Excel + PDF)
- Analytics and forecasting
- Alerts system
- Admin panel
- Internal control workflows
- Price governance
- Session monitoring
- Audit system

### Security
- RLS enabled on all tables
- RPC-based operations for critical actions
- Role-based access control (9 roles)
- Product costs admin-only
- All operations audited

## Role Hierarchy

1. super_admin
2. admin
3. finance_admin
4. operations_admin
5. warehouse_admin
6. sales_manager
7. sales_user
8. installer
9. viewer

## Setup

### 1. Environment Variables

Create `.env.local` with:

```
env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 2. Database Migrations

Run the migrations:

```
powershell
.\push-migrations.ps1
```

Or manually:

```
bash
supabase db push
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```
bash
npm run dev
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Dashboard analytics
│   ├── catalog/           # Product catalog
│   ├── pos/               # Point of Sale
│   ├── sales/             # Sales management
│   ├── inventory/          # Inventory & lots
│   ├── customers/          # Customer management
│   ├── shipping/           # Shipping logistics
│   ├── installations/      # Installation scheduling
│   ├── commissions/        # Commission management
│   ├── reports/            # Reports & exports
│   └── approvals/          # Approval workflows
├── components/
│   ├── ui/               # shadcn/ui components
│   └── layout/            # Layout components
├── lib/                   # Utilities & Supabase client
├── stores/                # Zustand stores
└── types/                 # TypeScript types
```

## Database Schema

The schema includes:

- **40+ tables** for all enterprise modules
- **Row Level Security** policies on every table
- **Audit triggers** for all critical operations
- **Approval workflows** for internal controls
- **Commission rules** engine
- **CFDI invoice structure** for Mexican invoicing
- **Chart of accounts** for accounting

See `supabase/migrations/00_setup_all_fixed.sql` for complete schema.

## Internal Controls

Approval workflows required for:
- Sale cancellation
- Refunds
- Price overrides
- Large discounts
- Inventory adjustments
- Wastage
- Commission payments

## License

Proprietary - All rights reserved
