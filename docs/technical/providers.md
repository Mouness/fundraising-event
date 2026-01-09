# Providers Integration

This guide details how to configure external providers for **Payment Processing** and **Email Delivery**.

The platform supports a flexible provider system, allowing you to switch between services (e.g., Stripe vs PayPal, SMTP vs Resend) via the **Admin Panel > Global Settings**.

---

## 1. Payment Providers

The platform supports multiple payment gateways. Payment configuration is **strictly global** and cannot be overridden at the event level.

### Configuration Strategy
Payment credentials can be set in two ways, with the Database taking precedence:

1.  **Database (Recommended)**: Configure via **Admin Panel > Global Settings**. This allows runtime updates without redeployment.
2.  **Environment Variables**: Fallback values set in `.env` (useful for initial setup or GitOps flows).

### Stripe
Stripe is the comprehensive payment platform for card payments.

**Why use it**: Industry standard for secure credit card processing, supports Apple Pay/Google Pay, and has global coverage.

**How to Enroll**: [Register for a Stripe account](https://dashboard.stripe.com/register).

**Required Credentials**:

  - **Publishable Key**: Public identifier for frontend elements.
  - **Secret Key**: Backend API key.
  - **Webhook Secret**: Verifies events sent to your webhook endpoint.

**Webhook Configuration**:

  - You must configure a webhook in your Stripe Dashboard.
  - **Endpoint URL**: `https://your-api-domain.com/api/donation/webhook/stripe`
  - **Events to listen for**: `payment_intent.succeeded`, `payment_intent.payment_failed`.

**Environment Fallbacks**:

  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `VITE_STRIPE_PUBLIC_KEY` (Frontend)

### PayPal
PayPal allows donors to pay via their PayPal account.

**Why use it**: Trusted by donors worldwide, offering a familiar alternative to direct card payments.

**How to Enroll**: [Register for a PayPal Developer account](https://developer.paypal.com).

**Required Credentials**:

  - **Client ID**: Public app identifier.
  - **Client Secret**: App secret.
  - **Webhook ID**: ID of the webhook listener.

**Webhook Configuration**:

  - Configure in PayPal Developer Dashboard.
  - **Endpoint URL**: `https://your-api-domain.com/api/donation/webhook/paypal`
  - **Events**: `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`.

**Environment Fallbacks**:

  - `PAYPAL_CLIENT_ID`
  - `PAYPAL_CLIENT_SECRET`
  - `PAYPAL_WEBHOOK_ID`
  - `PAYPAL_SANDBOX` (Set `true` for sandbox mode)

---

## 2. Email Providers

The platform sends transactional emails (receipts) via standard SMTP. We include presets for popular services to simplify usage.

### Gmail
> [!WARNING]
> **Testing Only**. Gmail has low daily rate limits (~500 emails) and strictly blocks standard password auth. Use only for local development.

**Why use it**: Free and immediately available if you have a Google account.

- **Host**: `smtp.gmail.com`
- **Port**: `465` (Secure/SSL)
- **Settings**:
    - **Username**: Your full Gmail address.
    - **Password**: You MUST use an **App Password** if 2-Factor Authentication is enabled (which is standard). Do NOT use your regular login password.
    - [Guide: Sign in with App Passwords](https://support.google.com/accounts/answer/185833)

### Outlook / Office 365
> [!WARNING]
> **Testing Only**. Similar to Gmail, this is best suited for low-volume testing due to strict anti-spam measures.

- **Host**: `smtp.office365.com`
- **Port**: `587` (STARTTLS)
- **Settings**:
    - **Username**: Your email address.
    - **Password**: Create an App Password if using 2FA.

### Resend
> [!TIP]
> **Recommended for Production**.

Resend is a developer-first email platform that works great for transactional emails.

**Why use it**: High deliverability, developer-friendly API, and a generous free tier for low volume.

**How to Enroll**: [Sign up at Resend.com](https://resend.com).

- **Host**: `smtp.resend.com`
- **Port**: `465` (Secure)
- **Settings**:
    - **Username**: `resend` (Literal string)
    - **Password**: Your API Key (starts with `re_`).
    - [Get your API Key](https://resend.com/api-keys)

### Custom SMTP
You can use any other provider (SendGrid, Mailgun, Amazon SES) by selecting "SMTP" and entering their specific host, port, and credentials. Ensure your firewall allows outbound traffic on ports 465 or 587.

---

## 3. Authentication Providers

The platform uses **Auth0** for securing administrative access.

### Auth0
> [!NOTE]
> **Optional**. Auth0 is only required if you wish to secure the `/admin` route. If not configured, the admin panel remains accessible (or handled via your own mechanism).

**Why use it**: Bank-grade security, supports social logins, and is free for up to 7,000 active users.

**How to Enroll**: [Sign up for Auth0](https://auth0.com/signup).

- **Domain**: Your Auth0 tenant domain (e.g., `dev-xyz.us.auth0.com`).
- **Client ID**: The unique application identifier.
- **Client Secret**: The application secret.
- **Audience**: Your API Identifier (e.g., `https://api.fundraising.com`).

#### Configuration Steps
1.  Create a **Regular Web Application** in the Auth0 Dashboard.
2.  **Allowed Callback URLs**: `https://your-domain.com/api/auth/callback`
3.  **Allowed Logout URLs**: `https://your-domain.com`
4.  **Environment Variables**:
    - `AUTH_PROVIDER_TYPE`: `auth0`
    - `AUTH0_ISSUER_URL`: `https://[YOUR_DOMAIN].us.auth0.com/`
    - `AUTH0_AUDIENCE`: `[YOUR_API_IDENTIFIER]`
    - `AUTH0_CLIENT_ID`: `[YOUR_CLIENT_ID]`
    - `AUTH0_CLIENT_SECRET`: `[YOUR_CLIENT_SECRET]`

---

## 4. Local Development & Testing

### Testing Stripe Webhooks
To test Stripe webhooks locally without a public URL, use the **Stripe CLI**.

1.  **Login**: `stripe login`
2.  **Forward Webhooks**:
    ```bash
    # Forward to your local API
    stripe listen --forward-to localhost:3000/api/donation/webhook/stripe
    ```
3.  **Configure Secret**: Use the `whsec_...` secret provided by the CLI in your `.env` as `STRIPE_WEBHOOK_SECRET`.
4.  **Trigger Events**:
    ```bash
    stripe trigger payment_intent.succeeded
    ```

### Testing PayPal Webhooks
PayPal webhooks require a public URL to reach your local machine.

1.  Use a tool like **ngrok** or **Localtunnel** to expose port 3000.
2.  Update your Webhook URL in the PayPal Developer Dashboard to your temporary public URL.
3.  Set `PAYPAL_SANDBOX=true` in your `.env`.
