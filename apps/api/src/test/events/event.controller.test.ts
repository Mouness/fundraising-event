import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from '@/features/events/events.controller';
import { EventsService } from '@/features/events/events.service';
import { CreateEventDto } from '@fundraising/types';
import { vi, describe, beforeEach, it, expect } from 'vitest';

describe('EventsController', () => {
    let controller: EventsController;
    let service: EventsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [EventsController],
            providers: [
                {
                    provide: EventsService,
                    useValue: {
                        create: vi.fn(),
                        findAll: vi.fn(),
                        findOne: vi.fn(),
                        update: vi.fn(),
                        remove: vi.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<EventsController>(EventsController);
        service = module.get<EventsService>(EventsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should call service.create', async () => {
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
            (service.create as any).mockResolvedValue(expected);

            const result = await controller.create(dto);
            expect(result).toEqual(expected);
            expect(service.create).toHaveBeenCalledWith(dto);
        });
    });

    describe('findAll', () => {
        it('should call service.findAll', async () => {
            await controller.findAll();
            expect(service.findAll).toHaveBeenCalled();
        });
    });
});
