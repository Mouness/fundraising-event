import { Test, TestingModule } from '@nestjs/testing';
import { WhiteLabelingService } from '@/features/white-labeling/white-labeling.service';
import { PrismaService } from '@/database/prisma.service';
import { ConfigScope } from '@prisma/client';
import { describe, it, expect, vi, beforeEach } from 'vitest';

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
      vi.spyOn(prisma.configuration, 'findFirst').mockResolvedValue(
        mockConfig as any,
      );

      const result = await service.getGlobalSettings();
      expect(result.content.title).toBe('Global Org');
      expect(result.communication.email.senderName).toBe('Global Sender');
    });
  });

  describe('getEventSettings', () => {
    it('should merge global and event settings', async () => {
      const mockEvent = {
        id: 'evt_1',
        slug: 'test-event',
        name: 'Test Event',
        goalAmount: 1000,
        description: 'Desc',
      };
      const globalConfig = {
        organization: 'Global Org',
        communication: {
          email: { senderName: 'Global Sender', footerText: 'Global Footer' },
        },
      };
      const eventConfig = {
        organization: 'Event Org',
        communication: { email: { senderName: 'Event Sender' } },
      };

      vi.spyOn(prisma.event, 'findUnique').mockResolvedValue(mockEvent as any);
      vi.spyOn(prisma.configuration, 'findFirst')
        .mockResolvedValueOnce(globalConfig as any) // first call for global
        .mockResolvedValueOnce(eventConfig as any); // second call for event

      const result = await service.getEventSettings('test-event');

      expect(result).not.toBeNull();
      expect(result?.content.title).toBe('Event Org'); // Override present
      expect(result?.name).toBe('Test Event');
      expect(result?.description).toBe('Desc');
      expect(result?.communication.email.senderName).toBe('Event Sender');
      expect(result?.communication.email.footerText).toBe('Global Footer'); // preserved by deepMerge
    });

    it('should return empty title if no override provided', async () => {
      const mockEvent = {
        id: 'evt_1',
        slug: 'test-event',
        name: 'Test Event',
        goalAmount: 1000,
        description: 'Desc',
      };
      const globalConfig = {};
      const eventConfig = {}; // No organization/title

      vi.spyOn(prisma.event, 'findUnique').mockResolvedValue(mockEvent as any);
      vi.spyOn(prisma.configuration, 'findFirst')
        .mockResolvedValueOnce(globalConfig as any)
        .mockResolvedValueOnce(eventConfig as any);

      const result = await service.getEventSettings('test-event');

      expect(result).not.toBeNull();
      expect(result?.content.title).toBe(''); // No override
      expect(result?.name).toBe('Test Event');
    });

    it('should return null if event not found', async () => {
      vi.spyOn(prisma.event, 'findUnique').mockResolvedValue(null);
      const result = await service.getEventSettings('invalid');
      expect(result).toBeNull();
    });
  });
});
