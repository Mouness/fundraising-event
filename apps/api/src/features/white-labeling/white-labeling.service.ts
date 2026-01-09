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

        const config = await this.getConfig(ConfigScope.EVENT, event.id)
        const mapped = WhiteLabelingMapper.toEventConfig(config || ({} as Configuration), event)

        return {
            ...mapped,
            isOverride: !!config,
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
