import { Test, TestingModule } from '@nestjs/testing';
import { DonationController } from '@/features/donation/donation.controller';
import { DonationService } from '@/features/donation/donation.service';
import { GatewayGateway } from '@/features/gateway/gateway.gateway';
import { EmailProducer } from '@/features/queue/producers/email.producer';
import { PaymentService } from '@/features/donation/services/payment.service';
import { BadRequestException } from '@nestjs/common';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPaymentService = {
  createPaymentIntent: vi.fn(),
  constructEventFromPayload: vi.fn(),
};

const mockDonationService = {
  create: vi.fn(),
  processSuccessfulDonation: vi.fn(),
  getExportData: vi.fn(),
  findAll: vi.fn(),
  update: vi.fn(),
  cancel: vi.fn(),
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
    // ...

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DonationController],
      providers: [
        { provide: PaymentService, useValue: mockPaymentService },
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

  describe('handleStripeWebhook', () => {
    it('should process payment.succeeded event', async () => {
      mockPaymentService.constructEventFromPayload.mockResolvedValue({
        type: 'payment_intent.succeeded',
        data: {
          object: {
            amount: 1000,
            currency: 'usd',
            id: 'pi_123',
            metadata: { donorName: 'John', eventId: 'evt_1' },
          },
        },
      });

      const req = { rawBody: Buffer.from('raw'), headers: {} } as any;
      await controller.handleStripeWebhook(req);

      expect(
        mockDonationService.processSuccessfulDonation,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          transactionId: 'pi_123',
          donorName: 'John',
        }),
      );
    });
  });

  describe('handlePayPalWebhook', () => {
    it('should process CHECKOUT.ORDER.COMPLETED event', async () => {
      mockPaymentService.constructEventFromPayload.mockResolvedValue({
        event_type: 'CHECKOUT.ORDER.COMPLETED',
        resource: {
          id: 'ord_123',
          purchase_units: [
            { amount: { value: '10.00', currency_code: 'USD' } },
          ],
          payer: { email_address: 'john@example.com' },
        },
      });

      const req = { rawBody: Buffer.from('raw'), headers: {} } as any;
      await controller.handlePayPalWebhook(req);

      expect(
        mockDonationService.processSuccessfulDonation,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          transactionId: 'ord_123',
          amount: 1000,
        }),
      );
    });
  });

  describe('createOfflineDonation', () => {
    it('should create donation and emit event', async () => {
      const dto = { amount: 500, type: 'cash', donorName: 'John' } as any;
      mockDonationService.create.mockResolvedValue({ id: 'd1' });
      // Mock payment service needed for currency
      mockPaymentService.createPaymentIntent.mockResolvedValue({}); // Unused here but safety
      (mockPaymentService as any).getGlobalCurrency = vi
        .fn()
        .mockResolvedValue('usd');

      // Mock user from req
      const req = { user: { eventId: 'evt_1', userId: 'staff_1' } };

      await controller.createOfflineDonation(dto, req);

      expect(
        mockDonationService.processSuccessfulDonation,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 500,
          paymentMethod: 'cash',
        }),
      );
    });
  });
});
