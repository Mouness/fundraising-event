# Public Landing Pages

The public landing pages serve as the main entry point for donors and visitors. They are designed to be high-performance, accessible, and secure, ensuring that only active fundraising data is exposed.

## Architecture

The public feature is located in `apps/web/src/features/public` and consists of two main pages:

1.  **Landing Page** (`/` or `/:slug`): The specific campaign page.
2.  **Root Landing Page** (`/`): The aggregate page listing all active campaigns (if enabled).
3.  **Not Found Page** (`*`): Custom 404 error page.

### Components

To maintain modularity, key UI elements have been extracted:

- **`FeatureCard`**: Displays feature highlights (Impact, Community, etc.) on the landing page.
- **`PublicEventCard`**: Renders individual event summaries on the root listing page.
- **`LandingBackground`**: Manages the visual background effects (blobs/noise).

## Data Access & Security

Security is critical for public pages to preventing exposure of draft or private events.

### API Endpoints

- **`GET /events`**: **RESTRICTED**. Now requires authentication (Admin/Staff) and returns all events including drafts.
- **`GET /events/public`**: **PUBLIC**. Returns only events with `status: 'active'`. It aggregates donation stats for these events but filters out sensitive internal data.

### Frontend Hooks

- **`usePublicEvents`**: Explicitly calls the `/events/public` endpoint. Used by `RootLandingPage` to ensure it never attempts to fetch restricted data or expose drafts.

## Internationalization

All public-facing text is localized using `react-i18next`. Keys are organized under `landing.*` and `root_landing.*` in `en.default.json` and `fr.default.json`.
