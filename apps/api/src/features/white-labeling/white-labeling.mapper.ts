import { Configuration, Prisma } from '@prisma/client'
import { EventConfig, defaultConfig, DeepPartial, deepMerge } from '@fundraising/white-labeling'

export class WhiteLabelingMapper {
    /**
     * Transforms database Configuration entity and optional Event entity back into the modular EventConfig structure.
     */
    static toEventConfig(config: Configuration, event?: any): EventConfig {
        // 1. Initialize from default config
        const result: EventConfig = JSON.parse(JSON.stringify(defaultConfig))

        // 2. Map root columns to partial structure (Priority: Low)
        const rootOverrides: DeepPartial<EventConfig> = {
            id: config.entityId || undefined,
            content: config.organization ? { title: config.organization } : {},
            communication: {
                legalName: config.organization || undefined,
                address: config.address || undefined,
                phone: config.phone || undefined,
                supportEmail: config.email || undefined,
                website: config.website || undefined,
            },
            theme: {
                assets: config.logo ? { logo: config.logo } : {},
            },
            live: config.liveTheme ? { theme: config.liveTheme as any } : undefined,
        }

        // 3. Map JSON blobs to partial structure (Priority: Medium)
        const blobOverrides: DeepPartial<EventConfig> = {
            theme: {
                assets: (config.assets || undefined) as any,
                variables: (config.themeVariables || undefined) as any,
            },
            content: (config.event || undefined) as any,
            donation: {
                form: (config.form || undefined) as any,
                payment: (config.payment || undefined) as any,
                sharing: (config.socialNetwork || undefined) as any,
            },
            communication: (config.communication || undefined) as any,
            locales: (config.locales || undefined) as any,
        }

        // 4. Map dynamic Event entity props (Priority: High)
        const eventOverrides: DeepPartial<EventConfig> = event
            ? {
                  id: event.id,
                  name: event.name,
                  description: event.description || '',
                  content: {
                      goalAmount: event.goalAmount ? Number(event.goalAmount) : undefined,
                  },
              }
            : {}

        // Perform single multi-source deep merge
        return deepMerge(result, rootOverrides, blobOverrides, eventOverrides) as EventConfig
    }

    /**
     * Transforms EventConfig structure into Database Schema columns for update/create operations.
     */
    static toDbPayload(data: DeepPartial<EventConfig>): Prisma.ConfigurationUpdateInput {
        const payload: Prisma.ConfigurationUpdateInput = {
            updatedAt: new Date(),
        }

        // 1. Communication -> Root Columns & JSON
        if (data.communication) {
            const c = data.communication
            if (c.legalName !== undefined) payload.organization = c.legalName || null
            if (c.address !== undefined) payload.address = c.address || null
            if (c.phone !== undefined) payload.phone = c.phone || null
            if (c.supportEmail !== undefined) payload.email = c.supportEmail || null
            if (c.website !== undefined) payload.website = c.website || null

            payload.communication = this.cleanForPersistence(c) as Prisma.InputJsonValue
        }

        // 2. Theme -> Assets (Logo) & Variables
        if (data.theme !== undefined) {
            if (data.theme?.assets !== undefined) {
                if (data.theme.assets?.logo !== undefined)
                    payload.logo = data.theme.assets.logo || null
                payload.assets = this.cleanForPersistence(
                    data.theme.assets,
                ) as Prisma.InputJsonValue
            }
            if (data.theme?.variables !== undefined) {
                payload.themeVariables = this.cleanForPersistence(
                    data.theme.variables,
                ) as Prisma.InputJsonValue
            }
        }

        // 3. Content -> event column
        if (data.content !== undefined) {
            // Logic: If user provides content.title and NOT communication.legalName, we sync to organization
            if (
                data.content?.title !== undefined &&
                (!data.communication || data.communication.legalName === undefined)
            ) {
                payload.organization = data.content.title || null
            }
            payload.event = this.cleanForPersistence(data.content) as Prisma.InputJsonValue
        }

        // 4. Donation -> form, payment, sharing
        if (data.donation !== undefined) {
            if (data.donation?.form !== undefined)
                payload.form = this.cleanForPersistence(data.donation.form) as Prisma.InputJsonValue
            if (data.donation?.payment !== undefined)
                payload.payment = this.cleanForPersistence(
                    data.donation.payment,
                ) as Prisma.InputJsonValue
            if (data.donation?.sharing !== undefined)
                payload.socialNetwork = this.cleanForPersistence(
                    data.donation.sharing,
                ) as Prisma.InputJsonValue
        }

        // 5. Locales & Live Theme
        if (data.locales)
            payload.locales = this.cleanForPersistence(data.locales) as Prisma.InputJsonValue
        if (data.live?.theme) payload.liveTheme = data.live.theme

        return payload
    }

    /**
     * Recursively removes empty strings, nulls, and undefineds from objects to avoid cluttering JSON columns
     * and ensuring correct inheritance behavior (where only actual values override defaults).
     */
    private static cleanForPersistence(obj: any): any {
        if (obj === null || obj === undefined) return Prisma.DbNull
        if (typeof obj !== 'object' || Array.isArray(obj)) return obj

        const cleaned = Object.entries(obj).reduce((acc: any, [key, value]) => {
            if (value === '' || value === null || value === undefined) {
                // Skip for inheritance
            } else if (typeof value === 'object') {
                const child = this.cleanForPersistence(value)
                if (child !== Prisma.DbNull) acc[key] = child
            } else {
                acc[key] = value
            }
            return acc
        }, {})

        return Object.keys(cleaned).length > 0 ? cleaned : Prisma.DbNull
    }
}
