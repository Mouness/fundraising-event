# Live Projection Screen

## Overview

The Live Screen is the public-facing interface displayed on the projector during the event. It connects to the backend via WebSocket to receive real-time updates of donations.

## Components

### `LivePage`
**Path:** `apps/web/src/features/live/pages/LivePage.tsx`

The main entry point for the projection screen.
- **Route:** `/live/:slug`
- **Features:**
  - Connects to WebSocket using `useLiveSocket`.
  - Displays connection status (Green/Red).
  - Displays the last received donation event (animation placeholder).

## Hooks

### `useLiveSocket`
**Path:** `apps/web/src/features/live/hooks/useLiveSocket.ts`

Manages the `socket.io-client` connection.
- **Connection:** Connects to `API_URL` (default namespace).
- **Events:**
  - Emits `joinEvent` with the event slug upon connection.
  - Listens for `donation` events.
- **State:** Returns `isConnected` boolean and `lastEvent` object.

## Infrastructure

- **Library:** `socket.io-client`.
- **Backend:** Connects to `GatewayGateway` in `apps/api`.
