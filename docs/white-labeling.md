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

```json
{
  "organization": "Fundraising Event",
  "email": "contact@fundraising-event.org",
  "phone": "+33 6 99 99 99 99",
  "website": "https://fundraising-event.org",
  "address": "Paris, France",
  "communication": {
    "footerText": "Fundraising Event est une organisation de démonstration.",
    "emailConfig": {
        "senderName": "Fundraising Event Team",
        "replyTo": "donations@fundraising-event.org",
        "subjectLine": "Merci pour votre don"
    },
    "pdf": {
        "template": "formal",
        "footer": "Merci pour votre générosité. Votre don fait la différence."
    }
  },
  "payment": {
    "currency": "EUR",
    "provider": "stripe"
  },
  "locales": {
    "default": "fr",
    "supported": ["fr", "de", "en", "it"]
  }
}
```

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
| Variable | Description | Default Value | Preview |
| :--- | :--- | :--- | :--- |
| `--background` | Main background color of the app | `#FFFFFF` | !['#FFFFFF'](https://placehold.co/15x15/FFFFFF/FFFFFF.png) |
| `--foreground` | Main text color | `#1A1A1A` | !['#1A1A1A'](https://placehold.co/15x15/1A1A1A/1A1A1A.png) |
| `--primary` | Primary brand color (Blue) | `#0062A7` | !['#0062A7'](https://placehold.co/15x15/0062A7/0062A7.png) |
| `--primary-foreground` | Text color on primary background | `#FFFFFF` | !['#FFFFFF'](https://placehold.co/15x15/FFFFFF/FFFFFF.png) |
| `--secondary` | Secondary brand color (Light Gray) | `#EDEDED` | !['#EDEDED'](https://placehold.co/15x15/EDEDED/EDEDED.png) |
| `--secondary-foreground` | Text color on secondary background | `#1A1A1A` | !['#1A1A1A'](https://placehold.co/15x15/1A1A1A/1A1A1A.png) |
| `--muted` | Muted background for cards/sections | `#f1f5f9` | !['#f1f5f9'](https://placehold.co/15x15/f1f5f9/f1f5f9.png) |
| `--muted-foreground` | Muted text color for subtitles | `#64748b` | !['#64748b'](https://placehold.co/15x15/64748b/64748b.png) |
| `--border` | Default border color | `#e2e8f0` | !['#e2e8f0'](https://placehold.co/15x15/e2e8f0/e2e8f0.png) |
| `--input` | Default input border color | `#e2e8f0` | !['#e2e8f0'](https://placehold.co/15x15/e2e8f0/e2e8f0.png) |
| `--ring` | Focus ring color | `#0062A7` | !['#0062A7'](https://placehold.co/15x15/0062A7/0062A7.png) |
| `--radius` | Base border radius | `0.5rem` | |

#### Global Variables
| Variable | Description | Default Value | Preview |
| :--- | :--- | :--- | :--- |
| `--global-link-color` | Color for hyperlinks | `var(--primary)` | |
| `--global-link-hover` | Hover state color for links | `var(--primary)` | |
| `--global-error-color` | Standard error red | `#ef4444` | !['#ef4444'](https://placehold.co/15x15/ef4444/ef4444.png) |
| `--global-error-bg` | Background for error alerts | `#fef2f2` | !['#fef2f2'](https://placehold.co/15x15/fef2f2/fef2f2.png) |
| `--global-success-color` | Standard success green | `#16a34a` | !['#16a34a'](https://placehold.co/15x15/16a34a/16a34a.png) |
| `--global-success-bg` | Background for success alerts | `rgba(220, 252, 231, 0.5)` | |
| `--global-radius` | Aliased base radius | `var(--radius)` | |
| `--global-radius-sm` | Small radius for inner elements | `calc(var(--radius) - 2px)` | |
| `--global-radius-lg` | Large radius for cards/modals | `calc(var(--radius) + 4px)` | |
| `--global-radius-full` | Pill/Circle radius | `9999px` | |
| `--global-shadow-sm` | Subtle shadow | `0 1px 2px rgba(0, 0, 0, 0.05)` | |
| `--global-shadow` | Standard depth shadow | `0 4px 6px rgba(0, 0, 0, 0.1)` | |
| `--global-shadow-lg` | Deep shadow for floating elements | `0 10px 15px rgba(0, 0, 0, 0.1)` | |
| `--global-font-family` | Primary font stack | `'Inter', system-ui, sans-serif` | |
| `--global-font-mono` | Monospace font stack | `'JetBrains Mono', monospace` | |
| `--global-transition-fast` | Fast transition for hovers | `150ms ease` | |
| `--global-transition` | Standard transition for state changes | `300ms ease` | |

#### Glassmorphism
| Variable | Description | Default Value | Preview |
| :--- | :--- | :--- | :--- |
| `--glass-bg` | Translucent background | `rgba(255, 255, 255, 0.7)` | |
| `--glass-blur` | Blur strength | `12px` | |
| `--glass-opacity` | Opacity override | `1` | |
| `--glass-border` | Translucent border | `rgba(255, 255, 255, 0.3)` | |
| `--glass-shadow` | Soft shadow for glass effect | `0 8px 32px 0 rgba(0, 0, 0, 0.08)` | |

#### App Header
| Variable | Description | Default Value | Preview |
| :--- | :--- | :--- | :--- |
| `--header-bg` | Header background color | `var(--background)` | |
| `--header-bg-dark` | Header background for dark variants | `var(--foreground)` | |
| `--header-border` | Header bottom border | `var(--border)` | |
| `--header-text` | Header text color | `var(--foreground)` | |
| `--header-accent` | Accent color in header | `var(--primary)` | |
| `--header-height` | Fixed height of the header | `4rem` | |

#### Feature: Auth
| Variable | Description | Default Value | Preview |
| :--- | :--- | :--- | :--- |
| `--auth-page-bg` | Background for login pages | `var(--muted)` | |
| `--auth-input-bg` | Input field background | `var(--background)` | |
| `--auth-input-border` | Input field border | `var(--border)` | |
| `--auth-input-text` | Input text color | `var(--foreground)` | |
| `--auth-button-bg` | Login button background | `var(--primary)` | |
| `--auth-button-text` | Login button text | `var(--primary-foreground)` | |
| `--auth-title-color` | Title text color | `var(--foreground)` | |
| `--auth-subtitle-color` | Subtitle text color | `var(--muted-foreground)` | |
| `--auth-label-color` | Form label color | `var(--foreground)` | |
| `--auth-link-color` | Links color in auth forms | `var(--primary)` | |
| `--auth-card-shadow` | Shadow for auth card | `var(--global-shadow)` | |
| `--auth-card-radius` | Radius for auth card | `var(--global-radius-lg)` | |

#### Feature: Admin
| Variable | Description | Default Value | Preview |
| :--- | :--- | :--- | :--- |
| `--admin-sidebar-bg` | Sidebar background (Dark) | `var(--foreground)` | |
| `--admin-sidebar-text` | Sidebar text (Light) | `var(--background)` | |
| `--admin-sidebar-hover` | Sidebar hover state | `var(--muted-foreground)` | |
| `--admin-content-bg` | Main content area background | `var(--muted)` | |
| `--admin-card-bg` | Card background in dashboard | `var(--background)` | |
| `--admin-card-text` | Card text color | `var(--foreground)` | |
| `--admin-border-color` | Border color for admin elements | `var(--border)` | |
| `--admin-heading-color` | Heading color | `var(--foreground)` | |
| `--admin-muted-text` | Secondary text in admin | `var(--muted-foreground)` | |
| `--admin-sidebar-width` | Width of the sidebar | `16rem` | |
| `--admin-sidebar-padding` | Padding inside sidebar | `1rem` | |
| `--admin-content-padding` | Padding for content area | `2rem` | |

#### Feature: Donation
| Variable | Description | Default Value | Preview |
| :--- | :--- | :--- | :--- |
| `--donation-title-color` | Title color for donation flow | `var(--foreground)` | |
| `--donation-subtitle-color` | Subtitle color | `var(--muted-foreground)` | |
| `--donation-card-radius` | Card radius | `var(--global-radius-lg)` | |
| `--donation-button-radius` | Button radius | `var(--global-radius)` | |
| `--donation-amount-button-bg` | Amount button default bg | `var(--background)` | |
| `--donation-amount-button-text` | Amount button default text | `var(--foreground)` | |
| `--donation-amount-button-selected-bg` | Selected amount bg | `var(--primary)` | |
| `--donation-amount-button-selected-text` | Selected amount text | `var(--primary-foreground)` | |
| `--donation-next-button-bg` | Next step button bg | `var(--primary)` | |
| `--donation-next-button-text` | Next step button text | `var(--primary-foreground)` | |
| `--donation-input-bg` | Input background | `var(--background)` | |
| `--donation-input-text` | Input text | `var(--foreground)` | |
| `--donation-input-border` | Input border | `var(--border)` | |
| `--donation-label-color` | Input label | `var(--foreground)` | |
| `--donation-page-gradient` | Page background gradient | `linear-gradient(...)` | |
| `--donation-card-shadow` | Main card shadow | `var(--global-shadow-lg)` | |
| `--donation-amount-gap` | Spacing between amount buttons | `0.75rem` | |

#### Feature: Thank You
| Variable | Description | Default Value | Preview |
| :--- | :--- | :--- | :--- |
| `--thankyou-gradient-start` | Gradient start color | `var(--secondary)` | |
| `--thankyou-gradient-via` | Gradient middle color | `var(--primary)` | |
| `--thankyou-gradient-end` | Gradient end color | `var(--ring)` | |
| `--thankyou-card-bg` | Card background (semi-transparent) | `rgba(255, 255, 255, 0.9)` | |
| `--thankyou-card-radius` | Card radius | `var(--global-radius-lg)` | |
| `--thankyou-card-shadow` | Card elevation | `0 25px 50px rgba(0, 0, 0, 0.25)` | |
| `--thankyou-card-border` | Card border | `rgba(255, 255, 255, 0.2)` | |
| `--thankyou-title-color` | Title text color | `var(--primary)` | |
| `--thankyou-message-color` | Message text color | `var(--muted-foreground)` | |
| `--thankyou-icon-color` | Success icon color | `var(--global-success-color)` | |
| `--thankyou-icon-bg` | Success icon background | `var(--global-success-bg)` | |
| `--thankyou-receipt-bg` | Receipt section background | `var(--muted)` | |
| `--thankyou-receipt-label` | Receipt label color | `var(--muted-foreground)` | |
| `--thankyou-receipt-text` | Receipt value color | `var(--foreground)` | |
| `--thankyou-share-label` | Share section label | `var(--muted-foreground)` | |
| `--thankyou-share-twitter` | Twitter brand color | `#0ea5e9` | !['#0ea5e9'](https://placehold.co/15x15/0ea5e9/0ea5e9.png) |
| `--thankyou-share-facebook` | Facebook brand color | `#2563eb` | !['#2563eb'](https://placehold.co/15x15/2563eb/2563eb.png) |
| `--thankyou-share-linkedin` | LinkedIn brand color | `#1d4ed8` | !['#1d4ed8'](https://placehold.co/15x15/1d4ed8/1d4ed8.png) |
| `--thankyou-button-bg` | Action button background | `var(--primary)` | |
| `--thankyou-button-text` | Action button text | `var(--primary-foreground)` | |

#### Feature: Live Screen
| Variable | Description | Default Value | Preview |
| :--- | :--- | :--- | :--- |
| `--live-page-bg` | Live screen background | `var(--foreground)` | |
| `--live-header-text` | Header text color | `var(--primary-foreground)` | |
| `--live-subtitle-text` | Subtitle text color | `var(--muted-foreground)` | |
| `--live-label-text` | Label text color | `var(--muted-foreground)` | |
| `--live-goal-text` | Goal label color | `var(--muted-foreground)` | |
| `--live-status-indicator` | Online status dot | `var(--global-success-color)` | |
| `--live-bg-accent-1` | Background glowing orb 1 | `rgba(88, 28, 135, 0.4)` | |
| `--live-bg-accent-2` | Background glowing orb 2 | `rgba(30, 58, 138, 0.4)` | |
| `--live-bg-blur` | Blur amount for background orbs | `120px` | |
| `--live-text-main` | Main text color | `var(--primary-foreground)` | |
| `--live-title-color` | Title color | `var(--primary-foreground)` | |
| `--live-highlight-color` | Highlighted text color | `var(--primary-foreground)` | |
| `--live-text-secondary` | Secondary text color | `var(--muted-foreground)` | |
| `--live-text-muted` | Muted text color | `var(--muted-foreground)` | |
| `--live-amount-color` | Amount display color | `var(--global-success-color)` | |
| `--live-avatar-bg-start` | Avatar gradient start | `var(--primary)` | |
| `--live-avatar-bg-end` | Avatar gradient end | `var(--secondary)` | |
| `--live-qr-bg` | QR Code container background | `var(--primary-foreground)` | |
| `--live-qr-shadow` | QR Code glow/shadow | `rgba(168, 85, 247, 0.4)` | |
| `--live-gauge-track` | Gauge background track | `rgba(255, 255, 255, 0.05)` | |
| `--live-gauge-shadow` | Gauge glow | `rgba(168, 85, 247, 0.3)` | |
| `--live-feed-item-bg` | Feed item background | `rgba(15, 23, 42, 0.6)` | |
| `--live-feed-item-border` | Feed item border | `rgba(51, 65, 85, 0.5)` | |
| `--live-counter-gradient-from` | Counter gradient start | `var(--primary-foreground)` | |
| `--live-counter-gradient-to` | Counter gradient end | `var(--muted-foreground)` | |
| `--live-gauge-size` | Size of the main gauge | `500px` | |
| `--live-gauge-stroke` | Stroke width of the gauge | `12` | |
| `--live-qr-size` | Size of the QR code | `120px` | |
| `--live-counter-size` | Font size of the main counter | `6rem` | |
| `--live-counter-weight` | Font weight of the main counter | `900` | |
| `--live-qr-radius` | Border radius of QR container | `0.75rem` | |
| `--live-logo-radius` | Border radius of Logo | `0.5rem` | |

#### Feature: Staff
| Variable | Description | Default Value | Preview |
| :--- | :--- | :--- | :--- |
| `--staff-page-bg` | Staff page background | `var(--muted)` | |
| `--staff-display-bg` | Amount display background | `var(--background)` | |
| `--staff-display-border` | Amount display border | `var(--border)` | |
| `--staff-keypad-bg` | Keypad area background | `var(--background)` | |
| `--staff-keypad-button-bg` | Keypad button background | `var(--secondary)` | |
| `--staff-keypad-button-text` | Keypad button text | `var(--secondary-foreground)` | |
| `--staff-input-bg` | Input background | `var(--background)` | |
| `--staff-input-text` | Input text | `var(--foreground)` | |
| `--staff-input-border` | Input border | `var(--border)` | |
| `--staff-input-placeholder` | Placeholder text color | `var(--muted-foreground)` | |
| `--staff-keypad-shadow` | Key button shadow | `rgba(0, 0, 0, 0.05)` | |
| `--staff-keypad-delete-bg` | Delete button background | `var(--global-error-color)` | |
| `--staff-keypad-delete-hover` | Delete button hover state | `#dc2626` | !['#dc2626'](https://placehold.co/15x15/dc2626/dc2626.png) |
| `--staff-keypad-button-height` | Height of keypad buttons | `4rem` | |
| `--staff-amount-size` | Font size of the amount type display | `3rem` | |
| `--staff-keypad-gap` | Gap between keys | `0.75rem` | |
| `--staff-display-radius` | Radius of amount display | `var(--global-radius)` | |
| `--staff-keypad-radius` | Radius of keypad container | `var(--global-radius-lg)` | |
| `--staff-label-color` | Label text color | `var(--foreground)` | |
| `--staff-amount-color` | Amount text color | `var(--foreground)` | |
| `--staff-amount-placeholder-color` | Amount placeholder color | `var(--muted-foreground)` | |
| `--staff-type-button-bg` | Donation type button bg | `var(--staff-keypad-button-bg)` | |
| `--staff-type-button-text` | Donation type button text | `var(--foreground)` | |
| `--staff-type-button-border` | Type button border | `var(--staff-display-border)` | |
| `--staff-type-button-icon-color` | Type button icon color | `var(--foreground)` | |
| `--staff-type-button-selected-bg` | Selected type background | `var(--primary)` | |
| `--staff-type-button-selected-text` | Selected type text | `var(--primary-foreground)` | |
| `--staff-type-button-selected-icon` | Selected type icon | `var(--primary-foreground)` | |

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
| `logo` | Main application logo (Header/PDF) |
| `favicon` | Browser tab icon |
| `backgroundDonor` | Background image for Donation Page |
| `backgroundLive` | Background image for Live Screen |
| `backgroundLanding` | Background image for Landing Page |

### Usage
```json
// In event-config.json
{
  "theme": {
    "assets": {
      "logo": "https://mysite.com/my-logo.png",
      "backgroundLive": "https://mysite.com/gala-bg.jpg"
    }
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
