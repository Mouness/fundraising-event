import { Test, TestingModule } from '@nestjs/testing';
import { WhiteLabelingService } from '@/features/white-labeling/white-labeling.service';
import { PrismaService } from '@/database/prisma.service';
import { ConfigScope, Prisma } from '@prisma/client';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventConfig } from '@fundraising/white-labeling';

describe('WhiteLabelingService', () => {
  let service: WhiteLabelingService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WhiteLabelingService,
        {
          provide: PrismaService,
          useValue: {
            configuration: {
              findFirst: vi.fn(),
              upsert: vi.fn(),
              deleteMany: vi.fn(),
            },
            event: {
              findUnique: vi.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<WhiteLabelingService>(WhiteLabelingService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getGlobalSettings', () => {
    it('should return mapped global settings', async () => {
      const mockConfig = {
        scope: ConfigScope.GLOBAL,
        organization: 'Global Org',
        communication: { email: { senderName: 'Global Sender' } },
      };
      const findFirstSpy = vi
        .spyOn(prisma.configuration, 'findFirst')
        .mockResolvedValue(mockConfig as any);

      const result = await service.getGlobalSettings();
      expect(findFirstSpy).toHaveBeenCalledWith({
        where: { scope: ConfigScope.GLOBAL, entityId: undefined },
      });
      expect(result.content.title).toBe('Global Org');
      expect(result.communication.email.senderName).toBe('Global Sender');
    });
  });

  describe('getEventSettings', () => {
    it('should NOT merge global and event settings (API should return overrides only)', async () => {
      const mockEvent = {
        id: 'evt_1',
        slug: 'test-event',
        name: 'Test Event',
        goalAmount: 1000,
        description: 'Desc',
      };
      const eventConfig = {
        organization: 'Event Org',
        communication: { email: { senderName: 'Event Sender' } },
      };

      vi.spyOn(prisma.event, 'findUnique').mockResolvedValue(mockEvent as any);
      vi.spyOn(prisma.configuration, 'findFirst').mockResolvedValue(
        eventConfig as any,
      );

      const result = await service.getEventSettings('test-event');

      expect(result).not.toBeNull();
      expect(result?.content.title).toBe('Event Org');
      expect(result?.communication.email.senderName).toBe('Event Sender');
      // Should NOT have inherited from global in the API response anymore
      expect(result?.communication.email.footerText).toBeUndefined();
    });

    it('should return empty title if no override provided', async () => {
      const mockEvent = {
        id: 'evt_1',
        slug: 'test-event',
        name: 'Test Event',
        goalAmount: 1000,
        description: 'Desc',
      };
      const eventConfig = {}; // No organization/title

      vi.spyOn(prisma.event, 'findUnique').mockResolvedValue(mockEvent as any);
      vi.spyOn(prisma.configuration, 'findFirst').mockResolvedValue(
        eventConfig as any,
      );

      const result = await service.getEventSettings('test-event');

      expect(result).not.toBeNull();
      expect(result?.content.title).toBe(''); // No fallback to event name in the API
      expect(result?.name).toBe('Test Event');
    });

    it('should return local nulls if provided (inheritance)', async () => {
      const mockEvent = {
        id: 'evt_1',
        slug: 'test',
        name: 'Test',
        goalAmount: 1000,
      };
      const eventConfig = { organization: null, logo: null, assets: null };

      vi.spyOn(prisma.event, 'findUnique').mockResolvedValue(mockEvent as any);
      vi.spyOn(prisma.configuration, 'findFirst').mockResolvedValue(
        eventConfig as any,
      );

      const result = await service.getEventSettings('test');

      expect(result?.content.title).toBe(''); // null mapped to ''
      expect(result?.theme?.assets?.logo).toBe('');
    });

    it('should return null if event not found', async () => {
      vi.spyOn(prisma.event, 'findUnique').mockResolvedValue(null);
      const result = await service.getEventSettings('invalid');
      expect(result).toBeNull();
    });
  });
  describe('updateEventSettings', () => {
    it('should map empty assets to undefined (inheritance)', async () => {
      const eventId = 'evt_1';
      const data = {
        theme: {
          assets: {
            logo: 'https://new-logo.com',
            backgroundLive: '', // Empty string -> should be removed
          },
        },
        assets: { logo: 'https://new-logo.com' },
      };

      await service.updateEventSettings(eventId, data as any);

      expect(prisma.configuration.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            assets: { logo: 'https://new-logo.com' }, // backgroundLive removed
            logo: 'https://new-logo.com',
          }),
          update: expect.objectContaining({
            assets: { logo: 'https://new-logo.com' },
            logo: 'https://new-logo.com',
          }),
        }),
      );
    });

    it('should map empty top-level logo to null (inheritance)', async () => {
      const eventId = 'evt_1';
      const data = {
        theme: {
          assets: { logo: '' },
        },
        assets: { logo: '' }, // Empty string -> should be null
      };

      await service.updateEventSettings(eventId, data as any);

      expect(prisma.configuration.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            logo: null,
          }),
        }),
      );
    });

    it('should map completely empty assets to empty object to force clear', async () => {
      const eventId = 'evt_1';
      const data = {
        theme: {
          assets: { backgroundLive: '' }, // All empty
        },
      };

      await service.updateEventSettings(eventId, data as any);

      expect(prisma.configuration.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            assets: Prisma.DbNull, // Should be DbNull now
          }),
        }),
      );
    });

    it('should handle nested EventConfig structure', async () => {
      const data: any = {
        communication: {
          legalName: 'New Global Name',
          supportEmail: 'contact@global.com'
        },
        theme: {
          assets: { backgroundLive: 'new-bg.png' },
          variables: { '--primary': '#ff0000' }
        }
      };

      await service.updateGlobalSettings(data);

      expect(prisma.configuration.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            organization: 'New Global Name',
            email: 'contact@global.com',
            assets: { backgroundLive: 'new-bg.png' },
            themeVariables: { '--primary': '#ff0000' },
          }),
        }),
      );
    });

    it('should handle clearing fields (setting to null or DbNull)', async () => {
      const payload: any = {
        communication: {
          legalName: '',
          supportEmail: '',
          address: '',
        },
        theme: {
          assets: null,
          variables: {},
        },
        content: null,
      };

      const result = (service as any).mapToDbPayload('evt-1', payload);

      expect(result.organization).toBeNull();
      expect(result.email).toBeNull();
      expect(result.address).toBeNull();
      expect(result.assets).toEqual(Prisma.DbNull);
      expect(result.event).toEqual(Prisma.DbNull);
      expect(result.themeVariables).toEqual(Prisma.DbNull);
    });
  });
});
