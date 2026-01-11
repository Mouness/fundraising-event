# Testing Strategy

This project ensures quality through a multi-layered testing strategy combining Unit, Integration, and End-to-End (E2E) tests.

## Overview

| Type            | Scope                                         | Tool                                  | Location                                           |
| :-------------- | :-------------------------------------------- | :------------------------------------ | :------------------------------------------------- |
| **Unit**        | Individual functions, components, services    | [Vitest](https://vitest.dev/)         | `src/**/*.test.ts`, `src/**/*.test.tsx`            |
| **Integration** | Module interactions, API endpoints, Databases | [Vitest](https://vitest.dev/)         | `apps/api/test/`, `apps/web/src/test/integration/` |
| **E2E**         | Full user flows, browser automation           | [Playwright](https://playwright.dev/) | `apps/e2e/`                                        |

---

## 🧪 Unit & Integration Tests

We use **Vitest** for both unit and integration testing due to its speed and Vite compatibility.

### Running Tests

Run all unit/integration tests from the root:

```bash
pnpm test
```

Or for a specific package:

```bash
pnpm --filter api test
pnpm --filter web test
```

### Test Coverage

Generate coverage reports to verify code quality (target: >80%):

```bash
pnpm test:cov
```

### Writing Tests

- **Naming**: `*.test.ts` (logic) or `*.test.tsx` (components).
- **Location**: Co-located with source code (`src/features/my-feature/my-component.test.tsx`) or in `test/` folders for broader integration scenarios.
- **Mocks**: Use `vi.mock()` and `vi.spyOn()` to isolate dependencies.

---

## 🎭 End-to-End (E2E) Testing

We use **Playwright** to test full user journeys against a running application.

### Prerequisites

1. Ensure the application is running (API + Web + DB + Redis).
    ```bash
    pnpm dev
    ```
2. (Optional) Run against a dedicated test environment if configured.

### Running E2E Tests

Run all E2E tests:

```bash
pnpm test:e2e
```

Run in UI Mode (Interactive debugger):

```bash
pnpm test:e2e:ui
```

### Structure (`apps/e2e`)

The E2E suite is a standalone workspace to avoid circular dependencies and keep tests clean.

```
apps/e2e/
├── playbook/         # Reusable behaviors & helpers
├── tests/            # Test specifications
│   ├── admin/        # Admin panel flows (RBAC, Event CRUD)
│   ├── donation/     # Public donation flows
│   └── live/         # Live screen updates
├── playwright.config.ts
└── package.json
```

### Key Helpers

We use "Drivers" or "Page Objects" to abstract UI interactions:

- `BrowserDriver`: Manages browser context and page creation.
- `DonationPageDriver`: Encapsulates interactions with the donation form.
- `DashboardPageDriver`: Encapsulates Admin Dashboard actions.

Example:

```typescript
const page = await browserDriver.createPage()
const donationPage = new DonationPageDriver(page)
await donationPage.navigate('event-slug')
await donationPage.donate(50)
```
