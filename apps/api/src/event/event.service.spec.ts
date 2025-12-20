import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from './event.service';
import { PrismaService } from '../prisma/prisma.service';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { CreateEventDto, UpdateEventDto } from '@fundraising/types';

describe('EventService', () => {
    let service: EventService;
    let prismaService: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EventService,
                {
                    provide: PrismaService,
                    useValue: {
                        event: {
                            create: vi.fn(),
                            findMany: vi.fn(),
                            findFirst: vi.fn(),
                            update: vi.fn(),
                            delete: vi.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<EventService>(EventService);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create an event', async () => {
            const dto: CreateEventDto = { name: 'Gala', slug: 'gala', goalAmount: 1000 };
            const expected = { id: '1', ...dto, themeConfig: {} };

            (prismaService.event.create as any).mockResolvedValue(expected);

            const result = await service.create(dto);
            expect(result).toEqual(expected);
            expect(prismaService.event.create).toHaveBeenCalled();
        });
    });

    describe('findAll', () => {
        it('should return array of events', async () => {
            const expected = [{ id: '1', name: 'Gala' }];
            (prismaService.event.findMany as any).mockResolvedValue(expected);

            const result = await service.findAll();
            expect(result).toEqual(expected);
        });
    });

    describe('findOne', () => {
        it('should return event if found', async () => {
            const expected = { id: '1', name: 'Gala', slug: 'gala' };
            (prismaService.event.findFirst as any).mockResolvedValue(expected);

            const result = await service.findOne('gala');
            expect(result).toEqual(expected);
        });

        it('should throw NotFoundException if not found', async () => {
            (prismaService.event.findFirst as any).mockResolvedValue(null);

            await expect(service.findOne('unknown')).rejects.toThrow(NotFoundException);
        });
    });
});
