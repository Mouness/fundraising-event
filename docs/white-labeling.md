# White-Labeling & Configuration

The `@fundraising/white-labeling` package is the central source of truth for event configuration, theming, and internationalization (i18n). It allows the application to be deployed for different events simply by changing the configuration, without modifying the core codebase.

## Overview

This package is a workspace library located at `packages/white-labeling`. It exports:

- **Configuration**: Logic to load and merge `event-config.json`.
- **Hooks (Web)**: React hooks for accessing config (future plan, currently in `apps/web`).
- **Types**: TypeScript interfaces for the configuration schema.
- **Locales**: Base translations and merging logic.

## Configuration Schema (`EventConfig`)

The core interface is `EventConfig`. A typical configuration looks like this:

```json
{
  "id": "event-slug",
  "content": {
    "title": "Gala 2024",
    "description": "Annual fundraising gala."
  },
  "theme": {
    "primaryColor": "#ff0000",
    "secondaryColor": "#ffffff",
    "logoUrl": "/assets/logo.png",
    "fontFamily": "Inter"
  },
  "features": {
    "donations": true,
    "ticketing": false
  }
}
```

## Usage

### In API

The API uses `EventConfigService` (in `apps/api`) which leverages `loadConfig` from this package. It looks for `event-config.json` in the runtime directory or falls back to defaults.

```typescript
import { loadConfig } from '@fundraising/white-labeling';

const config = loadConfig(customJson);
```

### In Web

The frontend fetches the configuration at runtime (e.g. from `/config/event-config.json`) and hydrates the application state. Hooks like `useEventConfig` manage this flow.

## Adding a New Event

1. Create a `event-config.json` file.
2. Place it in the deployment root (or `public/config` for static serving).
3. The application will merge this JSON with the default configuration found in `packages/white-labeling/src/config/event-config.default.json`.

## Internationalization (i18n)

The package exports `mergeLocales` which performs a deep merge of default English/French translations with any event-specific overrides provided in the config or external locale files.
