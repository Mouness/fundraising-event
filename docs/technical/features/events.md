# Events Management

## Overview

The Events feature is the central hub for creating and configuring fundraising events. Each event is an independent entity with its own branding, settings, and donation tracking.

## Feature Breakdown

### 1. Event CRUD Operations

- **Create Event**: Define name, slug, goal amount, and initial status
- **Edit Event**: Update all event settings including branding and form configuration
- **Delete Event**: Archive or permanently remove an event
- **List Events**: View all events with status filtering

### 2. Event Configuration

Each event can be customized with:

- **General Settings**: Name, slug, goal, status, date, description
- **Form Configuration**: Toggle optional fields (phone, address, company, message, anonymous)
- **Live Screen Settings**: Select theme and gauge type
- **Branding**: Override global branding with event-specific assets
- **Communication**: Event-specific email sender settings

---

## Implementation Details

### Frontend (`apps/web`)

#### Pages

**`CreateEventPage`** (`apps/web/src/features/events/pages/CreateEventPage.tsx`):

- Simple form to create a new event with minimal required fields
- Redirects to EventSettingsPage after creation

**`EventSettingsPage`** (`apps/web/src/features/events/pages/EventSettingsPage.tsx`):

- Comprehensive settings editor with tabbed interface
- Sections: General, Form Fields, Live Screen, Branding, Communication
- Uses `react-hook-form` with Zod validation

**`DonationsPage`** (`apps/web/src/features/events/pages/DonationsPage.tsx`):

- Data table of all donations for the event
- Filtering by status, date range, payment method
- Actions: View receipt, edit status, export

#### Schemas

```typescript
// apps/web/src/features/events/schemas/event-settings.schema.ts
export const eventSettingsSchema = z.object({
    // General
    name: z.string().min(1),
    goalAmount: z.coerce.number().min(1),
    slug: z.string().min(1),
    status: z.enum(['active', 'draft', 'closed']),
    date: z.string().optional(),
    description: z.string().optional(),

    // Form Configuration
    formConfig: z.object({
        phone: z.object({ enabled: z.boolean(), required: z.boolean() }),
        address: z.object({ enabled: z.boolean(), required: z.boolean() }),
        company: z.object({ enabled: z.boolean(), required: z.boolean() }),
        message: z.object({ enabled: z.boolean(), required: z.boolean() }),
        anonymous: z.object({ enabled: z.boolean(), required: z.boolean() }),
        collectPhone: z.boolean().optional(), // Legacy or Alternative
        collectAddress: z.boolean().optional(),
        // Note: Actual implementation might vary slightly, referring to src/features/events/schemas/event-settings.schema.ts is best.
    }),

    // Live Screen
    live: z
        .object({
            theme: z.enum(['classic', 'modern', 'elegant']).default('classic'),
        })
        .optional(),

    // Branding
    useGlobalBranding: z.boolean(),
    organization: z.string().optional(),
    assets: z
        .object({
            logo: z.string().url().optional(),
            backgroundLanding: z.string().url().optional(),
            backgroundLive: z.string().url().optional(),
        })
        .optional(),

    // Communication
    communication: z
        .object({
            enabled: z.boolean(),
            senderName: z.string().optional(),
            replyTo: z.string().email().optional(),
            subjectLine: z.string().optional(),
        })
        .optional(),
})
```

#### Hooks

- **`useEvent`**: Fetches a single event by ID or slug
- **`useEvents`**: Fetches list of events with filtering
- **`useEventMutation`**: Handles create/update/delete operations

#### Context

- **`EventContext`**: Provides current event data to all child components
    - Used within `EventLayout` to scope components to a specific event

### Backend (`apps/api`)

#### Endpoints

| Method   | Endpoint         | Description         | Auth   |
| :------- | :--------------- | :------------------ | :----- |
| `GET`    | `/events`        | List all events     | Admin  |
| `GET`    | `/events/public` | List active events  | Public |
| `GET`    | `/events/:slug`  | Get event by slug   | Public |
| `POST`   | `/events`        | Create new event    | Admin  |
| `PATCH`  | `/events/:id`    | Update event config | Admin  |
| `DELETE` | `/events/:id`    | Delete event        | Admin  |

#### Service (`EventService`)

```typescript
// Key methods
async findAll(): Promise<Event[]>
async findBySlug(slug: string): Promise<Event>
async create(data: CreateEventDto): Promise<Event>
async update(id: string, data: UpdateEventDto): Promise<Event>
async delete(id: string): Promise<void>
```

---

## Data Model

The Event model stores core event information. Configuration (theme, form, communication) is stored separately in the `Configuration` model with `scope: EVENT`.

```prisma
model Event {
  id            String   @id @default(uuid())
  slug          String   @unique
  name          String
  date          DateTime @default(now())
  description   String?
  goalAmount    Decimal
  status        String   @default("active")  // active, draft, closed
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  donations     Donation[]
  staffMembers  StaffMember[]
}

// Event-specific configuration is stored here
model Configuration {
  id               String      @id @default(uuid())
  scope            ConfigScope @default(EVENT)
  entityId         String?     // Matches Event.id for EVENT scope

  themeVariables   Json?       // CSS variable overrides
  assets           Json?       // Logo, backgrounds
  form             Json?       // Form field configuration
  communication    Json?       // Email settings
  liveTheme        String?     // "classic", "modern", "elegant"
  // ... other fields

  @@unique([scope, entityId])
}
```

---

## Event States

| Status   | Description                           | Public Visibility |
| :------- | :------------------------------------ | :---------------- |
| `draft`  | Event is being configured             | Hidden            |
| `active` | Event is live and accepting donations | Visible           |
| `closed` | Event has ended                       | Hidden            |

---

## Form Field Configuration

Each optional field can be configured with two properties:

| Field     | `enabled`                    | `required`             |
| :-------- | :--------------------------- | :--------------------- |
| Phone     | Show/hide phone input        | Make phone mandatory   |
| Address   | Show/hide address input      | Make address mandatory |
| Company   | Show/hide company input      | Make company mandatory |
| Message   | Show/hide message textarea   | Make message mandatory |
| Anonymous | Show/hide anonymous checkbox | N/A                    |

Example configuration:

```json
{
    "formConfig": {
        "phone": { "enabled": true, "required": false },
        "address": { "enabled": false, "required": false },
        "company": { "enabled": true, "required": true },
        "message": { "enabled": true, "required": false },
        "anonymous": { "enabled": true, "required": false }
    }
}
```
