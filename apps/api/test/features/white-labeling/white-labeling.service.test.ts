import { Test, TestingModule } from '@nestjs/testing';
import { WhiteLabelingService } from '@/features/white-labeling/white-labeling.service';
import { PrismaService } from '@/database/prisma.service';
import { ConfigScope, Prisma } from '@prisma/client';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('WhiteLabelingService', () => {
    let service: WhiteLabelingService;
    let prismaMock: any;

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
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WhiteLabelingService,
                { provide: PrismaService, useValue: prismaMock },
            ],
        }).compile();

        service = module.get<WhiteLabelingService>(WhiteLabelingService);
    });

    describe('getGlobalSettings', () => {
        it('should return mapped global settings', async () => {
            prismaMock.configuration.findFirst.mockResolvedValue({
                entityId: 'GLOBAL',
                organization: 'Global Org',
            });

            const result = await service.getGlobalSettings();
            expect(result.communication.legalName).toBe('Global Org');
            expect(result.id).toBe('GLOBAL');
        });

        it('should return default settings if no global config found', async () => {
            prismaMock.configuration.findFirst.mockResolvedValue(null);
            const result = await service.getGlobalSettings();
            expect(result.id).toBe('');
            expect(result.communication.legalName).toBe('');
        });
    });

    describe('getEventSettings', () => {
        it('should return event settings with isOverride true if config exists', async () => {
            prismaMock.event.findUnique.mockResolvedValue({ id: 'evt_1', slug: 'slug', name: 'Event' });
            prismaMock.configuration.findFirst.mockResolvedValue({
                entityId: 'evt_1',
                organization: 'Override Name',
            });

            const result = await service.getEventSettings('slug');
            expect(result?.communication.legalName).toBe('Override Name');
            expect(result?.isOverride).toBe(true);
        });

        it('should return mapped event details with isOverride false if no config exists', async () => {
            prismaMock.event.findUnique.mockResolvedValue({ id: 'evt_1', slug: 'slug', name: 'Event' });
            prismaMock.configuration.findFirst.mockResolvedValue(null);

            const result = await service.getEventSettings('slug');
            expect(result?.name).toBe('Event');
            expect(result?.isOverride).toBe(false);
        });

        it('should return null if event not found', async () => {
            prismaMock.event.findUnique.mockResolvedValue(null);
            const result = await service.getEventSettings('missing');
            expect(result).toBeNull();
        });
    });

    describe('updateGlobalSettings', () => {
        it('should upsert global settings', async () => {
            await service.updateGlobalSettings({ communication: { legalName: 'New Global' } });
            expect(prismaMock.configuration.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { scope_entityId: { scope: ConfigScope.GLOBAL, entityId: 'GLOBAL' } },
                    update: expect.objectContaining({ organization: 'New Global' }),
                }),
            );
        });
    });

    describe('updateEventSettings', () => {
        it('should upsert event settings', async () => {
            await service.updateEventSettings('evt_1', { communication: { legalName: 'New Event' } });
            expect(prismaMock.configuration.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { scope_entityId: { scope: ConfigScope.EVENT, entityId: 'evt_1' } },
                }),
            );
        });
    });

    describe('resetEventSettings', () => {
        it('should update configuration to null/reset values', async () => {
            await service.resetEventSettings('evt_1');
            expect(prismaMock.configuration.updateMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { scope: ConfigScope.EVENT, entityId: 'evt_1' },
                    data: expect.objectContaining({ organization: null }),
                }),
            );
        });
    });

    describe('mapToDbPayload logic', () => {
        it('should sync content.title to organization if legalName missing', async () => {
            // Using private method via (service as any)
            const payload = (service as any).mapToDbPayload('evt_1', { content: { title: 'Sync Title' } });
            expect(payload.organization).toBe('Sync Title');
        });

        it('should not overwrite organization if legalName is provided', async () => {
            const payload = (service as any).mapToDbPayload('evt_1', {
                communication: { legalName: 'Strict Name' },
                content: { title: 'Sync Title' }
            });
            expect(payload.organization).toBe('Strict Name');
        });

        it('should handle theme variables and assets', async () => {
            const payload = (service as any).mapToDbPayload('evt_1', {
                theme: { variables: { primary: 'red' }, assets: { logo: 'logo.png' } }
            });
            expect(payload.themeVariables).toEqual({ primary: 'red' });
            expect(payload.logo).toBe('logo.png');
        });

        it('should handle donation form and payment', async () => {
            const payload = (service as any).mapToDbPayload('evt_1', {
                donation: { form: { email: true }, payment: { provider: 'paypal' } }
            });
            expect(payload.form).toEqual({ email: true });
            expect(payload.payment).toEqual({ provider: 'paypal' });
        });
    });

    describe('cleanForPersistence', () => {
        it('should skip empty/null values for inheritance', () => {
            const result = (service as any).cleanForPersistence({ a: 1, b: '', c: null, d: undefined });
            expect(result).toEqual({ a: 1 });
        });

        it('should return DbNull if all keys are skipped', () => {
            const result = (service as any).cleanForPersistence({ a: '', b: null });
            expect(result).toBe(Prisma.DbNull);
        });

        it('should handle nested objects recursively', () => {
            const result = (service as any).cleanForPersistence({ a: 1, nested: { b: '', c: 2 } });
            expect(result).toEqual({ a: 1, nested: { c: 2 } });
        });
    });
});
