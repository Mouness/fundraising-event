import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from '@/features/event/event.controller';
import { EventService } from '@/features/event/event.service';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockEventService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

describe('EventController', () => {
  let controller: EventController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [{ provide: EventService, useValue: mockEventService }],
    }).compile();

    controller = module.get<EventController>(EventController);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create', async () => {
      const dto: any = { name: 'New Event' }; // cast for brevity
      await controller.create(dto);
      expect(mockEventService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll', async () => {
      await controller.findAll();
      expect(mockEventService.findAll).toHaveBeenCalled();
    });
  });
});
