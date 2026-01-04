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
| `PAYPAL_CLIENT_ID` | PayPal Client ID | `...` |
| `PAYPAL_CLIENT_SECRET` | PayPal Client Secret | `...` |
| `PAYPAL_WEBHOOK_ID` | PayPal Webhook ID | `...` |
| `PAYPAL_SANDBOX` | Enable PayPal Sandbox | `true` |

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
        "variables": {
             "--primary": "#ec4899",
             "--radius": "0.5rem"
        },
        "assets": {
             "logoUrl": "https://example.com/logo.png",
             "backgroundLive": "https://example.com/live-bg.jpg"
        }
    },
    "content": {
        "title": "Winter Gala 2025",
        "totalLabel": "Funds Raised",
        "goalAmount": 10000
    },
    "communication": {
        "legalName": "My Charity Foundation",
        "address": "123 Charity Lane",
        "email": { "enabled": true, "subjectLine": "Your Receipt" },
        "pdf": { "enabled": true, "templateStyle": "formal" }
    },
    "donation": {
        "form": {
            "phone": { "enabled": true, "required": true },
            "message": { "enabled": true, "required": false },
            "anonymous": { "enabled": true, "required": false }
        },
        "payment": { "provider": "stripe" }
    },
    "settings": {
        "enableLiveConfetti": true,
        "enableLeaderboard": false
    },
    "locales": {
        "en.donation.title": "Give Generously",
        "fr.donation.title": "Donnez Généreusement"
    }
}
```

### Configuration Reference

| Property | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier for the event. |
| `theme.variables` | `Record<string, string>` | Map of CSS variable overrides (e.g. `--primary`, `--radius`). |
| `theme.assets` | `Record<string, string>` | Map of asset URLs (e.g. `logoUrl`, `backgroundLive`). |
| `content.title` | `string` | Main title of the event displayed in the header. |
| `content.totalLabel` | `string` | Label for the total raised amount (e.g. "Total Raised"). |
| `content.goalAmount` | `number` | Fundraising goal amount in dollars. |
| `donation.form.phone` | `{ enabled, required }` | Toggle to collect donor phone number. |
| `donation.form.message` | `{ enabled, required }` | Toggle to collect donor message/comment. |
| `donation.form.anonymous` | `{ enabled, required }` | Toggle to allow anonymous donations. |
| `donation.sharing.enabled` | `boolean` | Enable social media sharing on Thank You page. |
| `donation.sharing.networks` | `string[]` | List of enabled networks (`facebook`, `twitter`, `linkedin`). |
| `donation.payment.provider` | `string` | Payment provider code (currently `stripe`). |
| `donation.payment.config` | `Record` | Provider-specific configuration (e.g. public keys). |
| `communication.legalName` | `string` | Legal organization name for receipts. |
| `communication.address` | `string` | Organization address for receipts. |
| `communication.website` | `string` | Organization website URL. |
| `communication.supportEmail` | `string` | Contact email for support inquiries. |
| `communication.pdf.enabled` | `boolean` | Enable PDF receipt generation. |
| `communication.pdf.footerText` | `string` | Custom footer text for PDFs. |
| `communication.pdf.templateStyle` | `'minimal' \| 'formal'` | Visual style template for PDF receipts. |
| `communication.email.enabled` | `boolean` | Enable automated email receipts. |
| `communication.email.subjectLine` | `string` | Custom subject line for receipt emails. |
| `communication.email.footerText` | `string` | Custom footer text for emails. |
| `settings` | `Record` | Generic feature flags (e.g. `enableLiveConfetti`). |
| `locales` | `Record<string, string>` | Flat-map of translation key overrides (e.g. `"en.donation.title": "Give Now"`). |
