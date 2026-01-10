# Project Structure

The Fundraising Event project is organized as a **pnpm monorepo** with a clear separation between applications and shared packages.

## Directory Tree

```
fundraising-event/
├── apps/                          # Application packages
│   ├── api/                       # NestJS Backend
│   │   ├── database/              # Prisma schema & migrations
│   │   │   ├── migrations/        # Database migration files
│   │   │   └── mock/              # Mock data for testing
│   │   ├── scripts/               # Utility scripts (e.g., set-admin-password)
│   │   └── src/
│   │       ├── assets/            # Static assets (fonts, templates)
│   │       ├── database/          # Prisma service
│   │       ├── features/          # Feature modules
│   │       │   ├── auth/          # Authentication (JWT, OAuth, Staff PIN)
│   │       │   ├── donation/      # Payment processing (Stripe, PayPal)
│   │       │   ├── events/        # Event CRUD operations
│   │       │   ├── export/        # Receipt ZIP export
│   │       │   ├── gateway/       # WebSocket real-time events
│   │       │   ├── health/        # Health check endpoint
│   │       │   ├── mail/          # Email service & templates
│   │       │   ├── pdf/           # PDF receipt generation
│   │       │   ├── queue/         # BullMQ job processing
│   │       │   ├── staff/         # Staff code management
│   │       │   └── white-labeling/# Config service integration
│   │       └── test/              # Integration tests
│   │
│   └── web/                       # React Frontend (Vite)
│       ├── public/                # Static public assets
│       │   └── config/            # Runtime configuration
│       └── src/
│           ├── core/              # Shared infrastructure
│           │   ├── app/           # App entry & routing
│           │   ├── components/    # Shared UI components
│           │   │   ├── ui/        # Shadcn/UI primitives
│           │   │   └── ...        # AppHeader, layouts, etc.
│           │   ├── hooks/         # Global hooks
│           │   ├── lib/           # Utilities (api, i18n, utils)
│           │   ├── providers/     # Context providers
│           │   └── stores/        # Global state (Jotai)
│           │
│           ├── features/          # Domain features
│           │   ├── admin/         # Admin Dashboard
│           │   │   ├── components/# Dashboard widgets, forms
│           │   │   │   └── global-settings/
│           │   │   ├── layouts/   # AdminLayout
│           │   │   ├── pages/     # DashboardPage, GlobalSettingsPage
│           │   │   ├── schemas/   # Zod validation schemas
│           │   │   └── types/     # TypeScript interfaces
│           │   │
│           │   ├── auth/          # Authentication
│           │   │   ├── components/# LoginForm, guards
│           │   │   ├── hooks/     # useLogin, useAuth
│           │   │   └── pages/     # LoginPage
│           │   │
│           │   ├── donation/      # Donation Flow
│           │   │   ├── components/# CheckoutForm, PaymentForms
│           │   │   ├── hooks/     # useDonation, usePayment
│           │   │   ├── pages/     # DonationPage, ThankYouPage
│           │   │   └── schemas/   # donation.schema.ts
│           │   │
│           │   ├── events/        # Event Management
│           │   │   ├── components/# EventCard, forms
│           │   │   ├── context/   # EventContext
│           │   │   ├── hooks/     # useEvent, useEvents
│           │   │   ├── layouts/   # EventLayout
│           │   │   ├── pages/     # EventSettingsPage, CreateEventPage
│           │   │   ├── schemas/   # event-settings.schema.ts
│           │   │   └── types/     # Event types
│           │   │
│           │   ├── live/          # Live Projection Screen
│           │   │   ├── components/
│           │   │   │   ├── gauges/   # GaugeClassic, GaugeModern, GaugeElegant
│           │   │   │   ├── themes/   # LiveClassic, LiveModern, LiveElegant
│           │   │   │   └── DonationFeed.tsx
│           │   │   ├── hooks/     # useLiveSocket
│           │   │   ├── pages/     # LivePage
│           │   │   └── types/     # Live screen types
│           │   │
│           │   ├── public/        # Public Landing Pages
│           │   │   ├── components/# FeatureCard, PublicEventCard
│           │   │   └── pages/     # LandingPage, RootLandingPage
│           │   │
│           │   └── staff/         # Staff Collector
│           │       ├── components/# Keypad, DonationTypeSelector
│           │       ├── hooks/     # useSync
│           │       ├── pages/     # CollectorPage, EventTeamPage
│           │       ├── schemas/   # staff.schema.ts
│           │       └── services/  # SyncService, StorageService
│           │
│           └── test/              # Test utilities & integration tests
│
├── packages/                      # Shared packages
│   ├── types/                     # Shared TypeScript types
│   │   └── src/
│   │       ├── dtos/              # Data Transfer Objects
│   │       └── enums/             # Shared enumerations
│   │
│   └── white-labeling/            # White-labeling package
│       └── src/
│           ├── assets/            # Default logos & images
│           ├── config/            # Default event-config.json
│           ├── locales/           # Translation files (en, fr, de, it)
│           ├── theme/             # Default CSS variables
│           ├── types/             # EventConfig types
│           └── utils/             # Merge utilities
│
├── docs/                          # MkDocs documentation
│   └── features/                  # Feature-specific docs
│
├── docker-compose.yml             # Local dev infrastructure
├── mkdocs.yml                     # Documentation config
├── pnpm-workspace.yaml            # Monorepo workspace config
└── package.json                   # Root package.json
```

---

## Architecture Principles

### Core vs Features (Frontend)

The frontend follows a **Core vs Features** architecture:

| Directory       | Purpose                                         | Import Alias  |
| :-------------- | :---------------------------------------------- | :------------ |
| `src/core/`     | Shared infrastructure, UI library, global state | `@core/*`     |
| `src/features/` | Domain-specific logic, pages, components        | `@features/*` |
| `src/test/`     | Test utilities and integration tests            | `@test/*`     |

> [!IMPORTANT]
> Features should **never** import from other features. Cross-feature communication should go through `core/` (providers, stores, events).

### Modular Backend (API)

The backend uses **NestJS modules** organized by domain:

| Module           | Responsibility                       |
| :--------------- | :----------------------------------- |
| `AuthModule`     | JWT, OAuth, Staff PIN authentication |
| `DonationModule` | Payment processing, webhooks         |
| `EventModule`    | Event CRUD, configuration            |
| `GatewayModule`  | WebSocket real-time events           |
| `MailModule`     | Email templates & sending            |
| `PdfModule`      | Receipt PDF generation               |
| `QueueModule`    | Background job processing            |
| `ExportModule`   | Bulk data export (ZIP)               |
| `HealthModule`   | Health check endpoints               |

---

## Shared Packages

### `@fundraising/types`

Contains shared DTOs and interfaces used by both frontend and backend:

```
packages/types/src/
├── dtos/
│   ├── donation.dto.ts
│   ├── event.dto.ts
│   ├── auth.dto.ts
│   └── ...
└── enums/
    └── payment-status.enum.ts
```

### `@fundraising/white-labeling`

The white-labeling engine that powers theming and configuration:

```
packages/white-labeling/src/
├── assets/              # Default images
├── config/              # Default event-config.json
├── locales/             # Translation files
│   ├── en.default.json
│   ├── fr.default.json
│   ├── de.default.json
│   └── it.default.json
├── theme/               # CSS variables
│   └── theme.default.css
├── types/               # TypeScript definitions
│   └── EventConfig.ts
└── store.ts             # Configuration loading logic
```

---

## Key Files Reference

| File                                                  | Purpose                          |
| :---------------------------------------------------- | :------------------------------- |
| `apps/api/database/schema.prisma`                     | Database schema (Prisma)         |
| `apps/api/.env`                                       | Backend environment variables    |
| `apps/web/.env`                                       | Frontend environment variables   |
| `apps/web/public/config/event-config.json`            | Runtime event configuration      |
| `packages/white-labeling/src/theme/theme.default.css` | Default CSS variables            |
| `mkdocs.yml`                                          | Documentation site configuration |
