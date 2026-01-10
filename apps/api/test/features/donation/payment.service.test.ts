import { Test, TestingModule } from '@nestjs/testing'
import { PaymentService } from '@/features/donation/services/payment.service'
import { StripeService } from '@/features/donation/services/stripe.service'
import { PayPalService } from '@/features/donation/services/paypal.service'
import { PrismaService } from '@/database/prisma.service'
import { WhiteLabelingService } from '@/features/white-labeling/white-labeling.service'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockStripeService = {
    createPaymentIntent: vi.fn(),
    constructEventFromPayload: vi.fn(),
    refundDonation: vi.fn(),
}

const mockPayPalService = {
    createPaymentIntent: vi.fn(),
    constructEventFromPayload: vi.fn(),
    refundDonation: vi.fn(),
}

const mockPrismaService = {}

const mockWhiteLabelingService = {
    getGlobalSettings: vi.fn(),
    getEventSettings: vi.fn(),
}

describe('PaymentService', () => {
    let service: PaymentService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PaymentService,
                { provide: StripeService, useValue: mockStripeService },
                { provide: PayPalService, useValue: mockPayPalService },
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: WhiteLabelingService, useValue: mockWhiteLabelingService },
            ],
        }).compile()

        service = module.get<PaymentService>(PaymentService)
        vi.clearAllMocks()
    })

    describe('getProvider', () => {
        it('should default to stripe if no config found', async () => {
            mockWhiteLabelingService.getGlobalSettings.mockResolvedValue({
                donation: { payment: { provider: 'stripe' } },
            })
            const provider = await service.getProvider()
            expect(provider).toBe(mockStripeService)
        })

        it('should return paypal if configured globally', async () => {
            mockWhiteLabelingService.getGlobalSettings.mockResolvedValue({
                donation: { payment: { provider: 'paypal' } },
            })
            const provider = await service.getProvider() // Removed arg
            expect(provider).toBe(mockPayPalService)
        })
    })

    describe('getGlobalCurrency', () => {
        it('should return currency from white labeling settings', async () => {
            mockWhiteLabelingService.getGlobalSettings.mockResolvedValue({
                donation: { payment: { currency: 'eur' } },
            })
            const currency = await service.getGlobalCurrency()
            expect(currency).toBe('eur')
        })

        it('should default to usd', async () => {
            mockWhiteLabelingService.getGlobalSettings.mockResolvedValue({})
            const currency = await service.getGlobalCurrency()
            expect(currency).toBe('usd')
        })
    })

    describe('constructEventFromPayload', () => {
        it('should delegate to stripe service if providerName is stripe', async () => {
            mockWhiteLabelingService.getGlobalSettings.mockResolvedValue({
                donation: { payment: { provider: 'paypal' } }, // Global is paypal
            })
            await service.constructEventFromPayload(
                {},
                Buffer.from('payload'),
                'stripe', // But we explicitly want stripe
            )
            expect(mockStripeService.constructEventFromPayload).toHaveBeenCalledWith(
                {},
                Buffer.from('payload'),
                expect.anything(),
            )
        })

        it('should delegate to paypal service when providerName is paypal', async () => {
            mockWhiteLabelingService.getGlobalSettings.mockResolvedValue({
                donation: { payment: { provider: 'stripe' } },
            })
            await service.constructEventFromPayload({}, Buffer.from('payload'), 'paypal')
            expect(mockPayPalService.constructEventFromPayload).toHaveBeenCalledWith(
                {},
                Buffer.from('payload'),
                expect.anything(),
            )
        })
    })

    describe('createPaymentIntent', () => {
        it('should call getProvider and delegate to it', async () => {
            mockWhiteLabelingService.getGlobalSettings.mockResolvedValue({
                donation: { payment: { provider: 'stripe' } },
            })
            mockStripeService.createPaymentIntent.mockResolvedValue({ id: 'pi_1' })

            const result = await service.createPaymentIntent(100, 'usd', {
                eventId: 'evt_1',
            })

            expect(result).toEqual({ id: 'pi_1' })
            expect(mockStripeService.createPaymentIntent).toHaveBeenCalledWith(
                100,
                'usd',
                { eventId: 'evt_1' },
                expect.anything(),
            )
        })
    })

    describe('refundDonation', () => {
        it('should call getProvider and delegate refund', async () => {
            mockWhiteLabelingService.getGlobalSettings.mockResolvedValue({
                donation: { payment: { provider: 'paypal' } },
            })
            mockPayPalService.refundDonation.mockResolvedValue({
                status: 'refunded',
            })

            const result = await service.refundDonation('txn_1')

            expect(result).toEqual({ status: 'refunded' })
            expect(mockPayPalService.refundDonation).toHaveBeenCalledWith(
                'txn_1',
                expect.anything(),
            )
        })
    })
})
