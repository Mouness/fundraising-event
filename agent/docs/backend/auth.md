# Authentication Module

## Overview
The Auth Module handles authentication for two types of users:
1.  **Admins**: Authenticated via Email/Password (Development) or External Provider (Production), returning a JWT.
2.  **Staff**: Authenticated via a simplified 4-digit PIN code, returning a Session Token (JWT).

## Endpoints

### Admin Login
- **URL:** `POST /auth/login`
- **Body:**
  ```json
  {
    "email": "admin@example.com",
    "password": "password"
  }
  ```
- **Response:**
  ```json
  {
    "accessToken": "ey...",
    "user": { "id": "...", "role": "ADMIN" }
  }
  ```

### Staff Login
- **URL:** `POST /auth/staff/login`
- **Body:**
  ```json
  {
    "code": "1234"
  }
  ```
- **Response:**
  ```json
  {
    "accessToken": "ey...",
    "user": { "id": "...", "role": "STAFF", "eventId": "..." }
  }
  ```

### Google Login (OAuth2)
- **URL:** `GET /auth/google`
- **Description:** Initiates standard Google OIDC flow.
- **Callback:** `GET /auth/google/callback`
- **Response:**
  ```json
  {
    "accessToken": "ey...",
    "user": { "id": "admin", "email": "admin@example.com", "role": "ADMIN" }
  }
  ```
- **Configuration:** Requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`.

## Security
- **JWT Strategy:** Validates the `Authorization: Bearer <token>` header.
- **Guards:** `AuthGuard('jwt')` protects routes.
