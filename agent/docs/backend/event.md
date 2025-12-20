# Event Module

## Overview
The Event Module manages fundraising events. Each event works as an isolated bucket for donations, staff, and settings.

## Data Model
- **Event**: Contains `slug` (unique URL), `name`, `goalAmount`, and `themeConfig` (JSON).

## Endpoints

### Public
- `GET /events`: List all events.
- `GET /events/:slug`: Get details of a specific event (by slug or ID).

### Protected (Admin Only)
- `POST /events`: Create a new event.
- `PATCH /events/:id`: Update an event.
- `DELETE /events/:id`: Delete an event.

## Usage
Events are identified by a `slug` which is used in the public URL (e.g., `fundraising.com/events/gala-2024`).
