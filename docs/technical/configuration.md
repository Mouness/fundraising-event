# Configuration

This project handles configuration through Environment Variables and Static Assets.

## Environment Variables (.env)

### Backend (`apps/api/.env`)

| Variable                | Description                                  | Default/Example                            |
| :---------------------- | :------------------------------------------- | :----------------------------------------- |
| `ADMIN_EMAIL`           | Email for the default admin account          | `admin@example.com`                        |
| `ADMIN_PASSWORD`        | Argon2 hash of the admin password            | `(Managed via script)`                     |
| `DATABASE_URL`          | Connection string for PostgreSQL             | `postgresql://user:pass@localhost:5432/db` |
| `REDIS_HOST`            | Redis Hostname                               | `localhost`                                |
| `REDIS_PORT`            | Redis Port                                   | `6379`                                     |
| `JWT_SECRET`            | Secret key for signing JWTs                  | `secret`                                   |
| `STRIPE_SECRET_KEY`     | Stripe Secret Key (Environment Fallback)     | `sk_test_...`                              |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook Secret (Environment Fallback) | `whsec_...`                                |
| `PAYPAL_CLIENT_ID`      | PayPal Client ID (Environment Fallback)      | `...`                                      |
| `PAYPAL_CLIENT_SECRET`  | PayPal Client Secret (Environment Fallback)  | `...`                                      |
| `PAYPAL_WEBHOOK_ID`     | PayPal Webhook ID (Environment Fallback)     | `...`                                      |
| `PAYPAL_SANDBOX`        | Enable PayPal Sandbox (Environment Fallback) | `true`                                     |

> [!NOTE]
> **Global Settings & Database Configuration**
>
> Payment provider credentials can also be configured directly in the **Admin Panel > Global Settings**.
>
> - Settings configured in the database **take precedence** over these environment variables.
> - Environment variables act as **default fallbacks** if no database configuration is present.
>
> For detailed provider-specific setup (webhooks, keys, etc.), see the **[Providers Integration](providers.md)** guide.

### Managing Admin Password

The `ADMIN_PASSWORD` variable stores a secure Argon2 hash. **Do not manually set this to a plain text password in production.**

To set or update the admin password, use the provided helper script:

```bash
pnpm --filter api set-admin-password <your-new-password>
```

**Note:** This script automatically handles:

1.  **Hashing**: Generates a secure Argon2id hash.
2.  **Docker Compatibility**: Escapes `$` characters as `$$` for the root `.env` file (used by Docker Compose) to prevent variable interpolation issues.
3.  **Local Development**: Sets the raw hash in `apps/api/.env` for local usage.

### Frontend (`apps/web/.env`)

| Variable                 | Description                                                            | Default/Example         |
| :----------------------- | :--------------------------------------------------------------------- | :---------------------- |
| `VITE_API_URL`           | Base URL for API requests. In production, this points to your backend. | `/api`                  |
| `VITE_API_TARGET`        | **Development Only**: Proxy target for the Vite dev server.            | `http://localhost:3000` |
| `VITE_STRIPE_PUBLIC_KEY` | Stripe Publishable Key                                                 | `pk_test_...`           |

## Event Configuration (Asset)

The application allows runtime configuration for event-specific branding and settings without recompilation.

**Location**: `apps/web/public/config/event-config.json`

### Structure & Reference

The `event-config.json` file follows the `EventConfig` schema, which includes settings for:

- **Identity**: Event name, slug, and goal.
- **Theme**: Visual assets (logos, backgrounds) and CSS variable overrides.
- **Features**: Configuration for Donation, Live Screen, and Communication modules.

> [!TIP]
> **Complete Reference**
>
> For the full structure, TypeScript definitions, and property reference, please consult the **[White-Labeling Documentation](white-labeling.md#1-configuration-json)**.
