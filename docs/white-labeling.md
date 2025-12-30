# White-Labeling Package

The `@fundraising/white-labeling` package is the engine that allows the application to be customized for different events. It enforces a strict **"Custom overrides Default"** philosophy, ensuring that consumers (Web & API) always receive the fully resolved configuration.

## Core Philosophy

For every customizable element, the package provides a sensible **Default**. If a **Custom** version is provided, it merges with or overrides the default. If not, the default is used silently.

| Element | Default Source | Custom Source | Override Mechanism | Export |
| :--- | :--- | :--- | :--- | :--- |
| **Config** | `src/config/*.json` | `event-config.json` | Deep Merge | `loadConfig` |
| **Styles** | `src/theme/*.css` | `theme.css` | CSS Cascade | (Auto-injected) |
| **Locales** | `src/locales/*.json` | Custom JSON | Deep Merge | `mergeLocales` |
| **Assets** | `src/assets/*` | Config URLs | Replacement | `assets` |

---

## 1. Configuration (JSON)

The core `EventConfig` object drives the behavior of the application (feature flags, text content, amounts).

- **Default**: The package bundles a complete default configuration (`src/config/event-config.default.json`).
- **Custom**: The app initializes via `initWhiteLabeling(apiUrl)` to fetch event data from the backend.
- **Resolution**: `loadConfigs()` merges Default JSON + Database Overrides.

### Runtime Initialization
The application must initialize the store before rendering:
```typescript
import { initWhiteLabeling } from '@fundraising/white-labeling';

// Fetches /events from API and populates the Singleton Store
await initWhiteLabeling(import.meta.env.VITE_API_URL);
```

### Usage
```typescript
import { loadConfig } from '@fundraising/white-labeling';

// If customConfig is undefined, you get the full defaults.
// If customConfig has just { id: 'test' }, you get defaults + new ID.
const config = loadConfig(customConfig);
```

---

## 2. Visual Theming (CSS)

The appearance is controlled by CSS Variables.

- **Default**: Bundled in `dist/theme/theme.default.css`.
- **Custom**: A `theme.css` file hosted alongside the config.
- **Resolution**: **The Cascade**.
    1. The app imports the default CSS at build time.
    2. At runtime, the app checks for a custom `theme.css`.
    3. If found, it injects it into the `<head>`, overriding variables.

### Example Override
**Default** (`packages/white-labeling/src/theme/theme.default.css`):
```css
:root { --primary: #ec4899; }
```

**Custom** (`/config/theme.css`):
```css
:root { --primary: blue; }
```
**Result**: The app is Blue.

---

## 3. Internationalization (i18n)

Translations are handled via key-value JSON resources.

- **Default**: `en.default.json` and `fr.default.json` in the package.
- **Custom**: Application provides partial translation files.
- **Resolution**: `mergeLocales(locale, customResources)` performs a deep merge.

### Usage
```typescript
import { mergeLocales } from '@fundraising/white-labeling';

// Merges your custom label overrides on top of the robust default dictionary
const resources = mergeLocales('en', {
  "donation": {
    "submit": "Give Generously!" // Overrides "Donate Now"
  }
});
```

---

## 4. Assets (Images)

- **Default**: The package exports default assets (e.g., a placeholder logo).
- **Custom**: You provide a URL string in the configuration `logoUrl`.
- **Resolution**: Configuration Property replacement.

### Usage
```typescript
// In event-config.json
{
  "theme": {
    "logoUrl": "https://mysite.com/my-logo.png"
  }
}
```
If `logoUrl` is omitted, the application uses the default import from `@fundraising/white-labeling`.

---

## Developer Guide

### Adding a New Default
1. Edit `packages/white-labeling/src/config/event-config.default.json`.
2. Add the type definition in `packages/white-labeling/src/types/EventConfig.ts`.

### Publishing
The package is built using `tsup` and exports:
- `.` (Main entry: logic & types)
- `./css` (The default stylesheet)
