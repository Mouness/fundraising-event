# Functional Specifications Document (FSD)

**Project:** Fundraising Event (Open Source & White Label)

**Version:** 1.1
**Date:** January 7, 2026

## Global Objective

The application is a complete real-time fundraising solution designed for physical events (galas, charity dinners) and hybrid events.
It allows for visualizing donation progress live to encourage generosity (gamification), managing multi-channel collections (cash, checks, online cards), and offering a turnkey "white label" solution for any NGO.

### Fundamental Principles

- **White Label:** The interface must not contain any fixed mention of the tool. Everything (logo, primary/secondary colors, fonts, background images) must be configurable via the Dashboard.
- **Real-Time:** The latency between a donation being made (mobile or manual) and its display on the projection screen must be less than 2 seconds.
- **Open Source:** The code must be structured to be easily deployable by third parties (containerization, clear documentation).

## User Roles Definition

- **Super Admin (NGO):** Configures the event, branding, connects Stripe/PayPal, manages staff access.
- **Staff / Collector:** Volunteer or employee moving through the room with a smartphone to enter physical donations (cash/checks).
- **Donor (Guest):** Person present scanning the QR code or remote person following the link.
- **Spectator:** The audience watching the projection screen.

---

## Detailed Functional Modules

### 1. Administration Dashboard (Back-Office)

This is the central control plane, accessible via web browser (Desktop/Tablet).

**A. Platform Context (Root Level)**

- **Overview:** Global management of the platform instance.
- **Event List:** View, Create, and Delete fundraising events.
- **Global Settings:**
    - **Identity:** Organization name, contact info, legal details for tax receipts.
    - **Payment:** Switch between Stripe and PayPal providers.
    - **Brand Design:** Live CSS variable editor for global theming.
    - **Localization:** Manage supported languages (`en`, `fr`, `de`, `it`) and translation overrides.
    - **Communication:** Default email sender and subject lines.

**B. Event Context (Event Level)**
Navigation switches to manage a specific selected event:

- **Dashboard:** High-level metrics (Total Raised, Donor Count), Recent Activity feed.
- **Donations:** Comprehensive transaction table with:
    - **Management:** Status filtering (Completed, Pending, Failed).
    - **Export:** ZIP Export (PDF Receipts).
- **Design & Config:**
    - **Live Screen:** Select visual theme (Classic, Modern, Elegant) and gauge style.
    - **Form Builder:** Toggle fields (Phone, Address, Company, Message, Anonymous).
- **Team:**
    - Manage Staff PIN codes.
    - View real-time performance per collector.

### 2. Projection Screen (Public Front-End)

This is the interface displayed on the large screen (projector). It supports multiple layouts:

**Themes**

- **Classic:** Traditional layout with centralized circular gauge.
- **Modern:** Bold, gradient-heavy design with horizontal progress bar.
- **Elegant:** Minimalist, sophisticated typography-focused layout.

**Core Elements**

- **Gauge:** Visualizes progress towards the goal (Circular, Bar, or Minimal).
- **Counters:** Total amount, Goal, Percentage.
- **CTA:** QR Code connecting directly to the donation page.
- **Feed:** Real-time list of recent donors.
- **Animations:** Confetti celebration on big donations.

### 3. Donor Interface (Mobile Web)

Accessible via scanning the QR Code. Optimized "Mobile First".

**Donation Flow**

1.  **Selection:** Preset amount buttons + "Free Amount".
2.  **Details:** Name, Email, and optional fields (Address, Phone, Company).
3.  **Options:** "Anonymous" checkbox, Support message.
4.  **Payment:** Stripe Elements (Card, Apple Pay, Google Pay).
5.  **Success:** Thank you page with social sharing.

### 4. Staff Interface (Collector App)

Accessible on smartphone for volunteers. Optimized for speed and low-light environments.

**Features**

- **PIN Login:** Quick access via 4-digit code.
- **Offline Mode:** Donations are queued locally if network fails and synced automatically when back online.
- **Keypad:** Large numeric entry for fast input.
- **Donation Types:** Cash, Check, Pledge.

---

# Technical Specifications Document (TSD)

**Project:** Fundraising Event (Open Source & White Label)
**Version:** 1.1 (Tech)
**Date:** January 7, 2026

## 1. Architecture Overview

The project is designed as a modular web application following the **Client-Server** pattern.

### 1.1 Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, Shadcn/UI, React Query.
- **Backend:** NestJS, Prisma ORM, Socket.IO, BullMQ.
- **Infrastructure:** PostgreSQL, Redis.

## 2. Frontend Architecture (Details)

### 2.1 Project Structure

The frontend follows a feature-based architecture in `apps/web/src/features/`.

- `admin/`: Dashboard and settings.
- `auth/`: Login pages.
- `donation/`: Public donation flow.
- `events/`: Event management logic.
- `live/`: Real-time projection screen.
- `public/`: Landing pages.
- `staff/`: Collector app.

### 2.2 Shared Packages Strategy (Monorepo)

- `packages/types`: DTOs shared between NestJS (Backend) and React (Frontend).
- `packages/white-labeling`: Shared logic for Theme, Assets, and Configuration.
    - **Locales:** `src/locales/` contains `en.default.json`, `fr.default.json`, `de.default.json`, `it.default.json`.
    - **Theming:** `src/theme/theme.default.css` contains default CSS variables.

### 2.3 State Management

- **React Query:** Server state (Donations, Events).
- **Client State:** Live mechanics, Staff queue.
    - `useLiveSocket`: Manages real-time updates.
    - `StorageService`: Manages offline staff queue in LocalStorage.

## 3. Backend Architecture (Details)

### 3.1 NestJS Modules

- **AuthModule:** JWT Strategy for Admins, PIN Strategy for Staff.
- **DonationModule:** Payment processing, Webhooks (Stripe/PayPal).
- **GatewayModule:** WebSocket management (Rooms per `event_id`).
- **PdfModule:** `pdfmake` integration for generating tax receipts.
- **QueueModule:** BullMQ for async receipt generation.
- **WhiteLabelingModule:** Loads and merges configuration.

### 3.2 Database (Prisma Schema)

```prisma
enum ConfigScope {
  GLOBAL
  EVENT
}

model Configuration {
  id               String      @id @default(uuid())
  scope            ConfigScope @default(GLOBAL)
  entityId         String?     // Null for GLOBAL, matches Event.id for EVENT

  // Isolated Identity
  organization     String?
  address          String?
  phone            String?
  logo             String?
  email            String?
  website          String?

  // Granular JSON Blocks
  themeVariables   Json?       // Record<string, string>
  assets           Json?
  event            Json?       // Content settings (title, etc)
  form             Json?
  communication    Json?
  payment          Json?
  socialNetwork    Json?
  locales          Json?       // Overrides
  liveTheme        String?     // "classic", "modern", "elegant"

  updatedAt        DateTime    @updatedAt
  @@unique([scope, entityId])
}

model Event {
  id            String   @id @default(uuid())
  slug          String   @unique
  name          String
  goalAmount    Decimal
  status        String   @default("active")
  donations     Donation[]
  staffMembers  StaffMember[]
  // ... timestamps
}

model StaffMember {
  id        String   @id @default(uuid())
  code      String   @unique
  name      String
  // ... relations
}

model Donation {
  id            String   @id @default(uuid())
  amount        Decimal
  status        String   // PENDING, COMPLETED, FAILED, CANCELLED, REFUNDED
  paymentMethod String   // STRIPE, PAYPAL, CASH, CHECK, PLEDGE
  transactionId String?  @unique
  eventId       String
  staffMemberId String?
  isAnonymous   Boolean  @default(false)
  // ... fields
}
```

## 4. Security & Deployment

### 4.1 Security

- **API Rate Limiting:** `ThrottlerModule` enabled.
- **Authentication:** JWT (Bearer) for Admin API, PIN code for Staff API.
- **Payment Isolation:** No card data touches the backend (Stripe Elements).

### 4.2 Internationalization (i18n)

- **Library:** `react-i18next`.
- **Loader:** `syncLocales` helper merges default JSONs with Backend overrides.
- **Supported:** English, French, German, Italian.

## 5. Roadmap / Future

1.  **Hybrid Module:** Web Widget & OBS Overlay.
2.  **Advanced Analytics:** Compare events performance.
3.  **Multi-Tenant:** SaaS capabilities.
