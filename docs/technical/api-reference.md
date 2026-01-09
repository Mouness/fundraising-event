# API Reference

This document provides a comprehensive reference for all REST API endpoints and WebSocket events.

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: Configured via `VITE_API_URL`

## Authentication

All protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Login (Admin)

```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "secret"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "usr_123",
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}
```

### Login (Staff)

```http
POST /auth/staff/login
Content-Type: application/json

{
  "code": "1234",
  "eventId": "evt_123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "staff_123",
    "name": "John Volunteer",
    "role": "STAFF",
    "eventId": "evt_abc"
  }
}
```

### Google OAuth

```http
GET /auth/google
```

Initiates OAuth 2.0 flow. Callback handled at `/auth/google/callback`.

---

## Events Endpoints

### List Events (Admin/Staff)

```http
GET /events
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "evt_123",
    "slug": "winter-gala-2025",
    "name": "Winter Gala 2025",
    "goalAmount": 50000,
    "status": "active",
    "createdAt": "2025-01-01T00:00:00Z"
  }
]
```

### List Public Events

```http
GET /events/public
```

Returns only `active` events with aggregated stats.

**Response:**
```json
[
  {
    "slug": "winter-gala-2025",
    "name": "Winter Gala 2025",
    "goalAmount": 50000,
    "totalRaised": 25000,
    "donorCount": 150
  }
]
```

### Get Event by Slug

```http
GET /events/:slug
```

**Response:**
```json
{
  "id": "evt_123",
  "slug": "winter-gala-2025",
  "name": "Winter Gala 2025",
  "date": "2025-12-15T19:00:00Z",
  "description": "Annual charity gala",
  "goalAmount": 50000,
  "status": "active"
}
```

### Create Event

```http
POST /events
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Summer Fundraiser",
  "slug": "summer-2025",
  "goalAmount": 25000
}
```

### Update Event

```http
PATCH /events/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "goalAmount": 30000,
  "status": "active"
}
```

### Delete Event

```http
DELETE /events/:id
Authorization: Bearer <token>
```

### Get Event Staff

```http
GET /events/:id/staff
Authorization: Bearer <token>
```

Returns list of staff members assigned to the event.

### Assign Staff to Event

```http
POST /events/:id/staff/:staffId
Authorization: Bearer <token>
```

### Unassign Staff from Event

```http
DELETE /events/:id/staff/:staffId
Authorization: Bearer <token>
```

---

## Donation Endpoints

### List Donations

```http
GET /donations?eventId=evt_123&status=COMPLETED&limit=50&offset=0
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Description |
|:---|:---|:---|
| `eventId` | string | Filter by event |
| `status` | string | Filter by status (PENDING, COMPLETED, FAILED, CANCELLED, REFUNDED) |
| `search` | string | Search by donor name or email |
| `limit` | number | Number of results (default: 50) |
| `offset` | number | Pagination offset (default: 0) |

### Export Donations CSV

```http
GET /donations/export?eventId=evt_123
Authorization: Bearer <token>
```

Returns a CSV file with donation data.

### Create Payment Intent

```http
POST /donations/intent
Content-Type: application/json

{
  "amount": 5000,
  "currency": "eur",
  "metadata": {
    "eventId": "evt_123",
    "donorName": "John Doe",
    "donorEmail": "john@example.com"
  }
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_yyy"
}
```

### Stripe Webhook

```http
POST /donations/stripe/webhook
Stripe-Signature: <signature>
```

Handled internally. Validates `payment_intent.succeeded` events.

### PayPal Webhook

```http
POST /donations/paypal/webhook
```

Handles `CHECKOUT.ORDER.COMPLETED` events.

### Record Offline Donation (Staff)

```http
POST /donations
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 5000,
  "eventId": "evt_123",
  "type": "cash",
  "donorName": "John Doe",
  "donorEmail": "john@example.com"
}
```

### Update Donation

```http
PATCH /donations/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "donorName": "Jane Doe",
  "donorEmail": "jane@example.com",
  "isAnonymous": false,
  "message": "Updated message"
}
```

### Cancel Donation

```http
POST /donations/:id/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "shouldRefund": true
}
```

---

## Staff Endpoints

### List Staff Members

```http
GET /staff
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "staff_123",
    "code": "1234",
    "name": "John Volunteer",
    "createdAt": "2025-01-01T00:00:00Z"
  }
]
```

### Get Staff Member

```http
GET /staff/:id
Authorization: Bearer <token>
```

### Create Staff Member

```http
POST /staff
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Volunteer",
  "code": "5678"
}
```

### Update Staff Member

```http
PUT /staff/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Updated"
}
```

### Delete Staff Member

```http
DELETE /staff/:id
Authorization: Bearer <token>
```

---

## Export Endpoints

### Export Receipts (ZIP)

```http
GET /export/receipts/zip?eventId=evt_123
Authorization: Bearer <token>
```

Returns a ZIP file containing PDF receipts for all completed donations.

### Get Single Receipt

```http
GET /export/receipts/:id
Authorization: Bearer <token>
```

Returns a PDF file for a single donation receipt.

---

## Settings Endpoints

### Get Global Settings

```http
GET /settings/global
```

Returns the global configuration (organization, theme, locales).

### Update Global Settings

```http
PATCH /settings/global
Authorization: Bearer <token>
Content-Type: application/json

{
  "organization": "My Foundation",
  "payment": {
    "currency": "EUR"
  }
}
```

### Get Event Settings

```http
GET /events/:slug/settings
```

Returns merged configuration for a specific event (global + event overrides).

### Update Event Branding

```http
PATCH /events/:id/branding
Authorization: Bearer <token>
Content-Type: application/json

{
  "assets": {
    "logo": "https://example.com/logo.png"
  },
  "themeVariables": {
    "--primary": "#ff5500"
  }
}
```

### Reset Event Branding

```http
DELETE /events/:id/branding
Authorization: Bearer <token>
```

Removes all event-specific overrides, reverting to global settings.

---

## Health Check

### Check API Health

```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "memory_heap": { "status": "up" },
    "redis": { "status": "up" }
  }
}
```

---

## WebSocket Events

The WebSocket server uses **Socket.IO** and runs on the same port as the API.

### Connection

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  withCredentials: true
});
```

### Client → Server Events

| Event | Payload | Description |
|:---|:---|:---|
| `joinEvent` | `eventId: string` | Subscribe to event room |

```javascript
socket.emit('joinEvent', 'evt_123');
```

### Server → Client Events

| Event | Payload | Description |
|:---|:---|:---|
| `donation.created` | `DonationEventPayload` | New donation received |

```typescript
interface DonationEventPayload {
  id: string;
  eventId: string;
  amount: number;      // in cents
  donorName: string;   // "Anonymous" if hidden
  message?: string;
  createdAt: string;
}
```

```javascript
socket.on('donation.created', (donation) => {
  console.log(`${donation.donorName} donated ${donation.amount / 100}€`);
});
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

| Status Code | Description |
|:---|:---|
| `400` | Bad Request - Invalid input |
| `401` | Unauthorized - Missing/invalid token |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not Found - Resource doesn't exist |
| `429` | Too Many Requests - Rate limited |
| `500` | Internal Server Error |

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Default**: 100 requests per minute per IP
- **Auth endpoints**: 10 requests per minute per IP
- **Webhooks**: Unlimited (verified by signature)

Exceeded limits return `429 Too Many Requests`.
