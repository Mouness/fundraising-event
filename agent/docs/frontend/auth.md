# Frontend Authentication

## Overview

The authentication module managers Admin access via JWT and Staff access via PIN codes.

## Components

### `LoginPage`
**Path:** `apps/web/src/features/auth/pages/LoginPage.tsx`

The Login Page provides the UI for Admin authentication. It utilizes the `useLogin` hook to separate business logic from the view.

- **Features:**
  - Email/Password Form (Zod Validation).
  - Google SSO Link.
  - error handling display.

## Hooks

### `useLogin`
**Path:** `apps/web/src/features/auth/hooks/useLogin.ts`

Custom hook that handles the login process.

- **Responsibility:**
  - Calls `POST /auth/login`.
  - Stores `token` and `user` in `localStorage`.
  - Configures default `api` header (via `api.ts` interceptor logic).
  - Redirects to `/admin` on success.

## State Management

Authentication state is primarily managed via `localStorage` for persistence and the `api.ts` interceptor ensuring the Bearer token is attached to requests.
