import { Test, TestingModule } from '@nestjs/testing';
import { DonationService } from '@/features/donation/donation.service';
import { PrismaService } from '@/database/prisma.service';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateDonationParams } from '@/features/donation/interfaces/donation-service.interface';

import { PaymentService } from '@/features/donation/services/payment.service';
import { GatewayGateway } from '@/features/gateway/gateway.gateway';
import { EmailProducer } from '@/features/queue/producers/email.producer';
import { EventsService } from '@/features/events/events.service';

const mockPrismaService = {
  event: {
    findFirst: vi.fn(),
  },
  donation: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
  },
};

const mockPaymentService = {
  refundDonation: vi.fn(),
};

const mockGateway = {
  emitDonation: vi.fn(),
};

const mockEmailProducer = {
  sendReceipt: vi.fn(),
};

const mockEventsService = {
  findOne: vi.fn(),
};

describe('DonationService', () => {
  let service: DonationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DonationService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: PaymentService, useValue: mockPaymentService },
        { provide: GatewayGateway, useValue: mockGateway },
        { provide: EmailProducer, useValue: mockEmailProducer },
        { provide: EventsService, useValue: mockEventsService },
      ],
    }).compile();

    service = module.get<DonationService>(DonationService);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const minimalData: CreateDonationParams = {
      amount: 1000,
      transactionId: 'tx_123',
      status: 'COMPLETED',
      paymentMethod: 'card',
    };

    it('should create donation linked to provided eventId', async () => {
      mockPrismaService.donation.create.mockResolvedValue({
        id: 'd1',
        ...minimalData,
      });

      await service.create({ ...minimalData, eventId: 'evt_1' });

      expect(mockPrismaService.donation.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          amount: 1000,
          eventId: 'evt_1',
        }),
      });
    });

    it('should fallback to default event if no eventId provided', async () => {
      mockPrismaService.event.findFirst.mockResolvedValue({
        id: 'default_evt',
      });
      mockPrismaService.donation.create.mockResolvedValue({
        id: 'd1',
        ...minimalData,
      });

      await service.create(minimalData);

      expect(mockPrismaService.event.findFirst).toHaveBeenCalled();
      expect(mockPrismaService.donation.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          eventId: 'default_evt',
        }),
      });
    });

    it('should throw error if no event found and no eventId provided', async () => {
      mockPrismaService.event.findFirst.mockResolvedValue(null);

      await expect(service.create(minimalData)).rejects.toThrow(
        'No event found',
      );
    });
  });
});
