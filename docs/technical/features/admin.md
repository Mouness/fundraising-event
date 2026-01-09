# Admin Dashboard

## Overview

The Admin Dashboard is the central hub for organizers to manage fundraising events, configurations, and staff. It provides high-level analytics and control over the entire platform.

## Key Features

### 1. Dashboard & Analytics

The main landing page provides a real-time snapshot of the platform's performance.

- **Key Metrics**: Total revenue, active events count, and donor statistics.
- **Visuals**: Donation trends over time.
- **Activity Feed**: Live log of incoming donations.
- **Quick Actions**: Create events or export global receipt data.

### 2. Event Management

Complete lifecycle management for fundraising campaigns.

- Create, update, and archive events.
- Configure goals, slugs, and public visibility.
- **Documentation**: [View Events Management →](events.md)

### 3. Global Settings

Platform-wide configuration that applies defaults to all events.

- **Identity**: Organization branding and contact info.
- **Payment**: Stripe/PayPal API keys and currency settings.
- **Theming**: Global CSS overrides.
- **Localization**: Manage supported languages (`en`, `fr`, `de`, `it`).
- **Documentation**: [View Global Settings →](global-settings.md)

### 4. Staff Management

Manage volunteer access for the offline collector app.

- Issue and revoke global PIN codes.
- Track performance per volunteer.
- **Documentation**: [View Staff Management →](staff.md)

### 5. Data & Exports

- **Receipts**: Bulk download of PDF receipts as ZIP files.
- **Donations**: Export all donation records as CSV for external analysis.
- **Format**: Organized by event and date.

---

## Technical Overview

The admin interface is built with a layout-first approach to ensure consistent navigation and security.

- **Layout**: `AdminLayout` handles authentication guards and sidebar navigation.
- **Security**: All admin routes are protected and require a valid JWT.
- **State Management**: Uses React Query for data fetching with optimistic updates for better UX.

**API Endpoints**

| Method | Endpoint       | Description               | Auth  |
| :----- | :------------- | :------------------------ | :---- |
| `GET`  | `/admin/stats` | Get dashboard statistics  | Admin |
| `GET`  | `/admin/me`    | Get current admin details | Admin |

For a complete list of endpoints, see the [API Reference](../api-reference.md).

---

## Related Documentation

- [Global Settings](../features/global-settings.md) - Platform-wide configuration.
- [Events Management](../features/events.md) - Managing fundraising campaigns.
- [Staff Management](../features/staff.md) - Managing volunteers.
