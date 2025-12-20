# Admin Dashboard

## Overview

The Admin Dashboard provides a high-level view of the fundraising event's performance.

## Components

### `DashboardPage`
**Path:** `apps/web/src/features/admin/pages/DashboardPage.tsx`

The main container for the dashboard. It orchestrates the layout of statistics and charts.

### `DashboardStats`
**Path:** `apps/web/src/features/admin/components/DashboardStats.tsx`

A presentational component responsible for rendering the top-level metric cards (Revenue, Events, Donations, Staff).

- **Design:** Uses Shadcn UI `Card` components.
- **Props:** Currently static (to be connected to API).

## Usage

Access via `/admin`. Requires Authentication.
