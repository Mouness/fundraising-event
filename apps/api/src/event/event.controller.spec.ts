import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { CreateEventDto } from '@fundraising/types';
import { vi, describe, beforeEach, it, expect } from 'vitest';

describe('EventController', () => {
    let controller: EventController;
    let service: EventService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [EventController],
            providers: [
                {
                    provide: EventService,
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

        controller = module.get<EventController>(EventController);
        service = module.get<EventService>(EventService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should call service.create', async () => {
            const dto: CreateEventDto = { name: 'Gala', slug: 'gala', goalAmount: 1000 };
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
