# Admin Dashboard

## Overview
The Admin Dashboard is the control center for organizers. It provides high-level metrics, event management capabilities, and system oversight.

## Feature Breakdown

### 1. Dashboard Overview
A summary view displaying key performance indicators (KPIs) such as:
- Total Revenue
- Number of Active Events
- Recent Donations Log
- **Export**: Global ZIP export for receipt PDFs.

### 2. Event Management (CRUD)
Allows admins to create, update, and delete fundraising events.
- **Slug Management**: Define the public URL for events.
- **Goal Setting**: Update financial targets.

---

## Implementation Details

### Frontend (`apps/web`)

#### Layout
- **`AdminLayout`** (`apps/web/src/features/admin/layouts/AdminLayout.tsx`):
  - Provides the persistent sidebar navigation and header.
  - Ensures the user is authenticated before rendering children.

#### Pages
#### Pages
- **`DashboardPage`**:
  - Displays high-level stats (Revenue, Recent Activity).
  - **Export Feature**: Triggers `GET /export/receipts/zip` to download all generated receipts.
- **`EventSettingsPage`**:
  - Manages Event Configuration (Name, Goal, Slug).
  - **Theme Customization**: Live preview of Primary Color and Logo URL.
  - **Validation**: Strict Zod schema ensures data integrity before `PATCH /events/:id`.

### Components
- **`DashboardStats`**:
  - Reusable component for displaying metric cards with icons and trends.
- **Refactoring & Quality**:
  - Components heavily utilize strict TypeScript interfaces (e.g., `EventConfig['theme']`).
  - `any` types have been systematically removed.

### Backend (`apps/api`)

#### Endpoints
- **Protected Routes**: All admin routes are guarded by `AuthGuard`.
- **Event Operations**:
  - `POST /events`: Create new event.
  - `PATCH /events/:id`: Update config.
  - `DELETE /events/:id`: Archive event.

## Future Improvements
- **Real-time Admin**: Connect the dashboard to the WebSocket gateway to see donations live in the admin panel too.
- **Export Data**: CSV export for accounting.
