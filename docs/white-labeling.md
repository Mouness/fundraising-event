# White-Labeling Package

The `@fundraising/white-labeling` package is the engine that allows the application to be customized for different events. It enforces a strict **"Custom overrides Default"** philosophy, ensuring that consumers (Web & API) always receive the fully resolved configuration.

## Core Philosophy

For every customizable element, the package provides a sensible **Default**. If a **Custom** version is provided, it merges with or overrides the default. If not, the default is used silently.

| Element | Default Source | Custom Source | Override Mechanism | Export |
| :--- | :--- | :--- | :--- | :--- |
| **Config** | `src/config/*.json` | `event-config.json` | Deep Merge | `loadConfig`, `AppConfigProvider` |
| **Styles** | `src/theme/*.css` | `theme.css` | CSS Cascade | (Auto-injected) |
| **Locales** | `src/locales/*.json` | Custom JSON | Deep Merge | `mergeLocales` |
| **Assets** | `src/assets/*` | Config URLs | Replacement | `assets` |

---

## 1. Configuration (JSON)

The core `EventConfig` object drives the behavior of the application (feature flags, text content, amounts).

- **Default**: The package bundles a complete default configuration (`src/config/event-config.default.json`).
- **Custom**: The app initializes via `AppConfigProvider` (React) or `initWhiteLabeling` (Vanilla/Script) to fetch event data.
- **Resolution**: `loadConfigs()` merges Default JSON + Database Overrides.

### React Integration (Recommended)
Use the `AppConfigProvider` to wrap your application. This ensures strict type safety and loading states.

```tsx
import { AppConfigProvider } from './providers/AppConfigProvider';

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppConfigProvider>
      {children}
    </AppConfigProvider>
  );
};
```

Access config in components:
```tsx
import { useAppConfig } from '@/providers/AppConfigProvider';

const MyComponent = () => {
  const { config } = useAppConfig();
  return <h1>{config.content.title}</h1>;
}
```

---

## 2. Visual Theming (CSS)

The appearance is controlled by a comprehensive set of **CSS Variables** defined in `theme.default.css`. These encompass colors, radii, shadows, and typography.

- **Default**: Bundled in `dist/theme/theme.default.css`.
- **Custom**: A `theme.css` file hosted alongside the config.
- **Tailwind 4 Support**: The default theme now includes a `@theme` block that maps CSS variables to Tailwind 4 configuration.

### CSS Variable Reference

#### Core Colors (Shadcn/Tailwind)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `--background` | Main background color of the app | `#f8fafc` |
| `--foreground` | Main text color | `#0f172a` |
| `--primary` | Primary brand color (Pink) | `#ec4899` |
| `--primary-foreground` | Text color on primary background | `#ffffff` |
| `--secondary` | Secondary brand color (Purple) | `#8b5cf6` |
| `--secondary-foreground` | Text color on secondary background | `#ffffff` |
| `--muted` | Muted background for cards/sections | `#f1f5f9` |
| `--muted-foreground` | Muted text color for subtitles | `#64748b` |
| `--border` | Default border color | `#e2e8f0` |
| `--input` | Default input border color | `#e2e8f0` |
| `--ring` | Focus ring color | `#ec4899` |
| `--radius` | Base border radius | `0.5rem` |

#### Global Variables
| Variable | Description | Default |
| :--- | :--- | :--- |
| `--global-link-color` | Color for hyperlinks | `var(--primary)` |
| `--global-link-hover` | Hover state color for links | `var(--primary)` |
| `--global-error-color` | Standard error red | `#ef4444` |
| `--global-error-bg` | Background for error alerts | `#fef2f2` |
| `--global-success-color` | Standard success green | `#16a34a` |
| `--global-success-bg` | Background for success alerts | `rgba(220, 252, 231, 0.5)` |
| `--global-radius` | Aliased base radius | `var(--radius)` |
| `--global-radius-sm` | Small radius for inner elements | `calc(var(--radius) - 2px)` |
| `--global-radius-lg` | Large radius for cards/modals | `calc(var(--radius) + 4px)` |
| `--global-radius-full` | Pill/Circle radius | `9999px` |
| `--global-shadow-sm` | Subtle shadow | `0 1px 2px rgba(0...` |
| `--global-shadow` | Standard depth shadow | `0 4px 6px rgba(0...` |
| `--global-shadow-lg` | Deep shadow for floating elements | `0 10px 15px rgba(0...` |
| `--global-font-family` | Primary font stack | `'Inter', system-ui...` |
| `--global-font-mono` | Monospace font stack | `'JetBrains Mono'...` |
| `--global-transition-fast` | Fast transition for hovers | `150ms ease` |
| `--global-transition` | Standard transition for state changes | `300ms ease` |

#### Glassmorphism
| Variable | Description | Default |
| :--- | :--- | :--- |
| `--glass-bg` | Translucent background | `rgba(255, 255, 255, 0.7)` |
| `--glass-blur` | Blur strength | `12px` |
| `--glass-opacity` | Opacity override | `1` |
| `--glass-border` | Translucent border | `rgba(255, 255, 255, 0.3)` |
| `--glass-shadow` | Soft shadow for glass effect | `0 8px 32px 0 rgba...` |

#### App Header
| Variable | Description | Default |
| :--- | :--- | :--- |
| `--header-bg` | Header background color | `var(--background)` |
| `--header-bg-dark` | Header background for dark variants | `var(--foreground)` |
| `--header-border` | Header bottom border | `var(--border)` |
| `--header-text` | Header text color | `var(--foreground)` |
| `--header-accent` | Accent color in header | `var(--primary)` |
| `--header-height` | Fixed height of the header | `4rem` |

#### Feature: Auth
| Variable | Description |
| :--- | :--- |
| `--auth-page-bg` | Background for login pages |
| `--auth-input-bg` | Input field background |
| `--auth-input-border` | Input field border |
| `--auth-input-text` | Input text color |
| `--auth-button-bg` | Login button background |
| `--auth-button-text` | Login button text |
| `--auth-title-color` | Title text color |
| `--auth-subtitle-color` | Subtitle text color |
| `--auth-label-color` | Form label color |
| `--auth-link-color` | Links color in auth forms |
| `--auth-card-shadow` | Shadow for auth card |
| `--auth-card-radius` | Radius for auth card |

#### Feature: Admin
| Variable | Description |
| :--- | :--- |
| `--admin-sidebar-bg` | Sidebar background (Dark) |
| `--admin-sidebar-text` | Sidebar text (Light) |
| `--admin-sidebar-hover` | Sidebar hover state |
| `--admin-content-bg` | Main content area background |
| `--admin-card-bg` | Card background in dashboard |
| `--admin-card-text` | Card text color |
| `--admin-border-color` | Border color for admin elements |
| `--admin-heading-color` | Heading color |
| `--admin-muted-text` | Secondary text in admin |
| `--admin-sidebar-width` | Width of the sidebar |
| `--admin-sidebar-padding` | Padding inside sidebar |
| `--admin-content-padding` | Padding for content area |

#### Feature: Donation
| Variable | Description |
| :--- | :--- |
| `--donation-title-color` | Title color for donation flow |
| `--donation-subtitle-color` | Subtitle color |
| `--donation-card-radius` | Card radius |
| `--donation-button-radius` | Button radius |
| `--donation-amount-button-bg` | Amount button default bg |
| `--donation-amount-button-text` | Amount button default text |
| `--donation-amount-button-selected-bg` | Selected amount bg |
| `--donation-amount-button-selected-text` | Selected amount text |
| `--donation-next-button-bg` | Next step button bg |
| `--donation-next-button-text` | Next step button text |
| `--donation-input-bg` | Input background |
| `--donation-input-text` | Input text |
| `--donation-input-border` | Input border |
| `--donation-label-color` | Input label |
| `--donation-page-gradient` | Page background gradient |
| `--donation-card-shadow` | Main card shadow |
| `--donation-amount-gap` | Spacing between amount buttons |

#### Feature: Thank You
| Variable | Description |
| :--- | :--- |
| `--thankyou-gradient-start` | Gradient start color |
| `--thankyou-gradient-via` | Gradient middle color |
| `--thankyou-gradient-end` | Gradient end color |
| `--thankyou-card-bg` | Card background (semi-transparent) |
| `--thankyou-card-radius` | Card radius |
| `--thankyou-card-shadow` | Card elevation |
| `--thankyou-card-border` | Card border |
| `--thankyou-title-color` | Title text color |
| `--thankyou-message-color` | Message text color |
| `--thankyou-icon-color` | Success icon color |
| `--thankyou-icon-bg` | Success icon background |
| `--thankyou-receipt-bg` | Receipt section background |
| `--thankyou-receipt-label` | Receipt label color |
| `--thankyou-receipt-text` | Receipt value color |
| `--thankyou-share-label` | Share section label |
| `--thankyou-share-twitter` | Twitter brand color |
| `--thankyou-share-facebook` | Facebook brand color |
| `--thankyou-share-linkedin` | LinkedIn brand color |
| `--thankyou-button-bg` | Action button background |
| `--thankyou-button-text` | Action button text |

#### Feature: Live Screen
| Variable | Description |
| :--- | :--- |
| `--live-page-bg` | Live screen background |
| `--live-header-text` | Header text color |
| `--live-subtitle-text` | Subtitle text color |
| `--live-label-text` | Label text color |
| `--live-goal-text` | Goal label color |
| `--live-status-indicator` | Online status dot |
| `--live-bg-accent-1` | Background glowing orb 1 |
| `--live-bg-accent-2` | Background glowing orb 2 |
| `--live-bg-blur` | Blur amount for background orbs |
| `--live-text-main` | Main text color |
| `--live-title-color` | Title color |
| `--live-highlight-color` | Highlighted text color |
| `--live-text-secondary` | Secondary text color |
| `--live-text-muted` | Muted text color |
| `--live-amount-color` | Amount display color |
| `--live-avatar-bg-start` | Avatar gradient start |
| `--live-avatar-bg-end` | Avatar gradient end |
| `--live-qr-bg` | QR Code container background |
| `--live-qr-shadow` | QR Code glow/shadow |
| `--live-gauge-track` | Gauge background track |
| `--live-gauge-shadow` | Gauge glow |
| `--live-feed-item-bg` | Feed item background |
| `--live-feed-item-border` | Feed item border |
| `--live-counter-gradient-from` | Counter gradient start |
| `--live-counter-gradient-to` | Counter gradient end |
| `--live-gauge-size` | Size of the main gauge |
| `--live-gauge-stroke` | Stroke width of the gauge |
| `--live-qr-size` | Size of the QR code |
| `--live-counter-size` | Font size of the main counter |
| `--live-counter-weight` | Font weight of the main counter |
| `--live-qr-radius` | Border radius of QR container |
| `--live-logo-radius` | Border radius of Logo |

#### Feature: Staff
| Variable | Description |
| :--- | :--- |
| `--staff-page-bg` | Staff page background |
| `--staff-display-bg` | Amount display background |
| `--staff-display-border` | Amount display border |
| `--staff-keypad-bg` | Keypad area background |
| `--staff-keypad-button-bg` | Keypad button background |
| `--staff-keypad-button-text` | Keypad button text |
| `--staff-input-bg` | Input background |
| `--staff-input-text` | Input text |
| `--staff-input-border` | Input border |
| `--staff-input-placeholder` | Placeholder text color |
| `--staff-keypad-shadow` | Key button shadow |
| `--staff-keypad-delete-bg` | Delete button background |
| `--staff-keypad-delete-hover` | Delete button hover state |
| `--staff-keypad-button-height` | Height of keypad buttons |
| `--staff-amount-size` | Font size of the amount type display |
| `--staff-keypad-gap` | Gap between keys |
| `--staff-display-radius` | Radius of amount display |
| `--staff-keypad-radius` | Radius of keypad container |
| `--staff-label-color` | Label text color |
| `--staff-amount-color` | Amount text color |
| `--staff-amount-placeholder-color` | Amount placeholder color |
| `--staff-type-button-bg` | Donation type button bg |
| `--staff-type-button-text` | Donation type button text |
| `--staff-type-button-border` | Type button border |
| `--staff-type-button-icon-color` | Type button icon color |
| `--staff-type-button-selected-bg` | Selected type background |
| `--staff-type-button-selected-text` | Selected type text |
| `--staff-type-button-selected-icon` | Selected type icon |

---

## 3. Internationalization (i18n)

Translations are handled via key-value JSON resources.

- **Default**: `en.default.json` and `fr.default.json` in the package.
- **Custom**: Application provides partial translation files.
- **Resolution**: `mergeLocales(locale, customResources)` performs a deep merge.

### Structure
Keys are nested by feature to ensure modularity.
```json
{
  "admin": { "header": "...", "sidebar": "..." },
  "donation": { "title": "...", "submit": "..." },
  "staff": { "ui_keypad": "..." },
  "thankyou": { "receipt": { "id": "..." } }
}
```

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

- **Default**: The package exports default assets.
- **Custom**: You provide a URL string in the configuration.
- **Resolution**: Configuration Property replacement.

### Supported Assets
| key | Description |
| :--- | :--- |
| `logoUrl` | Main application logo (Header/PDF) |
| `backgroundDonor` | Background image for Donation Page |
| `backgroundLive` | Background image for Live Screen |
| `faviconUrl` | Browser tab icon |

### Usage
```json
// In event-config.json
{
  "theme": {
    "logoUrl": "https://mysite.com/my-logo.png",
    "backgroundLive": "https://mysite.com/gala-bg.jpg"
  }
}
```

---

## Developer Guide

### Adding a New Default
1. Edit `packages/white-labeling/src/config/event-config.default.json`.
2. Add the type definition in `packages/white-labeling/src/types/EventConfig.ts`.

### Publishing
The package is built using `tsup` and exports:
- `.` (Main entry: logic & types)
- `./css` (The default stylesheet)
