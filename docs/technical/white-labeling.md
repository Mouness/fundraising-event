# White-Labeling Package

The `@fundraising/white-labeling` package is the engine that allows the application to be customized for different events. It enforces a strict **"Custom overrides Default"** philosophy, ensuring that consumers (Web & API) always receive the fully resolved configuration.

## Core Philosophy

For every customizable element, the package provides a sensible **Default**. If a **Custom** version is provided, it merges with or overrides the default. If not, the default is used silently.

| Element     | Default Source       | Custom Source       | Override Mechanism | Export                            |
| :---------- | :------------------- | :------------------ | :----------------- | :-------------------------------- |
| **Config**  | `src/config/*.json`  | `event-config.json` | Deep Merge         | `loadConfig`, `AppConfigProvider` |
| **Styles**  | `src/theme/*.css`    | `theme.css`         | CSS Cascade        | (Auto-injected)                   |
| **Locales** | `src/locales/*.json` | Custom JSON         | Deep Merge         | `mergeLocales`                    |
| **Assets**  | `src/assets/*`       | Config URLs         | Replacement        | `assets`                          |

---

## 1. Configuration (JSON)

The core `EventConfig` object drives the behavior of the application (feature flags, text content, amounts).

- **Default**: The package bundles a complete default configuration (`src/config/event-config.default.json`).
- **Custom**: The app initializes via `AppConfigProvider` (React) or `initWhiteLabeling` (Vanilla/Script) to fetch event data.
- **Resolution**: `loadConfigs()` merges Default JSON + Database Overrides.

### EventConfig Structure

```typescript
interface EventConfig {
  id: string;
  slug?: string;
  name: string;
  description?: string;

  theme?: ThemeConfig;
  content: ContentConfig;
  live?: LiveConfig;
  donation: DonationConfig;
  communication: CommunicationConfig;
  locales?: LocalesConfig;
}

interface ThemeConfig {
  assets?: Record<string, string>;
  variables?: Record<string, string>;
}

interface ContentConfig {
  title: string;
  totalLabel: string;
  goalAmount: number;
  landing?: {
    impact?: { url?: string; enabled?: boolean };
    community?: { url?: string; enabled?: boolean };
    interactive?: { url?: string; enabled?: boolean };
  };
}

interface LiveConfig {
  theme: 'classic' | 'modern' | 'elegant';
}

interface DonationConfig {
  form: {
    phone: DonationFormFieldConfig;
    address: DonationFormFieldConfig;
    company: DonationFormFieldConfig;
    message: DonationFormFieldConfig;
    anonymous: DonationFormFieldConfig;
  };
  sharing: SharingConfig;
  payment: PaymentConfig; // Strictly Global - Cannot be overridden at event level
}

interface SharingConfig {
  enabled: boolean;
  networks: ('facebook' | 'twitter' | 'linkedin')[];
}

interface DonationFormFieldConfig {
  enabled: boolean;
  required: boolean;
}

interface PaymentConfig {
  provider: 'stripe' | 'paypal' | string;
  currency: string;
  config?: {
    stripe?: StripeProviderConfig;
    paypal?: PayPalProviderConfig;
  };
}

> [!IMPORTANT]
> **Payment configuration is strictly global.** While `EventConfig` contains a `payment` block, values provided at the event level are ignored by the API. All payment processing (keys, currency, provider) must be configured in **Global Settings**.

interface StripeProviderConfig {
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
}

interface PayPalProviderConfig {
  clientId: string;
  clientSecret: string;
  webhookId: string;
  sandbox: boolean;
}

interface CommunicationConfig {
  legalName: string;
  address: string;
  website?: string;
  supportEmail?: string;
  phone?: string;
  taxId?: string; // Tax ID / Charity Registration Number
  footerText?: string; // Common footer text for receipts
  signatureText?: string; // e.g. "CEO Name, Title"
  signatureImage?: string; // URL to signature image
  pdf: PdfConfig;
  email: EmailConfig;
}

interface PdfConfig {
  enabled: boolean;
}

interface EmailConfig {
  enabled: boolean;
  senderName?: string;
  replyTo?: string;
  subjectLine?: string;
  provider?: 'console' | 'smtp' | 'resend' | 'gmail' | 'outlook';
  config?: EmailProviderConfig;
}

interface EmailProviderConfig {
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    auth?: {
      user: string;
      pass: string;
    };
  };
}

// Localization
interface LocalesConfig {
  default: 'en' | 'fr' | 'de' | 'it';
  supported: ('en' | 'fr' | 'de' | 'it')[];
  overrides?: Record<string, any>;
}
```

### Example Configuration

```json
{
    "id": "evt_winter_gala",
    "name": "Winter Gala 2025",
    "theme": {
        "variables": {
            "--primary": "#ec4899",
            "--radius": "0.5rem"
        },
        "assets": {
            "logo": "https://example.com/logo.png",
            "backgroundLive": "https://example.com/bg.jpg"
        }
    },
    "content": {
        "title": "Winter Gala 2025",
        "totalLabel": "Funds Raised",
        "goalAmount": 50000
    },
    "live": {
        "theme": "modern"
    },
    "donation": {
        "form": {
            "phone": { "enabled": true, "required": false },
            "address": { "enabled": false, "required": false },
            "company": { "enabled": true, "required": false },
            "message": { "enabled": true, "required": false },
            "anonymous": { "enabled": true, "required": false }
        },
        "sharing": {
            "enabled": true,
            "networks": ["facebook", "twitter", "linkedin"]
        },
        "payment": {
            "provider": "stripe",
            "currency": "EUR"
        }
    },
    "communication": {
        "legalName": "My Charity Foundation",
        "address": "123 Charity Lane, Paris",
        "website": "https://mycharity.org",
        "supportEmail": "support@mycharity.org",
        "pdf": {
            "enabled": true,
            "templateStyle": "formal"
        },
        "email": {
            "enabled": true,
            "senderName": "My Charity",
            "subjectLine": "Thank you for your donation!"
        }
    },
    "locales": {
        "default": "fr",
        "supported": ["fr", "en", "de", "it"],
        "overrides": {
            "fr": {
                "donation.submit": "Faire un don"
            }
        }
    }
}
```

### React Integration

Wrap your application with `AppConfigProvider`:

```tsx
import { AppConfigProvider } from '@core/providers/AppConfigProvider'

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
    return <AppConfigProvider>{children}</AppConfigProvider>
}
```

Access config in components:

```tsx
import { useAppConfig } from '@core/providers/AppConfigProvider'

const MyComponent = () => {
    const { config } = useAppConfig()
    return <h1>{config.content.title}</h1>
}
```

---

## 2. Visual Theming (CSS)

The appearance is controlled by a comprehensive set of **CSS Variables** defined in `theme.default.css`. These encompass colors, radii, shadows, and typography.

- **Default**: Bundled in `dist/theme/theme.default.css`.
- **Custom**: A `theme.css` file hosted alongside the config.
- **Tailwind 4 Support**: The default theme now includes a `@theme` block that maps CSS variables to Tailwind 4 configuration.

### CSS Variables Reference

#### Core Colors (Shadcn/Tailwind)

| Variable                   | Description                           | Default Value |                        Preview                        |
| :------------------------- | :------------------------------------ | :------------ | :---------------------------------------------------: |
| `--background`             | Main background color of the app      | `#FFFFFF`     | ![#FFFFFF](https://placehold.co/20/FFFFFF/FFFFFF.png) |
| `--foreground`             | Main text color                       | `#1A1A1A`     | ![#1A1A1A](https://placehold.co/20/1A1A1A/1A1A1A.png) |
| `--primary`                | Primary brand color (Blue)            | `#0062A7`     | ![#0062A7](https://placehold.co/20/0062A7/0062A7.png) |
| `--primary-foreground`     | Text color on primary background      | `#FFFFFF`     | ![#FFFFFF](https://placehold.co/20/FFFFFF/FFFFFF.png) |
| `--secondary`              | Secondary brand color (Light Gray)    | `#EDEDED`     | ![#EDEDED](https://placehold.co/20/EDEDED/EDEDED.png) |
| `--secondary-foreground`   | Text color on secondary background    | `#1A1A1A`     | ![#1A1A1A](https://placehold.co/20/1A1A1A/1A1A1A.png) |
| `--muted`                  | Muted background for cards/sections   | `#f1f5f9`     | ![#f1f5f9](https://placehold.co/20/f1f5f9/f1f5f9.png) |
| `--muted-foreground`       | Muted text color for subtitles        | `#64748b`     | ![#64748b](https://placehold.co/20/64748b/64748b.png) |
| `--border`                 | Default border color                  | `#e2e8f0`     | ![#e2e8f0](https://placehold.co/20/e2e8f0/e2e8f0.png) |
| `--input`                  | Default input border color            | `#e2e8f0`     | ![#e2e8f0](https://placehold.co/20/e2e8f0/e2e8f0.png) |
| `--ring`                   | Focus ring color                      | `#0062A7`     | ![#0062A7](https://placehold.co/20/0062A7/0062A7.png) |
| `--radius`                 | Base border radius                    | `0.5rem`      |                           —                           |
| `--popover`                | Background of floating popovers       | `#ffffff`     | ![#ffffff](https://placehold.co/20/ffffff/ffffff.png) |
| `--popover-foreground`     | Text color for popover content        | `#0f172a`     | ![#0f172a](https://placehold.co/20/0f172a/0f172a.png) |
| `--accent`                 | Accent background for hovered items   | `#FDB913`     | ![#FDB913](https://placehold.co/20/FDB913/FDB913.png) |
| `--accent-foreground`      | Text color for accented elements      | `#1A1A1A`     | ![#1A1A1A](https://placehold.co/20/1A1A1A/1A1A1A.png) |
| `--card`                   | Background for standard cards         | `#FFFFFF`     | ![#FFFFFF](https://placehold.co/20/FFFFFF/FFFFFF.png) |
| `--card-foreground`        | Text color within cards               | `#1A1A1A`     | ![#1A1A1A](https://placehold.co/20/1A1A1A/1A1A1A.png) |
| `--destructive`            | Color for destructive actions         | `#ef4444`     | ![#ef4444](https://placehold.co/20/ef4444/ef4444.png) |
| `--destructive-foreground` | Text color on destructive backgrounds | `#ffffff`     | ![#ffffff](https://placehold.co/20/ffffff/ffffff.png) |

#### Global Variables

| Variable                   | Description                           | Default Value                    |                        Preview                        |
| :------------------------- | :------------------------------------ | :------------------------------- | :---------------------------------------------------: |
| `--global-link-color`      | Color for hyperlinks                  | `var(--primary)`                 |                           —                           |
| `--global-link-hover`      | Hover state color for links           | `var(--primary)`                 |                           —                           |
| `--global-error-color`     | Standard error red                    | `#ef4444`                        | ![#ef4444](https://placehold.co/20/ef4444/ef4444.png) |
| `--global-error-bg`        | Background for error alerts           | `#fef2f2`                        | ![#fef2f2](https://placehold.co/20/fef2f2/fef2f2.png) |
| `--global-success-color`   | Standard success green                | `#16a34a`                        | ![#16a34a](https://placehold.co/20/16a34a/16a34a.png) |
| `--global-success-bg`      | Background for success alerts         | `rgba(220, 252, 231, 0.5)`       |  ![rgba](https://placehold.co/20/dcfce7/dcfce7.png)   |
| `--global-radius`          | Aliased base radius                   | `var(--radius)`                  |                           —                           |
| `--global-radius-sm`       | Small radius for inner elements       | `calc(var(--radius) - 2px)`      |
| `--global-radius-lg`       | Large radius for cards/modals         | `calc(var(--radius) + 4px)`      |
| `--global-radius-full`     | Pill/Circle radius                    | `9999px`                         |
| `--global-shadow-sm`       | Subtle shadow                         | `0 1px 2px rgba(0, 0, 0, 0.05)`  |
| `--global-shadow`          | Standard depth shadow                 | `0 4px 6px rgba(0, 0, 0, 0.1)`   |
| `--global-shadow-lg`       | Deep shadow for floating elements     | `0 10px 15px rgba(0, 0, 0, 0.1)` |
| `--global-font-family`     | Primary font stack                    | `'Inter', system-ui, sans-serif` |
| `--global-font-mono`       | Monospace font stack                  | `'JetBrains Mono', monospace`    |
| `--global-transition-fast` | Fast transition for hovers            | `150ms ease`                     |
| `--global-transition`      | Standard transition for state changes | `300ms ease`                     |

#### Glassmorphism

| Variable          | Description                  | Default Value                      |                      Preview                       |
| :---------------- | :--------------------------- | :--------------------------------- | :------------------------------------------------: |
| `--glass-bg`      | Translucent background       | `rgba(255, 255, 255, 0.7)`         | ![rgba](https://placehold.co/20/ffffff/ffffff.png) |
| `--glass-blur`    | Blur strength                | `12px`                             |                         —                          |
| `--glass-opacity` | Opacity override             | `1`                                |                         —                          |
| `--glass-border`  | Translucent border           | `rgba(255, 255, 255, 0.3)`         |                         —                          |
| `--glass-shadow`  | Soft shadow for glass effect | `0 8px 32px 0 rgba(0, 0, 0, 0.08)` |                         —                          |

#### App Header

| Variable           | Description                         | Default Value       | Preview |
| :----------------- | :---------------------------------- | :------------------ | :-----: |
| `--header-bg`      | Header background color             | `var(--background)` |    —    |
| `--header-bg-dark` | Header background for dark variants | `var(--foreground)` |    —    |
| `--header-border`  | Header bottom border                | `var(--border)`     |    —    |
| `--header-text`    | Header text color                   | `var(--foreground)` |    —    |
| `--header-accent`  | Accent color in header              | `var(--primary)`    |    —    |
| `--header-height`  | Fixed height of the header          | `4rem`              |    —    |

#### Feature: Auth

| Variable                | Description                | Default Value               | Preview |
| :---------------------- | :------------------------- | :-------------------------- | :-----: |
| `--auth-page-bg`        | Background for login pages | `var(--muted)`              |    —    |
| `--auth-input-bg`       | Input field background     | `var(--background)`         |    —    |
| `--auth-input-border`   | Input field border         | `var(--border)`             |    —    |
| `--auth-input-text`     | Input text color           | `var(--foreground)`         |    —    |
| `--auth-button-bg`      | Login button background    | `var(--primary)`            |    —    |
| `--auth-button-text`    | Login button text          | `var(--primary-foreground)` |    —    |
| `--auth-title-color`    | Title text color           | `var(--foreground)`         |    —    |
| `--auth-subtitle-color` | Subtitle text color        | `var(--muted-foreground)`   |    —    |
| `--auth-label-color`    | Form label color           | `var(--foreground)`         |    —    |
| `--auth-link-color`     | Links color in auth forms  | `var(--primary)`            |    —    |
| `--auth-card-shadow`    | Shadow for auth card       | `var(--global-shadow)`      |    —    |
| `--auth-card-radius`    | Radius for auth card       | `var(--global-radius-lg)`   |    —    |

#### Feature: Admin

| Variable                  | Description                     | Default Value             | Preview |
| :------------------------ | :------------------------------ | :------------------------ | :-----: |
| `--admin-sidebar-bg`      | Sidebar background (Dark)       | `var(--foreground)`       |    —    |
| `--admin-sidebar-text`    | Sidebar text (Light)            | `var(--background)`       |    —    |
| `--admin-sidebar-hover`   | Sidebar hover state             | `var(--muted-foreground)` |    —    |
| `--admin-content-bg`      | Main content area background    | `var(--muted)`            |    —    |
| `--admin-card-bg`         | Card background in dashboard    | `var(--background)`       |    —    |
| `--admin-card-text`       | Card text color                 | `var(--foreground)`       |    —    |
| `--admin-border-color`    | Border color for admin elements | `var(--border)`           |    —    |
| `--admin-heading-color`   | Heading color                   | `var(--foreground)`       |    —    |
| `--admin-muted-text`      | Secondary text in admin         | `var(--muted-foreground)` |    —    |
| `--admin-sidebar-width`   | Width of the sidebar            | `16rem`                   |    —    |
| `--admin-sidebar-padding` | Padding inside sidebar          | `1rem`                    |    —    |
| `--admin-content-padding` | Padding for content area        | `2rem`                    |    —    |

#### Feature: Landing Page

| Variable                            | Description                          | Default Value       |                        Preview                        |
| :---------------------------------- | :----------------------------------- | :------------------ | :---------------------------------------------------: |
| `--landing-hero-gradient-primary`   | Primary blob color (HSL)             | `221.2 83.2% 53.3%` |                           —                           |
| `--landing-hero-gradient-secondary` | Secondary blob color (HSL)           | `262.1 83.3% 57.8%` |                           —                           |
| `--landing-blob-opacity`            | Opacity of animated background blobs | `0.2`               |                           —                           |
| `--landing-blob-1-duration`         | Animation duration for first blob    | `25s`               |                           —                           |
| `--landing-blob-2-duration`         | Animation duration for second blob   | `35s`               |                           —                           |
| `--landing-card-glass-bg`           | Card background color (HSL)          | `0 0% 100%`         | ![#ffffff](https://placehold.co/20/ffffff/ffffff.png) |
| `--landing-card-glass-alpha`        | Card background opacity              | `0.8`               |                           —                           |
| `--landing-card-glass-border`       | Card border color (HSL)              | `0 0% 100%`         | ![#ffffff](https://placehold.co/20/ffffff/ffffff.png) |
| `--landing-card-glass-border-alpha` | Card border opacity                  | `0.1`               |                           —                           |
| `--landing-hero-bg`                 | Hero section background fallback     | `0 0% 100%`         | ![#ffffff](https://placehold.co/20/ffffff/ffffff.png) |
| `--landing-hero-text`               | Hero section text color              | `222.2 84% 4.9%`    |                           —                           |
| `--landing-footer-bg`               | Footer background color              | `210 40% 96.1%`     |                           —                           |
| `--landing-footer-text`             | Footer text color                    | `215.4 16.3% 46.9%` |                           —                           |
| `--landing-feature-icon-primary`    | Feature icon 1 (Pink)                | `346.8 77.2% 49.8%` |                           —                           |
| `--landing-feature-icon-secondary`  | Feature icon 2 (Blue)                | `217.2 91.2% 59.8%` |                           —                           |
| `--landing-feature-icon-tertiary`   | Feature icon 3 (Purple)              | `262.1 83.3% 57.8%` |                           —                           |

#### Feature: Donation

| Variable                                 | Description                    | Default Value               | Preview |
| :--------------------------------------- | :----------------------------- | :-------------------------- | :-----: |
| `--donation-title-color`                 | Title color for donation flow  | `var(--foreground)`         |    —    |
| `--donation-subtitle-color`              | Subtitle color                 | `var(--muted-foreground)`   |    —    |
| `--donation-card-radius`                 | Card radius                    | `var(--global-radius-lg)`   |    —    |
| `--donation-button-radius`               | Button radius                  | `var(--global-radius)`      |    —    |
| `--donation-amount-button-bg`            | Amount button default bg       | `var(--background)`         |    —    |
| `--donation-amount-button-text`          | Amount button default text     | `var(--foreground)`         |    —    |
| `--donation-amount-button-selected-bg`   | Selected amount bg             | `var(--primary)`            |    —    |
| `--donation-amount-button-selected-text` | Selected amount text           | `var(--primary-foreground)` |    —    |
| `--donation-next-button-bg`              | Next step button bg            | `var(--primary)`            |    —    |
| `--donation-next-button-text`            | Next step button text          | `var(--primary-foreground)` |    —    |
| `--donation-input-bg`                    | Input background               | `var(--background)`         |    —    |
| `--donation-input-text`                  | Input text                     | `var(--foreground)`         |    —    |
| `--donation-input-border`                | Input border                   | `var(--border)`             |    —    |
| `--donation-label-color`                 | Input label                    | `var(--foreground)`         |    —    |
| `--donation-page-gradient`               | Page background gradient       | `linear-gradient(...)`      |    —    |
| `--donation-card-shadow`                 | Main card shadow               | `var(--global-shadow-lg)`   |    —    |
| `--donation-amount-gap`                  | Spacing between amount buttons | `0.75rem`                   |    —    |

#### Feature: Thank You

| Variable                    | Description                        | Default Value                     |                        Preview                        |
| :-------------------------- | :--------------------------------- | :-------------------------------- | :---------------------------------------------------: |
| `--thankyou-gradient-start` | Gradient start color               | `var(--secondary)`                |                           —                           |
| `--thankyou-gradient-via`   | Gradient middle color              | `var(--primary)`                  |                           —                           |
| `--thankyou-gradient-end`   | Gradient end color                 | `var(--ring)`                     |                           —                           |
| `--thankyou-card-bg`        | Card background (semi-transparent) | `rgba(255, 255, 255, 0.9)`        |  ![rgba](https://placehold.co/20/ffffff/ffffff.png)   |
| `--thankyou-card-radius`    | Card radius                        | `var(--global-radius-lg)`         |                           —                           |
| `--thankyou-card-shadow`    | Card elevation                     | `0 25px 50px rgba(0, 0, 0, 0.25)` |                           —                           |
| `--thankyou-card-border`    | Card border                        | `rgba(255, 255, 255, 0.2)`        |                           —                           |
| `--thankyou-title-color`    | Title text color                   | `var(--primary)`                  |                           —                           |
| `--thankyou-message-color`  | Message text color                 | `var(--muted-foreground)`         |                           —                           |
| `--thankyou-icon-color`     | Success icon color                 | `var(--global-success-color)`     |                           —                           |
| `--thankyou-icon-bg`        | Success icon background            | `var(--global-success-bg)`        |                           —                           |
| `--thankyou-receipt-bg`     | Receipt section background         | `var(--muted)`                    |                           —                           |
| `--thankyou-receipt-label`  | Receipt label color                | `var(--muted-foreground)`         |                           —                           |
| `--thankyou-receipt-text`   | Receipt value color                | `var(--foreground)`               |                           —                           |
| `--thankyou-share-label`    | Share section label                | `var(--muted-foreground)`         |                           —                           |
| `--thankyou-share-twitter`  | Twitter brand color                | `#0ea5e9`                         | ![#0ea5e9](https://placehold.co/20/0ea5e9/0ea5e9.png) |
| `--thankyou-share-facebook` | Facebook brand color               | `#2563eb`                         | ![#2563eb](https://placehold.co/20/2563eb/2563eb.png) |
| `--thankyou-share-linkedin` | LinkedIn brand color               | `#1d4ed8`                         | ![#1d4ed8](https://placehold.co/20/1d4ed8/1d4ed8.png) |
| `--thankyou-button-bg`      | Action button background           | `var(--primary)`                  |                           —                           |
| `--thankyou-button-text`    | Action button text                 | `var(--primary-foreground)`       |                           —                           |

#### Feature: Live Screen (Shared) {: #feature-live-screen }

These variables are shared across all live themes:

| Variable                  | Description                           | Default Value                 |                        Preview                        |
| :------------------------ | :------------------------------------ | :---------------------------- | :---------------------------------------------------: |
| `--live-status-indicator` | Online status dot                     | `var(--global-success-color)` |                           —                           |
| `--live-amount-color`     | Amount display color                  | `var(--global-success-color)` |                           —                           |
| `--live-avatar-bg-start`  | Avatar gradient start                 | `var(--primary)`              |                           —                           |
| `--live-avatar-bg-end`    | Avatar gradient end                   | `var(--secondary)`            |                           —                           |
| `--live-feed-item-bg`     | Background for donation feed items    | `rgba(15, 23, 42, 0.6)`       |  ![rgba](https://placehold.co/20/0f172a/0f172a.png)   |
| `--live-feed-item-border` | Border for donation feed items        | `rgba(51, 65, 85, 0.5)`       |                           —                           |
| `--live-text-main`        | Main text color                       | `var(--primary-foreground)`   |                           —                           |
| `--live-text-title`       | Color for primary titles              | `var(--primary-foreground)`   |                           —                           |
| `--live-text-subtitle`    | Color for subtitles                   | `var(--muted-foreground)`     |                           —                           |
| `--live-text-secondary`   | Secondary text color                  | `var(--muted-foreground)`     |                           —                           |
| `--live-text-muted`       | Muted text color                      | `var(--muted-foreground)`     |                           —                           |
| `--live-gauge-shadow`     | Gauge glow/shadow effect              | `rgba(168, 85, 247, 0.3)`     |                           —                           |
| `--live-gauge-track`      | Gauge background track color          | `rgba(255, 255, 255, 0.05)`   |                           —                           |
| `--live-qr-bg`            | Background color for QR codes         | `#ffffff`                     | ![#ffffff](https://placehold.co/20/ffffff/ffffff.png) |
| `--live-qr-fg`            | Foreground/pattern color for QR codes | `#000000`                     | ![#000000](https://placehold.co/20/000000/000000.png) |

#### Feature: Live Screen (Classic Theme)

| Variable                               | Description                     | Default Value               |                      Preview                       |
| :------------------------------------- | :------------------------------ | :-------------------------- | :------------------------------------------------: |
| `--live-classic-bg`                    | Live screen background          | `var(--foreground)`         |                         —                          |
| `--live-classic-header-text`           | Header text color               | `var(--primary-foreground)` |                         —                          |
| `--live-classic-label-text`            | Label text color                | `var(--muted-foreground)`   |                         —                          |
| `--live-classic-goal-text`             | Goal label color                | `var(--muted-foreground)`   |                         —                          |
| `--live-classic-bg-accent-1`           | Background glowing orb 1        | `rgba(88, 28, 135, 0.4)`    | ![rgba](https://placehold.co/20/581c87/581c87.png) |
| `--live-classic-bg-accent-2`           | Background glowing orb 2        | `rgba(30, 58, 138, 0.4)`    | ![rgba](https://placehold.co/20/1e3a8a/1e3a8a.png) |
| `--live-classic-bg-blur`               | Blur amount for background orbs | `120px`                     |                         —                          |
| `--live-classic-title-color`           | Classic theme title color       | `var(--primary-foreground)` |                         —                          |
| `--live-classic-highlight-color`       | Highlighted text color          | `var(--primary-foreground)` |                         —                          |
| `--live-classic-qr-bg`                 | QR code container background    | `var(--primary-foreground)` |                         —                          |
| `--live-classic-qr-shadow`             | QR code shadow/glow             | `rgba(168, 85, 247, 0.4)`   |                         —                          |
| `--live-classic-counter-gradient-from` | Counter gradient start          | `var(--primary-foreground)` |                         —                          |
| `--live-classic-counter-gradient-to`   | Counter gradient end            | `var(--muted-foreground)`   |                         —                          |
| `--live-classic-gauge-size`            | Size of the main gauge          | `500px`                     |                         —                          |
| `--live-classic-gauge-stroke`          | Stroke width of the gauge       | `12`                        |                         —                          |
| `--live-classic-qr-size`               | Size of the QR code             | `120px`                     |                         —                          |
| `--live-classic-counter-size`          | Font size of the main counter   | `6rem`                      |                         —                          |
| `--live-classic-counter-weight`        | Font weight of the main counter | `900`                       |                         —                          |
| `--live-classic-qr-radius`             | Border radius of QR container   | `0.75rem`                   |                         —                          |
| `--live-classic-logo-radius`           | Border radius of Logo           | `0.5rem`                    |                         —                          |

#### Feature: Live Screen (Modern Theme)

| Variable                       | Description                         | Default Value                        |                        Preview                        |
| :----------------------------- | :---------------------------------- | :----------------------------------- | :---------------------------------------------------: |
| `--live-modern-bg`             | Modern theme background color       | `#ffffff`                            | ![#ffffff](https://placehold.co/20/ffffff/ffffff.png) |
| `--live-modern-text`           | Modern theme primary text color     | `#18181b`                            | ![#18181b](https://placehold.co/20/18181b/18181b.png) |
| `--live-modern-header-bg`      | Header background with transparency | `rgba(255, 255, 255, 0.8)`           |  ![rgba](https://placehold.co/20/ffffff/ffffff.png)   |
| `--live-modern-sidebar-bg`     | Sidebar background color            | `#18181b`                            | ![#18181b](https://placehold.co/20/18181b/18181b.png) |
| `--live-modern-sidebar-text`   | Sidebar text color                  | `#ffffff`                            | ![#ffffff](https://placehold.co/20/ffffff/ffffff.png) |
| `--live-modern-accent`         | Modern theme accent color           | `var(--primary)`                     |                           —                           |
| `--live-modern-gauge-fill`     | Gauge progress fill color           | `#ffffff`                            | ![#ffffff](https://placehold.co/20/ffffff/ffffff.png) |
| `--live-modern-gauge-track`    | Gauge background track color        | `#27272a`                            | ![#27272a](https://placehold.co/20/27272a/27272a.png) |
| `--live-modern-feed-bg`        | Feed background color               | `#ffffff`                            | ![#ffffff](https://placehold.co/20/ffffff/ffffff.png) |
| `--live-modern-feed-border`    | Feed container border               | `transparent`                        |                           —                           |
| `--live-modern-feed-shadow`    | Feed container shadow               | `0 2px 8px -2px rgba(0, 0, 0, 0.08)` |                           —                           |
| `--live-modern-text-secondary` | Secondary text color in feed        | `#71717a`                            | ![#71717a](https://placehold.co/20/71717a/71717a.png) |
| `--live-modern-qr-bg`          | QR Code background color            | `#fafafa`                            | ![#fafafa](https://placehold.co/20/fafafa/fafafa.png) |
| `--live-modern-qr-fg`          | QR Code foreground color            | `#000000`                            | ![#000000](https://placehold.co/20/000000/000000.png) |

#### Feature: Live Screen (Elegant Theme)

| Variable                        | Description                       | Default Value             |                        Preview                        |
| :------------------------------ | :-------------------------------- | :------------------------ | :---------------------------------------------------: |
| `--live-elegant-bg`             | Elegant theme background color    | `#0f172a`                 | ![#0f172a](https://placehold.co/20/0f172a/0f172a.png) |
| `--live-elegant-text`           | Elegant theme primary text color  | `#f8fafc`                 | ![#f8fafc](https://placehold.co/20/f8fafc/f8fafc.png) |
| `--live-elegant-gold`           | Signature gold color              | `#d4af37`                 | ![#d4af37](https://placehold.co/20/d4af37/d4af37.png) |
| `--live-elegant-gold-light`     | Highlight gold/yellow color       | `#fcd34d`                 | ![#fcd34d](https://placehold.co/20/fcd34d/fcd34d.png) |
| `--live-elegant-card-bg`        | Card background with transparency | `rgba(30, 41, 59, 0.5)`   |  ![rgba](https://placehold.co/20/1e293b/1e293b.png)   |
| `--live-elegant-feed-bg`        | Feed background color             | `rgba(30, 41, 59, 0.4)`   |  ![rgba](https://placehold.co/20/1e293b/1e293b.png)   |
| `--live-elegant-feed-border`    | Feed border color                 | `rgba(212, 175, 55, 0.2)` |                           —                           |
| `--live-elegant-text-secondary` | Secondary text color in feed      | `#94a3b8`                 | ![#94a3b8](https://placehold.co/20/94a3b8/94a3b8.png) |
| `--live-elegant-amount-color`   | Donation amount text color        | `#fbbf24`                 | ![#fbbf24](https://placehold.co/20/fbbf24/fbbf24.png) |
| `--live-elegant-glass-blur`     | Blur amount for glass effect      | `4px`                     |                           —                           |
| `--live-elegant-qr-bg`          | QR Code background color          | `#ffffff`                 | ![#ffffff](https://placehold.co/20/ffffff/ffffff.png) |
| `--live-elegant-qr-fg`          | QR Code foreground color          | `#000000`                 | ![#000000](https://placehold.co/20/000000/000000.png) |

#### Feature: Staff

| Variable                            | Description                 | Default Value                   |                        Preview                        |
| :---------------------------------- | :-------------------------- | :------------------------------ | :---------------------------------------------------: |
| `--staff-page-bg`                   | Staff page background       | `var(--muted)`                  |                           —                           |
| `--staff-display-bg`                | Amount display background   | `var(--background)`             |                           —                           |
| `--staff-display-border`            | Amount display border       | `var(--border)`                 |                           —                           |
| `--staff-keypad-bg`                 | Keypad area background      | `var(--background)`             |                           —                           |
| `--staff-keypad-button-bg`          | Keypad button background    | `var(--secondary)`              |                           —                           |
| `--staff-keypad-button-text`        | Keypad button text          | `var(--secondary-foreground)`   |                           —                           |
| `--staff-input-bg`                  | Input background            | `var(--background)`             |                           —                           |
| `--staff-input-text`                | Input text                  | `var(--foreground)`             |                           —                           |
| `--staff-input-border`              | Input border                | `var(--border)`                 |                           —                           |
| `--staff-input-placeholder`         | Placeholder text color      | `var(--muted-foreground)`       |                           —                           |
| `--staff-keypad-shadow`             | Key button shadow           | `rgba(0, 0, 0, 0.05)`           |                           —                           |
| `--staff-keypad-delete-bg`          | Delete button background    | `var(--global-error-color)`     |                           —                           |
| `--staff-keypad-delete-hover`       | Delete button hover state   | `#dc2626`                       | ![#dc2626](https://placehold.co/20/dc2626/dc2626.png) |
| `--staff-keypad-button-height`      | Height of keypad buttons    | `4rem`                          |                           —                           |
| `--staff-amount-size`               | Font size of amount display | `3rem`                          |                           —                           |
| `--staff-keypad-gap`                | Gap between keys            | `0.75rem`                       |                           —                           |
| `--staff-display-radius`            | Radius of amount display    | `var(--global-radius)`          |                           —                           |
| `--staff-keypad-radius`             | Radius of keypad container  | `var(--global-radius-lg)`       |                           —                           |
| `--staff-label-color`               | Label text color            | `var(--foreground)`             |                           —                           |
| `--staff-amount-color`              | Amount text color           | `var(--foreground)`             |                           —                           |
| `--staff-amount-placeholder-color`  | Amount placeholder color    | `var(--muted-foreground)`       |                           —                           |
| `--staff-type-button-bg`            | Donation type button bg     | `var(--staff-keypad-button-bg)` |                           —                           |
| `--staff-type-button-text`          | Donation type button text   | `var(--foreground)`             |                           —                           |
| `--staff-type-button-border`        | Type button border          | `var(--staff-display-border)`   |                           —                           |
| `--staff-type-button-icon-color`    | Type button icon color      | `var(--foreground)`             |                           —                           |
| `--staff-type-button-selected-bg`   | Selected type background    | `var(--primary)`                |                           —                           |
| `--staff-type-button-selected-text` | Selected type text          | `var(--primary-foreground)`     |                           —                           |
| `--staff-type-button-selected-icon` | Selected type icon          | `var(--primary-foreground)`     |                           —                           |

---

### Theme Class Modifiers

The live themes can be activated by applying CSS classes:

```css
/* Modern theme overrides */
.live-theme-modern {
    --live-feed-item-bg: var(--live-modern-feed-bg);
    /* Maps to root variable common to theme */
    --live-feed-item-border: var(--live-modern-feed-border);
    --live-text-main: var(--live-modern-text);
    /* Overrideable variable */
}

/* Elegant theme overrides */
.live-theme-elegant {
    --live-feed-item-bg: var(--live-elegant-feed-bg);
    --live-feed-item-border: var(--live-elegant-feed-border);
    --live-text-main: var(--live-elegant-text);
}
```

---

## 3. Internationalization (i18n)

Translations are handled via key-value JSON resources.

- **Default**: The package includes 4 locale files:
    - `en.default.json` (English - **Source of Truth**)
    - `fr.default.json` (French)
    - `de.default.json` (German)
    - `it.default.json` (Italian)
- **Custom**: Application provides partial translation overrides via config.
- **Resolution**: `mergeLocales(locale, customResources)` performs a deep merge.

### Translation File Structure

Keys are nested by feature to ensure modularity:

```json
{
    "admin": {
        "header": { "title": "Admin Dashboard" },
        "sidebar": { "dashboard": "Dashboard", "events": "Events" }
    },
    "donation": {
        "title": "Make a Donation",
        "submit": "Donate Now",
        "amount": { "label": "Amount", "custom": "Custom Amount" }
    },
    "staff": {
        "ui_keypad": "Keypad",
        "collector": { "title": "Collector" }
    },
    "thankyou": {
        "title": "Thank You!",
        "receipt": { "id": "Receipt ID", "amount": "Amount" }
    }
}
```

### Config Overrides (Flat Structure)

In the `EventConfig`, locale overrides use a **flat key structure** where keys are dot-notated paths:

```json
{
    "locales": {
        "default": "fr",
        "supported": ["fr", "en", "de", "it"],
        "overrides": {
            "fr": {
                "donation.submit": "Faire un don maintenant",
                "donation.title": "Soutenez notre cause",
                "thankyou.title": "Merci infiniment !",
                "common.form_validation_error": "Veuillez corriger les erreurs ci-dessous."
            },
            "en": {
                "donation.submit": "Give Now",
                "thankyou.title": "Thank You So Much!"
            }
        }
    }
}
```

---

## 4. Assets (Images)

- **Default**: The package exports default assets.
- **Custom**: You provide a URL string in the configuration.
- **Resolution**: Configuration Property replacement.

### Supported Assets

| key                 | Description                        |
| :------------------ | :--------------------------------- |
| `logo`              | Main application logo (Header/PDF) |
| `favicon`           | Browser tab icon                   |
| `backgroundDonor`   | Background image for Donation Page |
| `backgroundLive`    | Background image for Live Screen   |
| `backgroundLanding` | Background image for Landing Page  |

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
