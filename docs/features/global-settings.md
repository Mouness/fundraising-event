# Global Settings

## Overview

The Global Settings feature provides platform-wide configuration that applies to all events unless overridden at the event level. This includes organization identity, payment provider setup, branding defaults, localization, and communication settings.

## Feature Breakdown

### 1. Organization Identity
- **Organization Name**: Legal name displayed on receipts
- **Contact Information**: Email, phone, address, website
- **Tax Information**: Registration numbers for fiscal receipts

### 2. Payment Configuration
- **Primary Provider**: Select between Stripe or PayPal
- **Currency**: Default currency for all events (EUR, USD, GBP, etc.)
- **API Credentials**: Secure storage of provider keys

### 3. Brand Design
- **CSS Variables**: Customize colors, radii, shadows
- **Assets**: Default logo, backgrounds
- **Theme Preview**: Real-time preview of changes

### 4. Localization
- **Default Locale**: Primary language (en, fr, de, it)
- **Supported Locales**: Languages available to users
- **Translation Overrides**: Custom translations for specific keys

### 5. Communication Defaults
- **Sender Configuration**: Default sender name and reply-to email
- **Email Subject**: Default subject line for receipts
- **Support Contact**: Default support email for inquiries

---

## Implementation Details

### Frontend (`apps/web`)

#### Page

**`GlobalSettingsPage`** (`apps/web/src/features/admin/pages/GlobalSettingsPage.tsx`):
- Tabbed interface for each settings category
- Auto-save functionality with optimistic updates
- Validation using Zod schemas

#### Components

| Component | Purpose |
|:---|:---|
| `IdentityForm` | Organization name and contact details |
| `PaymentForm` | Payment provider selection and currency |
| `BrandDesignForm` | CSS variable editor with preview |
| `AssetsForm` | Logo and background image uploads |
| `LocalizationForm` | Locale selection and translation overrides |
| `CommunicationForm` | Email sender defaults |

#### CSS Variable Editor

The `BrandDesignForm` provides a visual editor for CSS variables:

```tsx
// VariableRow.tsx - Individual variable editor
<VariableRow
  label="Primary Color"
  variable="--primary"
  value="#0062A7"
  type="color"
  onChange={handleChange}
/>

// VariablePreview.tsx - Live preview panel
<VariablePreview variables={cssVariables} />
```

### Backend (`apps/api`)

#### Endpoints

| Method | Endpoint | Description | Auth |
|:---|:---|:---|:---|
| `GET` | `/settings/global` | Get global configuration | Public |
| `PATCH` | `/settings/global` | Update global configuration | Admin |

#### Service (`WhiteLabelingService`)

The `WhiteLabelingService` manages global configuration:

```typescript
// Key methods
async getGlobalConfig(): Promise<GlobalConfig>
async updateGlobalConfig(data: UpdateConfigDto): Promise<GlobalConfig>
async getPublicConfig(): Promise<PublicConfig>
```

Configuration is stored in the database and merged with defaults from the `@fundraising/white-labeling` package.

---

## Configuration Schema

```typescript
interface GlobalConfig {
  // Identity
  organization: string;
  email: string;
  phone?: string;
  website?: string;
  address?: string;
  
  // Payment
  payment: {
    provider: 'stripe' | 'paypal';
    currency: string;  // ISO 4217 code
  };
  
  // Theme
  theme: {
    variables: Record<string, string>;  // CSS variable overrides
    assets: {
      logo?: string;
      favicon?: string;
      backgroundDefault?: string;
    };
  };
  
  // Locales
  locales: {
    default: string;           // e.g., 'fr'
    supported: string[];       // e.g., ['fr', 'en', 'de']
    overrides?: Record<string, Record<string, string>>;
  };
  
  // Communication
  communication: {
    senderName?: string;
    replyTo?: string;
    subjectLine?: string;
    supportEmail?: string;
    footerText?: string;
  };
}
```

---

## UI Layout

The GlobalSettingsPage is organized with a sidebar navigation:

```
┌─────────────────────────────────────────────────────┐
│  Global Settings                                    │
├──────────────┬──────────────────────────────────────┤
│              │                                      │
│  Identity    │  ┌────────────────────────────────┐  │
│  Payment     │  │  Organization Name             │  │
│  Brand       │  │  ┌──────────────────────────┐  │  │
│  Assets      │  │  │  Acme Foundation         │  │  │
│  Localization│  │  └──────────────────────────┘  │  │
│  Communication  │                                │  │
│              │  │  Email                         │  │
│              │  │  ┌──────────────────────────┐  │  │
│              │  │  │  contact@acme.org        │  │  │
│              │  │  └──────────────────────────┘  │  │
│              │  └────────────────────────────────┘  │
└──────────────┴──────────────────────────────────────┘
```

---

## CSS Variables Reference

Global settings can override any CSS variable from the theme. Common overrides include:

| Variable | Description | Example |
|:---|:---|:---|
| `--primary` | Primary brand color | `#0062A7` |
| `--primary-foreground` | Text on primary | `#FFFFFF` |
| `--radius` | Default border radius | `0.5rem` |
| `--global-font-family` | Primary font | `'Inter', sans-serif` |

See [White-Labeling > CSS Variables](../white-labeling.md#2-visual-theming-css) for the complete reference.

---

## Localization Overrides

Translation keys can be overridden globally:

```json
{
  "locales": {
    "default": "fr",
    "supported": ["fr", "en", "de", "it"],
    "overrides": {
      "fr": {
        "donation.submit": "Faire un don maintenant",
        "thankyou.title": "Merci infiniment !"
      },
      "en": {
        "donation.submit": "Give Now",
        "thankyou.title": "Thank You So Much!"
      }
    }
  }
}
```

These overrides are applied after the default translations from `@fundraising/white-labeling`.
