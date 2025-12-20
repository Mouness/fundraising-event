# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Auth Module:**
    - Implemented Admin Login endpoint (`/auth/login`) with JWT support.
    - Implemented Staff Login endpoint (`/auth/staff/login`) with PIN code validation.
    - Implemented Google OAuth2 Login (`/auth/google`) for Admin SSO.
    - Added Unit and E2E Tests for Authentication flows.
- **Event Module:**
    - Implemented CRUD endpoints for Events (`/events`).
    - Added `EventService` and `EventController` with Unit and E2E Tests.
- **Gateway Module:**
    - Initialized WebSocket Gateway (`GatewayGateway`) with Socket.io.
    - Added `joinEvent` subscription for real-time rooms.
    - Added Unit Tests for Gateway connection and event handling.
- **Infrastructure:**
    - Created `PrismaModule` for global database access.
    - Setup `Vitest` for backend testing (replacing Jest).
    - Restructured project: moved agent docs to `agent/` and Dockerfiles to `deploy/`.
- **Docs:**
    - Added backend documentation in `agent/docs/backend/`.

### Changed
- Refactored `PrismaService` to be a standalone module to fix dependency injection in tests.
- Updated `agents.md` with "Prime Directive" for context awareness.

### Added
- Initial Monorepo Structure (NestJS + React).
- Docker Environment (Postgres + Redis).
- Backend Core: Auth Module (JWT + PIN), Event Module (CRUD), Gateway Module (Socket.io).
- Shared DTOs package.
