# Developer Cookbook & Getting Started

Welcome to the **Fundraising Event** developer guide. This cookbook provides practical recipes to get you up and running, customize the platform, and troubleshoot common issues.

## 🥘 Prerequisites

Before cooking, ensure you have the following ingredients: - **Node.js**: v20+ (managed via `pnpm`) - **Docker**: For PostgreSQL and Redis services - **pnpm**: Install via `npm install -g pnpm`

---

## Useful Links

- **Repository**: [github.com/Mouness/fundraising-event](https://github.com/Mouness/fundraising-event)
- **Issues**: [github.com/Mouness/fundraising-event/issues](https://github.com/Mouness/fundraising-event/issues)
- **Pull Requests**: [github.com/Mouness/fundraising-event/pulls](https://github.com/Mouness/fundraising-event/pulls)
- **Online Documentation**: [Mouness.github.io/fundraising-event](https://Mouness.github.io/fundraising-event/)

## 🧪 Running Tests

For detailed instructions on Unit, Integration, and E2E testing, see the [Testing Strategy](testing.md) guide.

### Quick Commands

- Unit Tests: `pnpm test`
- Test Coverage: `pnpm test:cov`
- E2E Tests: `pnpm test:e2e` (Requires running app)

---

## 🚀 Recipe 1: The Quick Start (Local Dev)

**Goal**: Run the full stack (API + Database + Frontend) on your machine.

1.  **Clone & Install**

    ```bash
    git clone https://github.com/your-org/fundraising-event.git
    cd fundraising-event
    pnpm install
    ```

2.  **Environment Config**
    - Copy `.env.example` to `.env` in `apps/api` and `apps/web`.
    - _Tip_: The default values work out-of-the-box for local docker services.
    - _Note_: Production settings (Stripe/PayPal keys) can also be configured securely in the **Admin Panel**.

3.  **Start Infrastructure**
    Launch Postgres and Redis:

    ```bash
    docker compose --profile infra up -d
    ```

4.  **Initialize Database**
    Push the schema to your local Postgres:

    ```bash
    pnpm prisma migrate dev
    ```

5.  **Set Admin Password**
    Create the initial admin password (hashed):

    ```bash
    pnpm --filter api set-admin-password "StrongPassword123!"
    ```

6.  **Serve code!**
    Start both API (port 3000) and Web (port 5173):

    ```bash
    pnpm dev
    ```

    > **Success!** Visit [http://localhost:5173](http://localhost:5173) and login with `admin@example.com` / `StrongPassword123!`.

    ### Alternative: Full Docker Stack

    If you prefer to run everything (API, Web, DB, Redis) in Docker:

    ```bash
    # Starts Infrastructure (db, redis) AND Application (api, web)
    docker compose --profile application up --build -d
    ```

    _Note: The web app will run on port **8080** in this mode._

---

## 🎨 Recipe 2: Customizing the Theme

**Goal**: Change the brand colors for a specific client.

1.  **Log in to Admin Dashboard**.
2.  Go to **Global Settings** > **Brand Design**.
3.  Use the color pickers (or use [HTML Color Codes](https://htmlcolorcodes.com/)) to get the Hex color codes:
    - `Primary Color` (`--primary`): Main buttons and links.
    - `Radius` (`--radius`): Roundness of cards and inputs.
4.  **Click Save**.
5.  _Refresh_: The changes apply instantly across the platform (Live Page, Donation Form, Admin Panel).

---

## 🎫 Recipe 3: Creating an Event

**Goal**: Set up a "Winter Gala" fundraiser.

1.  **Navigate to Events** > **Create Event**.
2.  **Basics**:
    - Name: `Winter Gala 2025`
    - Slug: `winter-gala` (URL will be `.../events/winter-gala`)
    - Goal: `50000` (50k currency units)
3.  **Configuration**:
    - Go to **Live Screen Settings**.
    - Select **Elegant Theme** (Best for Galas).
    - Choose **Vertical Gauge**.
4.  **Payment (Optional)**:
    - Go to **Global Settings > Payment**.
    - Ensure Stripe/PayPal keys are set if not using Environment Variables.
5.  **Launch**:
    - Set Status to `Active`.
    - Open `http://localhost:5173/events/winter-gala/live` on the projector.

---

## 🛠️ Troubleshooting (The "Fix-it" Menu)

### Problem: `Connection refused` (Database)

**Symptoms**: API fails to start with Prisma Client initialization error.

**Solution**:

1. Check Docker status: `docker ps`
2. If distinct container is missing: `docker-compose up -d`
3. Verify port 5432 is not occupied by another Postgres instance on your machine.

### Problem: Invalid Credentials / Login Failed

**Symptoms**: You forgot the admin password or the initial password doesn't work.

**Solution**:

1. Run the password reset command:
    ```bash
    pnpm --filter api set-admin-password "NewStrongPassword123!"
    ```
2. Restart the API server (`pnpm dev` or `docker compose restart api`).

### Problem: Missing Translations (Keys showing)

**Symptoms**: You see text like `donation.title` or `admin.header` instead of real words.

**Solution**:

1. This often happens if the `white-labeling` package was updated but not rebuilt.
2. Stop the dev server.
3. Run: `pnpm build --filter @fundraising/white-labeling`
4. Start dev server again: `pnpm dev`.

### Problem: Prisma Client not initialized

**Symptoms**: Error `Error: @prisma/client did not initialize yet.`

**Solution**:

1. This means the generated client code is out of sync with your schema.
2. Run: `pnpm prisma generate`
3. Restart the API server.

### Problem: `PaymentIntent` fails in Webhook

**Symptoms**: Logs show "Webhook Error: No signature found".

**Solution**:

1. Ensure `stripe listen` is running.
2. Verify `STRIPE_WEBHOOK_SECRET` in `apps/api/.env` matches the CLI output (`whsec_...`).

### Problem: Staff Interface shows "Offline"

**Symptoms**: Red indicator in top right corner.

**Solution**:

1. Check browser network tab.
2. Verify `VITE_API_URL` in `apps/web/.env` defaults to `http://localhost:3000/api`.
3. Ensure CORS allowed origin in `apps/api/.env` includes `http://localhost:5173`.

---

## 📚 Common Commands

| Command                                           | Action                         |
| :------------------------------------------------ | :----------------------------- |
| `docker compose --profile infra up -d`            | Start DB & Redis               |
| `docker compose --profile application up --build` | Start Full Stack (Infra + App) |
| `pnpm dev`                                        | Start dev servers              |
| `pnpm build`                                      | Build for production           |
| `pnpm test`                                       | Run unit tests                 |
| `pnpm lint`                                       | Fix linting issues             |
| `pnpm prisma studio`                              | Open Database GUI              |
