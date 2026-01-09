# Authentication Feature

## Overview
The Authentication feature manages secure access to the platform for two distinct user types:
1.  **Admins**: Full access to the dashboard via Email/Password or OAuth (Google).
2.  **Staff**: Limited access via a simplified PIN code system for POS support.

## Feature Breakdown

### 1. Admin Authentication
Admins utilize a standard login flow to access the `DashboardPage`.
- **Frontend**: `LoginPage.tsx` (Form with Email/Password + Google Button).
- **Backend**: `AuthService` validates credentials and issues a JWT.
- **Security**: Accounts are protected by argon2 password hashing or OAuth2 provider validation. The initial admin password must be set via the `set-admin-password` script (see [Configuration](../configuration.md)).

### 2. Staff Authentication
Staff members use a simplified flow optimized for quick access on shared devices.
- **Frontend**: Specialized PIN entry screen (`apps/web/src/features/staff/pages/CollectorPage.tsx`).
- **Backend**: `AuthService` matches the event-specific PIN code.
- **Context**: Used primarily for connecting terminals or POS devices.

---

## Implementation Details

### Frontend (`apps/web`)

#### Components
- **`LoginPage`** (`apps/web/src/features/auth/pages/LoginPage.tsx`):
  - **Form Management**: Uses `react-hook-form` integrated with `zod` for strict schema validation (`email`, `password`).
  - **UI**: Built with `shadcn/ui` Card and Input components.
  - **Feedback**: Displays real-time validation errors and API error messages.

#### Hooks
- **`useLogin`** (`apps/web/src/features/auth/hooks/useLogin.ts`):
  - **API Integration**: Calls `POST /auth/login` via the centralized `api` client.
  - **Error Handling**: Uses `isAxiosError` to parse backend exception messages safely.
  - **Session**: Persists `accessToken` and `user` object to `localStorage`.
  - **Navigation**: Redirects to `/admin` on success.

### Backend (`apps/api`)

#### Endpoints
- **`POST /auth/login`**: Authenticate Admin.
  - **Body**: `{ "email": "...", "password": "..." }`
  - **Response**: `{ "accessToken": "ey...", "user": { ... } }`
- **`POST /auth/staff/login`**: Authenticate Staff.
  - **Body**: `{ "code": "1234" }`
  - **Response**: `{ "accessToken": "ey...", "user": { "role": "STAFF" } }`
- **`GET /auth/google`**: Start OAuth2 flow.

#### Security Strategy
- **JWT Strategy**: All protected routes use `Guards` that verify the `Authorization: Bearer <token>` header.
- **Guards**: `AuthGuard('jwt')` is the standard NestJS guard used across controllers.

## Data Flow

```mermaid
sequenceDiagram
    participant User
    participant LoginPage
    participant useLogin
    participant API
    participant AuthService

    User->>LoginPage: Enters Credentials
    LoginPage->>useLogin: login({ email, password })
    useLogin->>API: POST /auth/login
    API->>AuthService: validateUser()
    AuthService-->>API: User Object (if valid)
    API->>AuthService: login(user) -> Generate JWT
    API-->>useLogin: { accessToken, user }
    useLogin->>LoginPage: Success
    LoginPage->>User: Redirect /admin

---

## Related Documentation

- [Staff Authentication](../features/staff.md) - Simplified PIN login for collectors.
- [Admin Dashboard](../features/admin.md) - Where admins manage users and events.
```
