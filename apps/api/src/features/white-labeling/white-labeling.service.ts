import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { ConfigScope, Configuration, Prisma } from '@prisma/client'
import { EventConfig, DeepPartial } from '@fundraising/white-labeling'
import { WhiteLabelingMapper } from './white-labeling.mapper'

@Injectable()
export class WhiteLabelingService {
    constructor(private prisma: PrismaService) {}

    async getGlobalSettings(): Promise<EventConfig> {
        const config = await this.getConfig(ConfigScope.GLOBAL)
        const resolved = WhiteLabelingMapper.toEventConfig(config || ({} as Configuration))
        resolved.id = 'GLOBAL'
        return resolved
    }

    async getEventSettings(slug: string): Promise<(EventConfig & { isOverride: boolean }) | null> {
        const event = await this.prisma.event.findUnique({ where: { slug } })
        if (!event) return null

        // 1. Fetch Global Config
        const globalSettings = await this.getGlobalSettings()

        // 2. Fetch Event Config
        const eventConfigDb = await this.getConfig(ConfigScope.EVENT, event.id)

        // 3. Merge (Event > Global > Default)
        const mapped = WhiteLabelingMapper.toEventConfig(
            eventConfigDb || ({} as Configuration),
            event,
            globalSettings,
        )

        return {
            ...mapped,
            isOverride: !!eventConfigDb,
        }
    }

    async updateGlobalSettings(data: DeepPartial<EventConfig>) {
        const payload = WhiteLabelingMapper.toDbPayload(data)
        return this.prisma.configuration.upsert({
            where: {
                scope_entityId: { scope: ConfigScope.GLOBAL, entityId: 'GLOBAL' },
            },
            update: payload,
            create: {
                ...(payload as any),
                scope: ConfigScope.GLOBAL,
                entityId: 'GLOBAL',
            },
        })
    }

    async updateEventSettings(eventId: string, data: DeepPartial<EventConfig>) {
        const payload = WhiteLabelingMapper.toDbPayload(data)
        return this.prisma.configuration.upsert({
            where: {
                scope_entityId: { scope: ConfigScope.EVENT, entityId: eventId },
            },
            update: payload,
            create: {
                ...(payload as any),
                scope: ConfigScope.EVENT,
                entityId: eventId,
            },
        })
    }

    async resetEventSettings(eventId: string) {
        return this.prisma.configuration.updateMany({
            where: { scope: ConfigScope.EVENT, entityId: eventId },
            data: {
                organization: null,
                address: null,
                phone: null,
                logo: null,
                email: null,
                website: null,
                themeVariables: Prisma.DbNull,
                assets: Prisma.DbNull,
                event: Prisma.DbNull,
                communication: Prisma.DbNull,
                form: Prisma.DbNull,
                payment: Prisma.DbNull,
                socialNetwork: Prisma.DbNull,
                locales: Prisma.DbNull,
            },
        })
    }

    private async getConfig(scope: ConfigScope, entityId?: string) {
        return this.prisma.configuration.findFirst({
            where: { scope, entityId },
        })
    }
}
