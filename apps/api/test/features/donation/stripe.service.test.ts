import { Test, TestingModule } from '@nestjs/testing'
import { StripeService } from '@/features/donation/services/stripe.service'
import { ConfigService } from '@nestjs/config'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Stripe library
const { mockStripeInstance } = vi.hoisted(() => {
    return {
        mockStripeInstance: {
            paymentIntents: {
                create: vi.fn(),
            },
            webhooks: {
                constructEvent: vi.fn(),
            },
            refunds: {
                create: vi.fn(),
            },
        },
    }
})

vi.mock('stripe', () => {
    return {
        default: vi.fn().mockImplementation(function () {
            return mockStripeInstance
        }),
    }
})

describe('StripeService', () => {
    let service: StripeService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StripeService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: vi.fn((key) => {
                            if (key === 'STRIPE_SECRET_KEY') return 'sk_test_123'
                            if (key === 'STRIPE_WEBHOOK_SECRET') return 'whsec_123'
                            return null
                        }),
                    },
                },
            ],
        }).compile()

        service = module.get<StripeService>(StripeService)

        // Mock Logger
        vi.spyOn((service as any).logger, 'error').mockImplementation(() => {})

        vi.clearAllMocks()
    })

    describe('createPaymentIntent', () => {
        it('should create payment intent returns client secret', async () => {
            mockStripeInstance.paymentIntents.create.mockResolvedValue({
                id: 'pi_123',
                client_secret: 'secret_123',
            })

            const result = await service.createPaymentIntent(1000, 'usd')
            expect(result).toEqual({ id: 'pi_123', clientSecret: 'secret_123' })
            expect(mockStripeInstance.paymentIntents.create).toHaveBeenCalledWith({
                amount: 1000,
                currency: 'usd',
                metadata: {},
                automatic_payment_methods: { enabled: true },
            })
        })

        it('should throw error if client secret missing', async () => {
            mockStripeInstance.paymentIntents.create.mockResolvedValue({
                id: 'pi_123',
                client_secret: null,
            })

            await expect(service.createPaymentIntent(1000)).rejects.toThrow(
                'Failed to retrieve client secret',
            )
        })
    })

    describe('constructEventFromPayload', () => {
        it('should construct event using stripe webhook utils', async () => {
            const payload = Buffer.from('payload')
            const sig = 'sig_123'
            const event = { type: 'payment_intent.succeeded' }

            mockStripeInstance.webhooks.constructEvent.mockReturnValue(event)

            const result = await service.constructEventFromPayload(sig, payload)
            expect(result).toBe(event)
            expect(mockStripeInstance.webhooks.constructEvent).toHaveBeenCalledWith(
                payload,
                sig,
                'whsec_123',
            )
        })

        it('should throw if signature missing', async () => {
            await expect(
                service.constructEventFromPayload(undefined as any, Buffer.from('')),
            ).rejects.toThrow('Missing stripe-signature')
        })
    })

    describe('refundDonation', () => {
        it('should create refund', async () => {
            mockStripeInstance.refunds.create.mockResolvedValue({ id: 're_123' })
            await service.refundDonation('pi_123')
            expect(mockStripeInstance.refunds.create).toHaveBeenCalledWith({
                payment_intent: 'pi_123',
            })
        })
    })
})
