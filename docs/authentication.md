# Identity & Authentication Module

This module handles user authentication and authorization for the Fundraising Event platform.

## Architecture

The authentication system is built using **NestJS** with **Passport** strategies. It supports multiple authentication providers via a pluggable `AuthProvider` interface.

### Core Components

- **AuthService**: Orchestrates authentication logic, validates users/staff, and generates JWTs.
- **AuthController**: Exposes endpoints for login (`/auth/login`, `/auth/staff/login`) and OAuth callbacks.
- **AuthProvider**: Interface for verification logic (Local, Firebase, Auth0).
    - **LocalAuthProvider**: Implements verification using environment variables (Admin) and allows trusted external users.
- **Strategies**:
    - `JwtStrategy`: Validates JWT tokens for protected routes.
    - `GoogleStrategy`: Handles Google OAuth 2.0 flow.
- **Guards**:
    - `JwtAuthGuard`: Protects routes requiring valid JWT.
    - `RolesGuard`: Enforces RBAC (Admin/User/Staff).

## User Roles

1.  **ADMIN**: Full access. Authenticated via Email/Password (Env vars) or trusted Google account.
2.  **STAFF**: access to event-specific tools. Authenticated via unique PIN code.
3.  **USER**: Standard donor/participant (Future scope).

## Frontend Flow

The frontend (`apps/web`) uses:
- **useLogin Hook**: Manages API calls and local storage (token).
- **AuthGuard**: Protects routes by checking token existence and validity (decoded JSON).
- **LoginPage**: Standard login form with Zod validation and i18n.

## Security

- **JWT**: Tokens expire in 1 day. Secrets managed via `JWT_SECRET` env var.
- **Passwords**: 
    - Admin password stored as **Bcrypt Hash** in `ADMIN_PASSWORD` (Env).
    - Staff authentication uses PIN codes stored in DB.
- **OAuth**: Google OAuth 2.0 with restricted scope (`email`, `profile`).

## Configuration

Required Environment Variables:
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL`

### Custom Provider (Auth0)
To enable Auth0 instead of Local Auth:
- Set `AUTH_PROVIDER_TYPE=auth0`
- `AUTH0_DOMAIN` (e.g. `dev-xyz.us.auth0.com`)
- `AUTH0_CLIENT_ID`
- `AUTH0_CLIENT_SECRET` (For verifying credentials)
