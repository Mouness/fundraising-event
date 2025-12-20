# Agents & Developers Guidelines

This document serves as the primary source of truth for all AI agents and developers working on the **Fundraising Event** project. It outlines the structure, coding standards, boundaries, and tools to ensure consistency and quality.

## 1. Prime Directive (Context Awareness)
**CRITICAL:** Before starting ANY task, you must ensure you have read and understood the contents of the `agent/` directory:
1.  `agent/specs.md` - Functional Specifications.
2.  `agent/agents.md` - Developer Guidelines (This file).
3.  `agent/AntiGravity.md` - Context/Memory (if present).

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
- The code should be refactored if it is not following the SOLID principles.

- The project follows a **Monorepo** structure (using pnpm workspaces) with a clear separation of concerns between Frontend and Backend, while sharing types and utilities where possible.

```
fundraising-event/
├── agent/                    # AI Context & Docs
│   ├── agents.md             # Guidelines (This file)
│   ├── specs.md              # Functional Specs
│   └── AntiGravity.md        # Memory/Context
│
├── apps/
│   ├── api/                  # NestJS Backend
│   │   ├── deploy/           # Dockerfile & Deployment Configs
│   │   ├── src/
│   │   │   ├── app.module.ts
│   │   │   ├── main.ts
│   │   │   ├── auth/         # Authentication Module
│   │   │   ├── donation/     # Donation Logic & Webhooks
│   │   │   ├── event/        # Event Management
│   │   │   ├── gateway/      # WebSocket Gateway
│   │   │   ├── prisma/       # Prisma Module (Global)
│   │   │   └── queue/        # BullMQ Jobs
│   │   ├── prisma/           # Database Schema
│   │   ├── test/             # E2E Tests
│   │   └── package.json
│   │
│   └── web/                  # Vite + React Frontend
│       ├── deploy/           # Dockerfile & Nginx Config
│       ├── src/
│       │   ├── app/          # App config, wrappers, router
│       │   ├── assets/       # Static assets
│       │   ├── features/     # Feature-based modules
│       │   │   ├── admin/    # Dashboard components
│       │   │   ├── donation/ # Public donation flow
│       │   │   ├── live/     # Projection screen components
│       │   │   └── staff/    # Collector interface
│       │   ├── shared/       # Reusable UI components & hooks
│       │   ├── lib/          # 3rd party consumers (axios, stripe)
│       │   ├── stores/       # Global state (Jotai)
│       │   └── main.tsx
│       ├── index.html
│       └── package.json
│
├── packages/                 # Shared libraries (Optional)
│   ├── ts-config/
│   ├── ui/                   # Potential shared UI lib
│   └── types/                # Shared DTOs/Interfaces
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

### Frontend (React)
*   **Components:** Functional components only.
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

### Database
*   **Generate Client:** `npx prisma generate` (Run after schema changes).
*   **Migration:** `npx prisma migrate dev --name <migration_name>` (Run for DB schema updates).
*   **Studio:** `npx prisma studio` (GUI for database).

### Docker
*   **Start Services:** `docker compose up -d` (Postgres, Redis).
*   **Stop Services:** `docker compose down`.

### Testing
*   **Run All Tests:** `pnpm test`.
*   **E2E Tests:** `pnpm test:e2e`.
