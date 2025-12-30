# Functional Specifications Document (FSD)

**Project:** Fundraising Event (Open Source & White Label)

**Version:** 1.0

## Global Objective
The application is a complete real-time fundraising solution designed for physical events (galas, charity dinners) and hybrid events.
It allows for visualizing donation progress live to encourage generosity (gamification), managing multi-channel collections (cash, checks, online cards), and offering a turnkey "white label" solution for any NGO.

### Fundamental Principles
* **White Label:** The interface must not contain any fixed mention of the tool. Everything (logo, primary/secondary colors, fonts, background images) must be configurable via the Dashboard.
* **Real-Time:** The latency between a donation being made (mobile or manual) and its display on the projection screen must be less than 2 seconds.
* **Open Source:** The code must be structured to be easily deployable by third parties (containerization, clear documentation).

## User Roles Definition
* **Super Admin (NGO):** Configures the event, branding, connects Stripe, manages staff access.
* **Staff / Collector:** Volunteer or employee moving through the room with a tablet/smartphone to enter physical donations (cash/checks).
* **Donor (Guest):** Person present scanning the QR code or remote person following the link.
* **Spectator:** The audience watching the projection screen.

---

## Detailed Functional Modules

### 1. Administration Dashboard (Back-Office)
This is the control center. It must be accessible via web browser (Desktop/Tablet).

**Event Configuration**
* **Identity:** Event Name, Date, Description.
* **Goals:** Target amount (Goal) in local currency (multi-currency supported: EUR, USD, CHF, etc.).
* **Starting Gauge:** Ability to enter an initial amount (e.g., donations received before the event).

**Customization (White Label)**
* **Branding:** Upload NGO Logo and Event Logo.
* **Theme:** Color Picker for: Primary Color (Gauge), Secondary Color, Background Color or Background Image.
* **Texts:** Customization of encouragement messages displayed on the screen.

**Donation Management**
* **Dashboard:** Chronological list of all donations (Stripe + Manual).
* **Actions:** Ability to edit a donation (entry error), cancel it, or hide it from the projection screen (moderation).
* **Export:** "Export CSV" button containing: Date, Last Name, First Name, Email, Amount, Method, Status.

**Stripe Configuration**
* OAuth connection module or API key entry (Publishable/Secret keys) to link the NGO's Stripe account.

**Authentication & Security**
* **External Identity Providers:** Support for integrating external token providers (Auth0, Okta, Clerk, Kinde, Keycloak, Firebase, etc.) for Admin access.
* **Role Management:** Mapping of external provider roles to internal application roles (Super Admin, Observer).

**Fiscal Management and Receipts**
* **Legal Entity Configuration:** Mandatory fields for the NGO: Legal Name, HQ Address, Registration Number (RNA/SIRET/UID), Official Logo for documents.
* **Signature:** Upload area for the President/Treasurer's signature image (to automatically sign receipts).
* **Receipt Template:** Simple editor (or variables) to customize the legal text of the receipt (e.g., "Receipt under Article 200 of the General Tax Code...").
* **Manual Generation:** Ability for the admin to generate a specific unitary PDF receipt for a specific donation (case of a later request) or regenerate a lost receipt.
* **Global Export:** Ability to download a ZIP archive containing all PDFs generated over a given period.

### 2. Projection Screen (Public Front-End)
This is the interface displayed on the large screen (projector). It must be "Responsive" but optimized for 16:9 format.

**The Gauge (Progress Bar)**
* **Visual:** A bar or animated thermometer that fills from 0% to 100% (and beyond, with an "Explosion" effect if the goal is exceeded).
* **Counters:**
    * Total amount collected (Large font, updated in real-time with "rolling number" effect).
    * Final Goal.
    * Percentage reached.

**Call to Action (CTA)**
* **QR Code:** A static QR Code (automatically generated based on the event URL) displayed permanently (corner of the screen or centered depending on layout).

**Notifications (Pop-ups)**
* **Per Donation:** At each new validated donation: A notification appears (e.g., "Thanks to Sophie for her €50!").
* **Animation:** Confetti or sound effect (disable-able) for "Big Donations" (threshold definable by admin).
* **Carousel:** If no donation arrives for 30 seconds, scroll the names of the latest donors.

### 3. Donor Interface (Mobile Web)
Accessible via scanning the QR Code. Optimized "Mobile First".

**Home**
* Reminder of the event logo and goal.
* Simplified gauge.

**Donation Form**
* **Amount Grid:** Predefined buttons (e.g., €20, €50, €100, €500) + "Free Amount" field.
* **Contact Info:** Last Name, First Name, Email (mandatory for receipt).
* **"Anonymous" Option:** Checkbox "Do not display my name on the screen".
* **Message:** Optional field "Leave a support message" (limited to 140 characters).

**Payment**
* Stripe Elements Integration (Support for Credit Card, Apple Pay, Google Pay).
* Instant validation.

**Post-Donation**
* Thank you page.
* Social Media Share buttons (Facebook, X, LinkedIn, WhatsApp) with pre-filled text: "I just donated to [Event Name], join us!".
* Automatic sending of a tax receipt email (simple editable HTML template).

### 4. Staff Interface (Manual Entry)
Accessible on smartphone/tablet for volunteers. Clean "Dark Mode" interface to not dazzle in a dark room.

**Quick Entry**
* Large numeric keypad (calculator type).
* **Donation Type:** Toggle buttons: "Cash", "Check", "Pledge".

**Donor Information**
* **If Check/Pledge:** Last Name/First Name/Email fields mandatory (for later follow-up).
* **If Cash:** Optional fields (can be entered as "Anonymous Donor").

**Validation**
* Large "Add" button. The donation is immediately added to the global total and triggers the animation on the projection screen.

### 5. Hybrid / Social Media Module
For events broadcast online.

**Web Widget (Iframe)**
* Provide an `<iframe>` code in the dashboard allowing the embedding of the Gauge + "Donate" Button on the NGO's website.

**Stream Overlay (OBS)**
* Special "Green Screen" (Chroma Key) or transparent background display mode allowing video technicians to overlay the gauge and alerts on top of the live video feed (YouTube/Twitch).

---

## Data Flow (Workflow)
1.  **Initialization:** The NGO creates the event and customizes colors.
2.  **Event Starts:** The projection screen is launched in full-screen mode.
3.  **Mobile Donation:** A guest scans the QR -> Pays via Stripe -> Server receives webhook -> Server pushes info via Websocket to projection screen -> Animation + Total Update.
4.  **Physical Donation:** A guest gives €50 in cash to Staff -> Staff enters "50" on their app -> Validation -> Server pushes info via Websocket -> Animation + Total Update.
5.  **Closing:** The admin exports the donor list for accounting and sending official tax receipts.

## Non-Functional Requirements (Quality)
* **Availability:** The application must function even if the internet connection is unstable ("Queue" mode for staff entries: if network loss, donations are stored locally and sent as soon as the connection returns).
* **Security:** Donor data (PII) must be encrypted. No banking data passes through the application (everything is managed by the Stripe iframe).
* **Scalability:** Capacity to handle a peak of 1000 simultaneous connections (during the call for donations).

---
---

# Technical Specifications Document (TSD)

**Project:** Fundraising Event (Open Source & White Label)
**Version:** 1.0 (Tech)
**Date:** December 20, 2024

## 1. Architecture Overview
The project is designed as a modular web application following the **Client-Server** pattern.
It is structured to maximize **Real-Time** performance (Live Screen) and design flexibility (**White Label**).

### 1.1 Logical Diagram

```text
[Mobile Donor] <--> [Stripe Gateway]
|                      | (Webhook)
v                      v
[Frontend React] <--> [API NestJS / Socket.io] <--> [PostgreSQL]
^                      ^
|                      | (Pub/Sub)
[Live Screen]        [Redis / BullMQ]
```


## 3. Frontend Architecture (Details)

### 3.1 Folder Structure (Feature-based)
We are abandoning pure Atomic Design in favor of a business feature-based structure, which is more readable for Open Source.

```bash
src/
├── app/                  # Global configuration (Providers, Router)
├── features/             # Core application logic
│   ├── admin/            # Dashboard and configuration
│   ├── auth/             # Authentication pages
│   ├── donation/         # Donation logic (Form, Stripe)
│   ├── event/            # Event Logic & Hooks
│   ├── live/             # Screen components (Gauge, Confetti)
│   ├── public/           # Static pages
│   └── staff/            # Manual collection interface
├── components/           # Shared UI Primitives
│   └── ui/               # Shadcn/UI Components
├── hooks/                # Generic Hooks
├── lib/                  # Utilities (api, i18n, utils)
├── providers/            # React Context Providers
└── stores/               # Global Jotai Atoms
```

### 3.2 Shared Packages Strategy (Monorepo)
*   `packages/types`: DTOs shared between NestJS (Backend) and React (Frontend).
*   `packages/white-labeling`: Shared logic for Theme, Assets, and Configuration.
    *   **Single Source of Truth:** Contains default assets (Logos) and CSS variables.
    *   **Deep Merge:** Frontend and Backend use the same logic to merge Defaults < Config File < Database.

### 3.3 State Management (Jotai + Query)
* **Example "Donation List" (Admin):** Managed by `useQuery(['donations'], fetchDonations)`.
* **Example "Live Counter":** Managed by a Jotai atom.

**TypeScript:**
```typescript
// store.ts
export const totalAmountAtom = atom(0);
// WebSocket Listener updates the atom directly
socket.on('donation', (data) => store.set(totalAmountAtom, (prev) => prev + data.amount));
```

### 4.1 NestJS Modules
* **AuthModule:** JWT Management (Admin) and PIN Code (Staff).
* **DonationModule:** Transaction management, Stripe Webhooks.
* **EventConfigModule:** Centralized config loader (DB + File + Defaults).
* **EventModule:** CRUD of events and visual configuration.
* **GatewayModule:** WebSocket management (Rooms per `event_id`).
* **PdfModule:** `pdfmake` integration for generating tax receipts.
* **QueueModule:** BullMQ Producers/Consumers for PDF generation and Emails.

### 4.2 Database (Prisma Schema)
```prisma
model Event {
  id            String   @id @default(uuid())
  slug          String   @unique
  name          String
  goalAmount    Decimal
  themeConfig   Json     // Stores { primaryColor, logoUrl, etc. }
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  donations     Donation[]
  staffCodes    StaffCode[]
}

model StaffCode {
    id        String @id @default(uuid())
    code      String @unique // The pin code
    name      String // Name of the volunteer
    eventId   String
    event     Event  @relation(fields: [eventId], references: [id])
}

model Donation {
  id            String   @id @default(uuid())
  amount        Decimal
  currency      String   @default("EUR")
  donorName     String?  // Null if anonymous
  donorEmail    String?
  message       String?  // Support message
  isAnonymous   Boolean  @default(false)
  status        String   // PENDING, SUCCEEDED, FAILED, CANCELLED
  paymentMethod String   // STRIPE, CASH, CHECK, PLEDGE
  stripePaymentIntentId String? @unique
  eventId       String
  event         Event    @relation(fields: [eventId], references: [id])
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

### 4.3 API Definitions

**Authentication**
*   `POST /auth/login` - Admin Login (returns JWT).
*   `POST /auth/staff/login` - Staff Login (Code based, returns Session Token).
*   `POST /auth/refresh` - Refresh Access Token.

**Events**
*   `GET /events` - List all events (Admin).
*   `GET /events/:slug` - Get public event details (Theme, Goal).
*   `POST /events` - Create a new event (Admin).
*   `PATCH /events/:id` - Update event configuration.

**Donations**
*   `GET /donations` - List donations with filters (Admin).
*   `POST /donations/stripe/intent` - Create Stripe Payment Intent (Public).
*   `POST /donations/offline` - Record Cash/Check donation (Staff).
*   `PATCH /donations/:id/status` - Update donation status (Admin/Webhook).

**Live Screen**
*   `GET /live/stats/:eventId` - Initial load of counters/gauge.


### 5.1 "Online" Donation Flow (Stripe)
1.  **Client:** User fills form -> `Stripe.confirmPayment`.
2.  **Stripe:** Processes payment -> Sends `payment_intent.succeeded` Webhook to Backend.
3.  **Backend (Webhook):**
    * Verifies Stripe signature.
    * Records donation in DB (Prisma).
    * Publishes event via **Socket.io** in the `event_slug` room.
    * Adds "SendEmail" Job to BullMQ.
4.  **Frontend (Live Screen):**
    * Receives Socket event.
    * Updates the `totalAmountAtom` Jotai atom.
    * Triggers animation (Confetti) via a `lastDonationAtom`.

### 5.2 "Staff" Donation Flow (Offline Capable)
1.  **Client (Staff)::** Enter donation -> `useMutation`.
2.  **SyncService:** Intercepts the request.
3.  **If Online:** Sends directly to API.
4.  **If Offline:**
    *   Stores in `StorageService` (LocalStorage Queue).
    *   Updates UI optimistically (Total + Notification).
    *   **Auto-Sync:** `SyncService` listens for `online` event and flushes the queue automatically when connection returns.

## 6. Security & Deployment

### 6.1 Security
* **API Rate Limiting:** NestJS `ThrottlerModule` to prevent spam.
* **Validation:** Zod (Frontend) and DTOs with `class-validator` (Backend).
* **Cors:** Restricted to configured domains.
* **Isolation:** Secret Stripe API keys are never exposed to the client.

### 6.2 Dockerization
The project will be delivered with a `docker-compose.yml` orchestrating:
* `app`: The Node.js server (serving the API and Vite build static files).
* `postgres`: Database.
* `redis`: For queues and Socket.io Pub/Sub.

### 6.3 Internationalization (i18n)
* Use of `i18next` with `react-i18next`.
* Default browser language detection.
* JSON translation files in `/public/locales`.

## 7. Remaining Roadmap
1.  **Donation Management:** Admin table to Edit/Cancel/Hide donations.
2.  **CSV Export:** Raw data export for accounting.
3.  **Live Screen Visuals:** Advanced animations (Explosion, Rolling Counters).
4.  **Security Hardening:** Rate Limiting and strict RBAC.
5.  **Hybrid Module:** Web Widget & OBS Overlay.