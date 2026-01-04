import { Test, TestingModule } from '@nestjs/testing';
import { DonationController } from '@/features/donation/donation.controller';
import { DonationService } from '@/features/donation/donation.service';
import { GatewayGateway } from '@/features/gateway/gateway.gateway';
import { EmailProducer } from '@/features/queue/producers/email.producer';
import { BadRequestException } from '@nestjs/common';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPaymentService = {
  createPaymentIntent: vi.fn(),
  constructEventFromPayload: vi.fn(),
};

const mockDonationService = {
  create: vi.fn(),
};

const mockGateway = {
  emitDonation: vi.fn(),
};

const mockEmailProducer = {
  sendReceipt: vi.fn(),
};

describe('DonationController', () => {
  let controller: DonationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DonationController],
      providers: [
        { provide: 'PAYMENT_PROVIDER', useValue: mockPaymentService },
        { provide: DonationService, useValue: mockDonationService },
        { provide: GatewayGateway, useValue: mockGateway },
        { provide: EmailProducer, useValue: mockEmailProducer },
      ],
    }).compile();

    controller = module.get<DonationController>(DonationController);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createPaymentIntent', () => {
    it('should delegate to payment service', async () => {
      mockPaymentService.createPaymentIntent.mockResolvedValue({
        clientSecret: 'abc',
      });
      const result = await controller.createPaymentIntent({ amount: 1000 });
      expect(result).toEqual({ clientSecret: 'abc' });
      expect(mockPaymentService.createPaymentIntent).toHaveBeenCalledWith(
        1000,
        'usd',
        undefined,
      );
    });

    it('should throw BadRequest if amount is invalid', async () => {
      await expect(
        controller.createPaymentIntent({ amount: 0 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createOfflineDonation', () => {
    it('should create donation and emit event', async () => {
      const dto = { amount: 500, type: 'cash', donorName: 'John' };
      mockDonationService.create.mockResolvedValue({ id: 'd1' });

      await controller.createOfflineDonation(dto);

      expect(mockDonationService.create).toHaveBeenCalled();
      expect(mockGateway.emitDonation).toHaveBeenCalled();
    });

    it('should send email receipt if email provided', async () => {
      const dto = { amount: 500, type: 'cash', donorEmail: 'john@example.com' };
      mockDonationService.create.mockResolvedValue({ id: 'd1' });

      await controller.createOfflineDonation(dto);

      expect(mockEmailProducer.sendReceipt).toHaveBeenCalledWith(
        'john@example.com',
        5, // 500 / 100
        expect.stringContaining('OFFLINE'),
      );
    });
  });
});
