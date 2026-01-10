import { Test, TestingModule } from '@nestjs/testing'
import { PayPalService } from '@/features/donation/services/paypal.service'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import { of } from 'rxjs'
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('PayPalService', () => {
    let service: PayPalService

    const mockHttpService = {
        post: vi.fn(),
        get: vi.fn(),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PayPalService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: vi.fn((key) => {
                            if (key === 'PAYPAL_CLIENT_ID') return 'client_id'
                            if (key === 'PAYPAL_CLIENT_SECRET') return 'client_secret'
                            if (key === 'PAYPAL_WEBHOOK_ID') return 'webhook_id'
                            return null
                        }),
                    },
                },
                { provide: HttpService, useValue: mockHttpService },
            ],
        }).compile()

        service = module.get<PayPalService>(PayPalService)
        vi.clearAllMocks()
    })

    describe('createPaymentIntent', () => {
        it('should create order and return id', async () => {
            // Mock Auth Token Call
            mockHttpService.post.mockReturnValueOnce(of({ data: { access_token: 'token' } }))
            // Mock Order Create Call
            mockHttpService.post.mockReturnValueOnce(of({ data: { id: 'order_1' } }))

            const result = await service.createPaymentIntent(1000, 'USD')

            expect(result).toEqual({ id: 'order_1', clientSecret: 'order_1' })
            expect(mockHttpService.post).toHaveBeenCalledTimes(2)
        })
    })

    describe('constructEventFromPayload', () => {
        it('should verify signature via API', async () => {
            // Auth
            mockHttpService.post.mockReturnValueOnce(of({ data: { access_token: 'token' } }))
            // Verify
            mockHttpService.post.mockReturnValueOnce(
                of({ data: { verification_status: 'SUCCESS' } }),
            )

            const payload = Buffer.from(JSON.stringify({ event_type: 'TEST' }))
            const result = await service.constructEventFromPayload({}, payload)

            expect(result).toEqual({ event_type: 'TEST' })
        })

        it('should throw if verification fails', async () => {
            // Auth
            mockHttpService.post.mockReturnValueOnce(of({ data: { access_token: 'token' } }))
            // Verify Fail
            mockHttpService.post.mockReturnValueOnce(
                of({ data: { verification_status: 'FAILURE' } }),
            )

            const payload = Buffer.from(JSON.stringify({}))
            await expect(service.constructEventFromPayload({}, payload)).rejects.toThrow(
                'Invalid Signature',
            )
        })

        it('should skip verification if webhookId is missing', async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    PayPalService,
                    {
                        provide: ConfigService,
                        useValue: {
                            get: vi.fn((key) => {
                                if (key === 'PAYPAL_CLIENT_ID') return 'client_id'
                                if (key === 'PAYPAL_CLIENT_SECRET') return 'client_secret'
                                return null // PAYPAL_WEBHOOK_ID is missing
                            }),
                        },
                    },
                    { provide: HttpService, useValue: mockHttpService },
                ],
            }).compile()

            const insecureService = module.get<PayPalService>(PayPalService)
            const payload = Buffer.from(JSON.stringify({ event_type: 'INSECURE' }))
            const result = await insecureService.constructEventFromPayload({}, payload)

            expect(result).toEqual({ event_type: 'INSECURE' })
        })
    })

    describe('refundDonation', () => {
        it('should refund captured donation', async () => {
            // Auth
            mockHttpService.post.mockReturnValueOnce(of({ data: { access_token: 'token' } }))
            // Get Order
            mockHttpService.get.mockReturnValueOnce(
                of({
                    data: {
                        purchase_units: [{ payments: { captures: [{ id: 'cap_1' }] } }],
                    },
                }),
            )
            // Refund
            mockHttpService.post.mockReturnValueOnce(of({ data: { status: 'COMPLETED' } }))

            const result = await service.refundDonation('order_1')
            expect(result.status).toBe('COMPLETED')
            expect(mockHttpService.post).toHaveBeenCalledTimes(2)
            expect(mockHttpService.get).toHaveBeenCalledTimes(1)
        })

        it('should throw if no capture found', async () => {
            // Auth
            mockHttpService.post.mockReturnValueOnce(of({ data: { access_token: 'token' } }))
            // Get Order (no capture)
            mockHttpService.get.mockReturnValueOnce(
                of({ data: { purchase_units: [{ payments: { captures: [] } }] } }),
            )

            await expect(service.refundDonation('order_1')).rejects.toThrow(
                'No capture found for this order',
            )
        })
    })

    describe('error handling', () => {
        it('should log and throw on auth error', async () => {
            const error = new Error('Auth Error')
            mockHttpService.post.mockImplementation(() => {
                throw error
            })

            await expect(service.createPaymentIntent(100)).rejects.toThrow('Auth Error')
        })

        it('should log and throw on order create error', async () => {
            mockHttpService.post.mockReturnValueOnce(of({ data: { access_token: 'token' } }))
            mockHttpService.post.mockImplementationOnce(() => {
                throw new Error('Create Error')
            })

            await expect(service.createPaymentIntent(100)).rejects.toThrow('Create Error')
        })

        it('should log and throw on refund error', async () => {
            mockHttpService.post.mockReturnValueOnce(of({ data: { access_token: 'token' } }))
            mockHttpService.get.mockImplementationOnce(() => {
                throw new Error('Refund Fetch Error')
            })

            await expect(service.refundDonation('order_1')).rejects.toThrow('Refund Fetch Error')
        })
    })
})
