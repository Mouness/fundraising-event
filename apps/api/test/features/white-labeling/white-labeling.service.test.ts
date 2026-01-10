import { Test, TestingModule } from '@nestjs/testing'
import { WhiteLabelingService } from '@/features/white-labeling/white-labeling.service'
import { EventConfig, DeepPartial, defaultConfig } from '@fundraising/white-labeling'
import { PrismaService } from '@/database/prisma.service'
import { ConfigScope, Prisma } from '@prisma/client'
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('WhiteLabelingService', () => {
    let service: WhiteLabelingService
    let prismaMock: any

    beforeEach(async () => {
        prismaMock = {
            event: {
                findUnique: vi.fn(),
            },
            configuration: {
                findFirst: vi.fn(),
                upsert: vi.fn(),
                updateMany: vi.fn(),
            },
        }

        const module: TestingModule = await Test.createTestingModule({
            providers: [WhiteLabelingService, { provide: PrismaService, useValue: prismaMock }],
        }).compile()

        service = module.get<WhiteLabelingService>(WhiteLabelingService)
    })

    describe('getGlobalSettings', () => {
        it('should return mapped global settings', async () => {
            prismaMock.configuration.findFirst.mockResolvedValue({
                entityId: 'GLOBAL',
                organization: 'Global Org',
            })

            const result = await service.getGlobalSettings()
            expect(result.communication.legalName).toBe('Global Org')
            expect(result.id).toBe('GLOBAL')
        })

        it('should return default settings if no global config found', async () => {
            prismaMock.configuration.findFirst.mockResolvedValue(null)
            const result = await service.getGlobalSettings()
            expect(result.id).toBe('GLOBAL')
            expect(result.communication.legalName).toBe(defaultConfig.communication!.legalName)
        })
    })

    describe('getEventSettings', () => {
        it('should return event settings with isOverride true if config exists', async () => {
            prismaMock.event.findUnique.mockResolvedValue({
                id: 'evt_1',
                slug: 'slug',
                name: 'Event',
            })
            prismaMock.configuration.findFirst.mockResolvedValue({
                entityId: 'evt_1',
                organization: 'Override Name',
            })

            const result = await service.getEventSettings('slug')
            expect(result?.communication.legalName).toBe('Override Name')
            expect(result?.isOverride).toBe(true)
        })

        it('should return mapped event details with isOverride false if no config exists', async () => {
            prismaMock.event.findUnique.mockResolvedValue({
                id: 'evt_1',
                slug: 'slug',
                name: 'Event',
            })
            prismaMock.configuration.findFirst.mockResolvedValue(null)

            const result = await service.getEventSettings('slug')
            expect(result?.name).toBe('Event')
            expect(result?.isOverride).toBe(false)
        })

        it('should return null if event not found', async () => {
            prismaMock.event.findUnique.mockResolvedValue(null)
            const result = await service.getEventSettings('missing')
            expect(result).toBeNull()
        })
    })

    describe('updateGlobalSettings', () => {
        it('should upsert global settings', async () => {
            await service.updateGlobalSettings({
                communication: { legalName: 'New Global' },
            })
            expect(prismaMock.configuration.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        scope_entityId: { scope: ConfigScope.GLOBAL, entityId: 'GLOBAL' },
                    },
                    update: expect.objectContaining({ organization: 'New Global' }),
                }),
            )
        })
    })

    describe('updateEventSettings', () => {
        it('should upsert event settings', async () => {
            await service.updateEventSettings('evt_1', {
                communication: { legalName: 'New Event' },
            })
            expect(prismaMock.configuration.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        scope_entityId: { scope: ConfigScope.EVENT, entityId: 'evt_1' },
                    },
                }),
            )
        })
    })

    describe('resetEventSettings', () => {
        it('should update configuration to null/reset values', async () => {
            await service.resetEventSettings('evt_1')
            expect(prismaMock.configuration.updateMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { scope: ConfigScope.EVENT, entityId: 'evt_1' },
                    data: expect.objectContaining({ organization: null }),
                }),
            )
        })
    })
})
