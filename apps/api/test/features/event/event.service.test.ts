import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from '@/features/event/event.service';
import { PrismaService } from '@/database/prisma.service';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
    event: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
};

describe('EventService', () => {
    let service: EventService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EventService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<EventService>(EventService);
        vi.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return array of events', async () => {
            mockPrismaService.event.findMany.mockResolvedValue(['e1', 'e2']);
            const result = await service.findAll();
            expect(result).toEqual(['e1', 'e2']);
        });
    });

    describe('findOne', () => {
        it('should find event by id or slug', async () => {
            mockPrismaService.event.findFirst.mockResolvedValue({ id: '1', slug: 's' });
            const result = await service.findOne('1');
            expect(result).toEqual({ id: '1', slug: 's' });
        });

        it('should throw NotFoundException if missing', async () => {
            mockPrismaService.event.findFirst.mockResolvedValue(null);
            await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
        });
    });
});
