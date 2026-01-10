# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- **Auth Module:**
    - Implemented Admin Login endpoint (`/auth/login`) with JWT support.
    - Implemented Staff Login endpoint (`/auth/staff/login`) with PIN code validation.
    - Implemented Google OAuth2 Login (`/auth/google`) for Admin SSO.
    - Added Unit and E2E Tests for Authentication flows.
- **Live Screen:**
    - Implemented `/live/:slug` route for public projection.
    - Added `socket.io-client` integration.
    - Created `useLiveSocket` hook for real-time updates.
    - Added `LivePage` with connection status indicator.
    - Added multiple gauge styles (Classic, Circular, Minimal) with customization.
    - Added support for multiple Live themes (Modern, Elegant, Classic).
    - Added layout and gauge selection in Event Settings.
- **Event Module:**
    - Implemented CRUD endpoints for Events (`/events`).
    - Added `EventService` and `EventController` with Unit and E2E Tests.
    - Moved Payment Provider keys (Stripe, PayPal) to database (`EventConfig`) for Admin UI configuration.
- **Donation Flow:**
    - Implemented Stripe integration.
    - Backend: `DonationModule`, `StripeService`, Webhooks.
    - Frontend: `/donate` page, Stripe Elements form.
- **Gateway Module:**
    - Initialized WebSocket Gateway (`GatewayGateway`) with Socket.io.
    - Added `joinEvent` subscription for real-time rooms.
    - Added Unit Tests for Gateway connection and event handling.
- **Infrastructure:**
    - Initial Monorepo Structure (NestJS + React).
    - Created `PrismaModule` for global database access.
    - Setup `Vitest` for backend testing (replacing Jest).
    - Restructured project: moved agent docs to `agent/` and Dockerfiles to `deploy/`.
    - Docker Environment (Postgres + Redis).
    - Shared DTOs package.
    - Optimized API Docker image for smaller footprint.
- **Docs:**
    - Added backend documentation in `agent/docs/backend/`.
    - Added GitHub Pages publishing workflow.
- **UI/UX & Internationalization:**
    - Implemented full i18n support for frontend.
    - Normalized CSS variable names (e.g., `*-color` to `*-text`) for consistent theming.
    - Enhanced Donation list to show update timestamps ("Updated [time] ago").
    - Simplified Header UI (icon-only logout).
    - Removed hardcoded text from dashboard and login pages.
