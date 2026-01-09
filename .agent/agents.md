# Agents & Developers Guidelines

This document serves as the primary source of truth for all AI agents and developers working on the **Fundraising Event** project. It outlines the structure, coding standards, boundaries, and tools to ensure consistency and quality.

## 1. Prime Directive (Context Awareness)

**CRITICAL:** Before starting ANY task, you must ensure you have read and understood the contents of the `.agent/` directory:

1.  `.agent/specs.md` - Functional Specifications.
2.  `.agent/agents.md` - Developer Guidelines (This file).
3.  `.agent/AntiGravity.md` - Context/Memory (if present).

## 2. Project Structure

- Always use modular, maintainable and scalable structure for the respective language and framework.
- Always check if a feature is works before moving to the next feature.
    - If a feature is not working, always check the code and try to fix it.
    - Do incremental development or agile workflow.
    - Always check the quality of the code, performance, translation, testing, accessibility, and security before moving to the next feature.
    - Always implement tests for the feature before moving to the next feature.
    - Always implement documentation for the feature before moving to the next feature.
    - Always implement changelog for the feature before moving to the next feature.
- Docs via mkdocs.
- The code should be readable, maintainable and the (cognitive) complexity should be as low as possible.
- SOLID principles should be followed.
- The code should be refactored if it does not follow the SOLID principles.

- The project follows a **Monorepo** structure (using pnpm workspaces) with a clear separation of concerns between Frontend and Backend, while sharing types and utilities where possible.

```bash
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

## 2. Coding Style

### General

- **Language:** TypeScript (Strict Mode enabled).
- **Formatting:** Prettier (default config).
- **Linting:** ESLint (recommended rules).
- **Comments:** Use JSDoc for complex functions. Explain "Why", not "What".
- **Types:** One type per file. Do not export multiple types from a single file (except for index barrels).

### Frontend (React)

- **Components:** Arrow Functions only (`const Component = () => {}`).
- **Organization:** Colocate styles, tests, and sub-components within the feature folder.
- **Hooks:** comprehensive use of custom hooks to separate logic from UI.
- **State:**
    - `Jotai` for global client state (e.g., live counter).
    - `TanStack Query` for server state (caching, loading states).
- **Styling:** **Tailwind CSS v4**.
    - Use utility classes for layout and spacing.
    - Use `class-variance-authority` (cva) for component variants.
    - Avoid inline styles.
    - **Theme:** Use strict CSS variables for theming (primary, secondary colors) to support the White Label requirement.
- **Naming:** PascalCase for components (`DonationForm.tsx`), camelCase for functions/vars.
- **Functions:** Use Arrow Functions (`const myFunc = () => {}`) for all components and utilities. Avoid `function` keyword.

### Backend (NestJS)

- **Architecture:** Modular (Module, Controller, Service).
- **Validation:** DTOs with `class-validator` and `class-transformer`.
- **Database:** Prisma ORM. Use raw SQL only if necessary for performance.
- **Error Handling:** Global Exception Filters. Return standard HTTP codes.
- **Async:** Use `async/await` everywhere. Avoid callback hell.

## 3. Boundaries & Responsibilities

- **Frontend:**
    - **Display Logic Only:** The frontend should not perform complex business calculations (e.g., tax receipt generation).
    - **Optimistic UI:** Allowed for staff entry (offline mode), but must reconcile with server truth.
    - **Secrets:** NEVER store Stripe Secret Keys or Admin tokens in Frontend code/env.

- **Test Coverage:**
    - **Minimum Coverage:** **60%** (CI should fail if below).
    - **Target Coverage:** **80%** (Strive for this in all core modules).

- **Internationalization (i18n):**
    - **No Hardcoded Text:** No label or text should be added directly in the code.
    - **Use Locales:** Always use the locales files (e.g., via `t('key')`).
    - **Bilingual:** Ensure all keys exist in both `en` and `fr` locales.
- **Configuration:**
    - Always use `useAppConfig()` from `@/providers/AppConfigProvider` to access global settings (theme, event info).
    - Do not fetch config manually in components to ensure race-condition-free initialization.

- **Backend:**
    - **Source of Truth:** Calculates totals, validates payments, generates PDFs.
    - **stateless:** The API should remain stateless (use Redis for queues/sockets).
    - **Security:** Responsible for all data validation before DB entry.

- **AI Agents:**
    - **Do not** modify the `lib/` or core architectural folders without explicit instruction.
    - **Always** read `specs.md` before implementing a new feature.
    - **Always** check for existing types/interfaces in `packages/types` (if applicable) before creating duplicates.

## 4. Security

- **Authentication:**
    - **Admin:** JWT (Short lived) + Refresh Token.
    - **Staff:** PIN Code mechanism (Session based).
- **Authorization:** Role Based Access Control (RBAC) via Guards in NestJS.
- **Data Protection:**
    - PII (Personal Identifiable Information) must be treated with care.
    - Encryption at rest for sensitive DB fields if required (though Stripe handles payments).
- **Input Validation:** strict Zod schemas on Frontend, DTO validation on Backend.
- **Git Security:** Never commit secrets, API keys, or `.env` files to the repository. Use `.gitignore` and environment variables.

## 5. Tools to Use

### Core Stack

- **Package Manager:** `pnpm`
- **Frontend:** Vite, React 19, Tailwind CSS v4, Shadcn/UI, Lucide React (Icons).
- **Backend:** NestJS, Fastify (optional, else Express), Socket.io.
- **Database:** PostgreSQL.
- **ORM:** Prisma.
- **Queue/Cache:** Redis, BullMQ.

### Testing

- **Unit:** Vitest (Frontend & Backend).
- **E2E:** Playwright (Frontend flow), Supertest (API).

### DevOps

- **Container:** Docker, Docker Compose.

## 6. Standard Commands

### Package Management

- **Install Dependencies:** `pnpm install` (Root).
- **Add Package:** `pnpm add <package>` (Use `--filter <app>` to target `api` or `web`).

### Development

- **Start All:** `pnpm dev` (Runs both API and Web).
- **Start Backend:** `pnpm --filter api dev`.
- **Start Frontend:** `pnpm --filter web dev`.

### Database (API)

- **Generate Client:** `pnpm db:generate` (Run after schema changes).
- **Migration:** `pnpm db:migrate` (Run for DB schema updates).
- **Studio:** `pnpm db:studio` (GUI for database).
- **Note:** Use `--filter api` if running from the root.

### Docker

- **Start Services:** `docker compose up -d` (Postgres, Redis).
- **Stop Services:** `docker compose down`.

### Testing

- **E2E Tests:** `pnpm test:e2e`.

## 7. Testing Conventions (Strict)

1. **Location**: All test related files must be located in `src/test/`.
2. **Naming**: Test files must use the `*.test.{ts,tsx}` extension. `*.spec.*` is forbidden (except for existing e2e if necessary, but prefer converting).
3. **Mocks**: All mock files/data must be located in `src/mock/`, regardless of usage context.
4. **Scope**: These rules apply to both `apps/web` and `apps/api`.
