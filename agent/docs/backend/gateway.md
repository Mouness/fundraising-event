# Gateway Module (WebSocket)

## Overview
The Gateway Module uses Socket.io to enable real-time communication for the "Live Screen" feature.

## Connection
- **Path:** `/socket.io/` (Default)
- **Transport:** WebSocket / Polling

## Events

### Client -> Server
- **`joinEvent`**:
  - **Payload:** `eventId` (string)
  - **Description:** Client requests to join a specific event room to receive real-time updates (donations, goal progress).
  - **Response:** `{ event: 'joined', eventId }`

### Server -> Client
- **`donationReceived`** (Planned): Broadcasted to room `eventId` when a new donation is confirmed.
