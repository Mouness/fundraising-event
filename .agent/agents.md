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
├── agent/                    # AI Context & Docs
│   ├── agents.md             # Guidelines (This file)
│   ├── specs.md              # Functional Specs
│   └── AntiGravity.md        # Memory/Context
│
├── apps/
│   ├── api/                  # NestJS Backend
│   │   ├── database/         # Database Schema & Migrations
│   │   ├── deploy/           # Deployment Config (Docker, etc.)
│   │   ├── src/
│   │   │   ├── database/     # NestJS Database Module
│   │   │   ├── features/     # Feature-based modules
│   │   │   │   ├── auth/     # Auth (JWT, Google OAuth)
│   │   │   │   ├── donation/ # Payments & Stripe logic
│   │   │   │   ├── event-config/ # Centralized Config Loader
│   │   │   │   ├── event/    # Event management
│   │   │   │   ├── gateway/  # WebSockets (Socket.io)
│   │   │   │   ├── pdf/      # PDF Generation (PDFMake)
│   │   │   │   └── queue/    # BullMQ (Email/PDF Jobs)
│   │   │   ├── test/         # Unit & E2E Tests
│   │   │   ├── mock/         # API Mock Data
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   └── package.json
│   │
│   └── web/                  # Vite + React Frontend
│       ├── deploy/           # Deployment Config (Nginx, etc.)
│       ├── public/           # Static Public Assets
│       ├── src/
│       │   ├── app/          # Core App Wrapper/Router
│       │   ├── components/   # UI Primitives (@/components/ui)
│       │   ├── providers/    # React Contexts & Providers
│       │   ├── features/     # Feature-based components
│       │   │   ├── admin/    # Dashboard & Event Config
│       │   │   ├── auth/     # Authentication pages
│       │   │   ├── donation/ # Public Donation Form
│       │   │   ├── event/    # Event Logic & Hooks
│       │   │   ├── live/     # Projection/Live Screen
│       │   │   ├── public/   # Public Static pages
│       │   │   └── staff/    # Producer/Collector Mode
│       │   ├── hooks/        # Reusable React hooks
│       │   ├── lib/          # Config & Utilities (api, i18n, utils)
│       │   ├── stores/       # Global State (Jotai)
│       │   ├── test/         # Frontend Tests
│       │   ├── mock/         # Frontend Mock Data
│       │   └── main.tsx
│       ├── index.html
│       └── package.json
│
├── packages/                 # Shared libraries (Optional)
│   ├── ts-config/
│   ├── ui/                   # Potential shared UI lib
│   ├── types/                # Shared DTOs/Interfaces
│   └── white-labeling/       # White Labeling (Theme, Assets, Config)
│       ├── src/
│       │   ├── assets/       # Default SVGs
│       │   ├── config/       # Default Configurations
│       │   ├── theme/        # Default CSS Variables
│       │   └── store.ts      # Config Store
│
├── docker-compose.yml        # Local dev orchestration
├── package.json              # Root scripts
├── pnpm-workspace.yaml
└── README.md
```

## 2. Coding Style

### General
*   **Language:** TypeScript (Strict Mode enabled).
*   **Formatting:** Prettier (default config).
*   **Linting:** ESLint (recommended rules).
*   **Comments:** Use JSDoc for complex functions. Explain "Why", not "What".
*   **Types:** One type per file. Do not export multiple types from a single file (except for index barrels).

### Frontend (React)
*   **Components:** Arrow Functions only (`const Component = () => {}`).
*   **Organization:** Colocate styles, tests, and sub-components within the feature folder.
*   **Hooks:** comprehensive use of custom hooks to separate logic from UI.
*   **State:**
    *   `Jotai` for global client state (e.g., live counter).
    *   `TanStack Query` for server state (caching, loading states).
*   **Styling:** **Tailwind CSS v4**.
    *   Use utility classes for layout and spacing.
    *   Use `class-variance-authority` (cva) for component variants.
    *   Avoid inline styles.
    *   **Theme:** Use strict CSS variables for theming (primary, secondary colors) to support the White Label requirement.
*   **Naming:** PascalCase for components (`DonationForm.tsx`), camelCase for functions/vars.
*   **Functions:** Use Arrow Functions (`const myFunc = () => {}`) for all components and utilities. Avoid `function` keyword.

### Backend (NestJS)
*   **Architecture:** Modular (Module, Controller, Service).
*   **Validation:** DTOs with `class-validator` and `class-transformer`.
*   **Database:** Prisma ORM. Use raw SQL only if necessary for performance.
*   **Error Handling:** Global Exception Filters. Return standard HTTP codes.
*   **Async:** Use `async/await` everywhere. Avoid callback hell.

## 3. Boundaries & Responsibilities

*   **Frontend:**
    *   **Display Logic Only:** The frontend should not perform complex business calculations (e.g., tax receipt generation).
    *   **Optimistic UI:** Allowed for staff entry (offline mode), but must reconcile with server truth.
    *   **Secrets:** NEVER store Stripe Secret Keys or Admin tokens in Frontend code/env.

*   **Test Coverage:**
    *   **Minimum Coverage:** **60%** (CI should fail if below).
    *   **Target Coverage:** **80%** (Strive for this in all core modules).

*   **Internationalization (i18n):**
    *   **No Hardcoded Text:** No label or text should be added directly in the code.
    *   **Use Locales:** Always use the locales files (e.g., via `t('key')`).

*   **Backend:**
    *   **Source of Truth:** Calculates totals, validates payments, generates PDFs.
    *   **stateless:** The API should remain stateless (use Redis for queues/sockets).
    *   **Security:** Responsible for all data validation before DB entry.

*   **AI Agents:**
    *   **Do not** modify the `lib/` or core architectural folders without explicit instruction.
    *   **Always** read `specs.md` before implementing a new feature.
    *   **Always** check for existing types/interfaces in `packages/types` (if applicable) before creating duplicates.

## 4. Security

*   **Authentication:**
    *   **Admin:** JWT (Short lived) + Refresh Token.
    *   **Staff:** PIN Code mechanism (Session based).
*   **Authorization:** Role Based Access Control (RBAC) via Guards in NestJS.
*   **Data Protection:**
    *   PII (Personal Identifiable Information) must be treated with care.
    *   Encryption at rest for sensitive DB fields if required (though Stripe handles payments).
*   **Input Validation:** strict Zod schemas on Frontend, DTO validation on Backend.
*   **Git Security:** Never commit secrets, API keys, or `.env` files to the repository. Use `.gitignore` and environment variables.

## 5. Tools to Use

### Core Stack
*   **Package Manager:** `pnpm`
*   **Frontend:** Vite, React 19, Tailwind CSS v4, Shadcn/UI, Lucide React (Icons).
*   **Backend:** NestJS, Fastify (optional, else Express), Socket.io.
*   **Database:** PostgreSQL.
*   **ORM:** Prisma.
*   **Queue/Cache:** Redis, BullMQ.

### Testing
*   **Unit:** Vitest (Frontend & Backend).
*   **E2E:** Playwright (Frontend flow), Supertest (API).

### DevOps
*   **Container:** Docker, Docker Compose.

## 6. Standard Commands

### Package Management
*   **Install Dependencies:** `pnpm install` (Root).
*   **Add Package:** `pnpm add <package>` (Use `--filter <app>` to target `api` or `web`).

### Development
*   **Start All:** `pnpm dev` (Runs both API and Web).
*   **Start Backend:** `pnpm --filter api dev`.
*   **Start Frontend:** `pnpm --filter web dev`.

### Database (API)
*   **Generate Client:** `pnpm db:generate` (Run after schema changes).
*   **Migration:** `pnpm db:migrate` (Run for DB schema updates).
*   **Studio:** `pnpm db:studio` (GUI for database).
*   **Note:** Use `--filter api` if running from the root.

### Docker
*   **Start Services:** `docker compose up -d` (Postgres, Redis).
*   **Stop Services:** `docker compose down`.

### Testing
*   **E2E Tests:** `pnpm test:e2e`.

## 7. Testing Conventions (Strict)
1. **Location**: All test related files must be located in `src/test/`.
2. **Naming**: Test files must use the `*.test.{ts,tsx}` extension. `*.spec.*` is forbidden (except for existing e2e if necessary, but prefer converting).
3. **Mocks**: All mock files/data must be located in `src/mock/`, regardless of usage context.
4. **Scope**: These rules apply to both `apps/web` and `apps/api`.
