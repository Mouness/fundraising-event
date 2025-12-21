# Admin Dashboard

## Overview
The Admin Dashboard is the control center for organizers. It provides high-level metrics, event management capabilities, and system oversight.

## Feature Breakdown

### 1. Dashboard Overview
A summary view displaying key performance indicators (KPIs) such as:
- Total Revenue
- Number of Active Events
- Recent Donations Log
- Staff Activity

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
- **`DashboardPage`**:
  - Grid layout using `shadcn/ui` cards.
  - Fetches data from multiple sources (mocked for now, future API integration).

#### Components
- **`DashboardStats`**:
  - Reusable component for displaying metric cards with icons and trends.

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
