import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from '@/features/events/events.service';
import { PrismaService } from '@/database/prisma.service';
import { WhiteLabelingService } from '@/features/white-labeling/white-labeling.service';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { CreateEventDto } from '@fundraising/types';

describe('EventsService', () => {
  let service: EventsService;
  let prismaService: PrismaService;
  let whiteLabelingService: WhiteLabelingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: PrismaService,
          useValue: {
            event: {
              create: vi.fn(),
              findMany: vi.fn(),
              findFirst: vi.fn(),
              findUnique: vi.fn(),
              update: vi.fn(),
              delete: vi.fn(),
              count: vi.fn(),
            },
            donation: {
              groupBy: vi.fn(),
              aggregate: vi.fn(),
              findMany: vi.fn(),
            },
          },
        },
        {
          provide: WhiteLabelingService,
          useValue: {
            updateEventSettings: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    prismaService = module.get<PrismaService>(PrismaService);
    whiteLabelingService =
      module.get<WhiteLabelingService>(WhiteLabelingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an event', async () => {
      const dto: CreateEventDto = {
        name: 'Gala',
        slug: 'gala',
        goalAmount: 1000,
        themeConfig: {
          primaryColor: '#000000',
          secondaryColor: '#ffffff',
          logoUrl: 'logo.png',
        },
      };
      const expected = { id: '1', ...dto };

      (prismaService.event.create as any).mockResolvedValue(expected);

      const result = await service.create(dto);
      expect(result).toEqual(expected);
      expect(prismaService.event.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return array of events with stats', async () => {
      const events = [{ id: '1', name: 'Gala' }];
      const aggregations = [
        {
          eventId: '1',
          _sum: { amount: { toNumber: () => 10000 } },
          _count: { id: 5 },
        },
      ];

      (prismaService.event.findMany as any).mockResolvedValue(events);
      (prismaService.donation.groupBy as any).mockResolvedValue(aggregations);

      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: '1',
        name: 'Gala',
        raised: 100, // 10000 / 100
        donorCount: 5,
      });
    });
  });

  describe('findOne', () => {
    it('should return event if found with stats', async () => {
      const event = { id: '1', name: 'Gala', slug: 'gala' };
      const stats = {
        _sum: { amount: { toNumber: () => 5000 } },
        _count: { id: 2 },
      };

      (prismaService.event.findFirst as any).mockResolvedValue(event);
      (prismaService.donation.aggregate as any).mockResolvedValue(stats);
      (prismaService.donation.findMany as any).mockResolvedValue([]);

      const result = await service.findOne('gala');
      expect(result).toMatchObject({
        ...event,
        raised: 50,
        donorCount: 2,
      });
    });

    it('should throw NotFoundException if not found', async () => {
      (prismaService.event.findFirst as any).mockResolvedValue(null);

      await expect(service.findOne('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update an event', async () => {
      const dto = { name: 'Updated Gala', formConfig: { showPhone: true } };
      const expected = { id: '1', name: 'Updated Gala' };

      (prismaService.event.update as any).mockResolvedValue(expected);

      const result = await service.update('1', dto);
      expect(result).toEqual(expected);
      expect(whiteLabelingService.updateEventSettings).toHaveBeenCalledWith(
        '1',
        { donation: { form: dto.formConfig } },
      );
    });
  });

  describe('remove', () => {
    it('should remove an event', async () => {
      const expected = { id: '1', name: 'Gala' };
      (prismaService.event.delete as any).mockResolvedValue(expected);

      const result = await service.remove('1');
      expect(result).toEqual(expected);
    });
  });

  describe('staff', () => {
    it('should find staff', async () => {
      const expected = [{ id: 's1', name: 'John' }];
      (prismaService.event.findUnique as any).mockResolvedValue({
        staffMembers: expected,
      });

      const result = await service.findStaff('1');
      expect(result).toEqual(expected);
    });

    it('should assign staff', async () => {
      const expected = { id: '1', staffMembers: [{ id: 's1' }] };
      (prismaService.event.update as any).mockResolvedValue(expected);

      const result = await service.assignStaff('1', 's1');
      expect(result).toEqual(expected);
    });

    it('should unassign staff', async () => {
      const expected = { id: '1', staffMembers: [] };
      (prismaService.event.update as any).mockResolvedValue(expected);

      const result = await service.unassignStaff('1', 's1');
      expect(result).toEqual(expected);
    });
  });
});
