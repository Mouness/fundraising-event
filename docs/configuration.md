# Configuration

This project handles configuration through Environment Variables and Static Assets.

## Environment Variables (.env)

### Backend (`apps/api/.env`)

| Variable | Description | Default/Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | Connection string for PostgreSQL | `postgresql://user:pass@localhost:5432/db` |
| `REDIS_URL` | Connection string for Redis | `redis://localhost:6379` |
| `JWT_SECRET` | Secret key for signing JWTs | `secret` |
| `STRIPE_SECRET_KEY` | Stripe Secret Key (Server-side) | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook Secret | `whsec_...` |

### Frontend (`apps/web/.env`)

| Variable | Description | Default/Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | URL of the Backend API | `http://localhost:3000` |
| `VITE_STRIPE_PUBLIC_KEY` | Stripe Publishable Key | `pk_test_...` |

## Event Configuration (Asset)

The application allows runtime configuration for event-specific branding and settings without recompilation.

**Location**: `apps/web/public/config/event-config.json`

### Structure (`EventConfig`)

```json
{
    "id": "evt_123",
    "theme": {
        "primaryColor": "#ec4899",
        "secondaryColor": "#8b5cf6",
        "logoUrl": "https://example.com/logo.png"
    },
    "content": {
        "title": "Winter Gala 2025",
        "totalLabel": "Funds Raised",
        "goalAmount": 10000
    },
    "features": {
        "phone": { "enabled": true, "required": true },
        "message": { "enabled": true, "required": false },
        "anonymous": { "enabled": true, "required": false }
    }
}
```

- **theme**: Customizes colors and logo.
- **content**: Text labels and goal amounts.
- **features**: Toggles form fields on the donation page.
