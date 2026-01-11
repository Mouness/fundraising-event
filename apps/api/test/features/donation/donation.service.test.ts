import { Test, TestingModule } from '@nestjs/testing'
import { DonationService } from '@/features/donation/donation.service'
import { PrismaService } from '@/database/prisma.service'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CreateDonationParams } from '@/features/donation/interfaces/donation-service.interface'
import { NotFoundException, BadRequestException } from '@nestjs/common'

import { PaymentService } from '@/features/donation/services/payment.service'
import { GatewayGateway } from '@/features/gateway/gateway.gateway'
import { EmailProducer } from '@/features/queue/producers/email.producer'
import { EventsService } from '@/features/events/events.service'

const mockPrismaService = {
    event: {
        findFirst: vi.fn(),
        count: vi.fn(),
    },
    donation: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
    },
}

const mockPaymentService = {
    refundDonation: vi.fn(),
}

const mockGateway = {
    emitDonation: vi.fn(),
}

const mockEmailProducer = {
    sendReceipt: vi.fn(),
}

const mockEventsService = {
    findOne: vi.fn(),
}

describe('DonationService', () => {
    let service: DonationService

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
        }).compile()

        service = module.get<DonationService>(DonationService)

        // Mock Console
        vi.spyOn(console, 'error').mockImplementation(() => {})
        vi.spyOn(console, 'warn').mockImplementation(() => {})

        vi.clearAllMocks()
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    describe('processSuccessfulDonation', () => {
        it('should create donation, emit gateway event and send receipt', async () => {
            const data = {
                amount: 1000,
                currency: 'EUR',
                transactionId: 'tx_123',
                paymentMethod: 'stripe',
                donorEmail: 'test@example.com',
                eventId: 'evt_1',
            }
            const expectedDonation = { id: 'd1', ...data }

            mockPrismaService.event.count.mockResolvedValue(1)
            mockPrismaService.donation.create.mockResolvedValue(expectedDonation)
            mockEventsService.findOne.mockResolvedValue({ slug: 'test-event' })

            const result = await service.processSuccessfulDonation(data as any)

            expect(result).toEqual(expectedDonation)
            expect(mockGateway.emitDonation).toHaveBeenCalled()
            expect(mockEmailProducer.sendReceipt).toHaveBeenCalledWith(
                data.donorEmail,
                10, // 1000 / 100
                data.transactionId,
                'test-event',
            )
        })
    })

    describe('create', () => {
        const minimalData: CreateDonationParams = {
            amount: 1000,
            transactionId: 'tx_123',
            status: 'COMPLETED',
            paymentMethod: 'card',
        }

        it('should create donation linked to provided eventId', async () => {
            mockPrismaService.event.count.mockResolvedValue(1)
            mockPrismaService.donation.create.mockResolvedValue({
                id: 'd1',
                ...minimalData,
            })

            await service.create({ ...minimalData, eventId: 'evt_1' })

            expect(mockPrismaService.donation.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    amount: 1000,
                    eventId: 'evt_1',
                }),
            })
        })

        it('should fallback to default event if no eventId provided', async () => {
            mockPrismaService.event.findFirst.mockResolvedValue({
                id: 'default_evt',
            })
            mockPrismaService.donation.create.mockResolvedValue({
                id: 'd1',
                ...minimalData,
            })

            await service.create(minimalData)

            expect(mockPrismaService.event.findFirst).toHaveBeenCalled()
            expect(mockPrismaService.donation.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    eventId: 'default_evt',
                }),
            })
        })

        it('should throw error if no event found and no eventId provided', async () => {
            mockPrismaService.event.findFirst.mockResolvedValue(null)

            await expect(service.create(minimalData)).rejects.toThrow('No event found')
        })

        it('should throw error for invalid provided eventId', async () => {
            mockPrismaService.event.count.mockResolvedValue(0)
            const data = { ...minimalData, eventId: 'invalid' }
            await expect(service.create(data)).rejects.toThrow(
                'No event found to link donation to.',
            )
        })

        it('should throw error if prisma create fails', async () => {
            mockPrismaService.event.count.mockResolvedValue(1)
            mockPrismaService.donation.create.mockRejectedValue(new Error('Prisma Error'))
            const data = { ...minimalData, eventId: 'evt_1' }
            await expect(service.create(data)).rejects.toThrow('Prisma Error')
        })
    })

    describe('update', () => {
        it('should update donation info', async () => {
            const data = { donorName: 'Jane' }
            await service.update('d1', data)
            expect(mockPrismaService.donation.update).toHaveBeenCalledWith({
                where: { id: 'd1' },
                data,
            })
        })
    })

    describe('cancel', () => {
        it('should throw NotFoundException if donation not found', async () => {
            mockPrismaService.donation.findUnique.mockResolvedValue(null)
            await expect(service.cancel('d1')).rejects.toThrow(NotFoundException)
        })

        it('should throw BadRequestException if donation is already cancelled', async () => {
            mockPrismaService.donation.findUnique.mockResolvedValue({
                status: 'CANCELLED',
            })
            await expect(service.cancel('d1')).rejects.toThrow(BadRequestException)
        })

        it('should cancel donation without refund', async () => {
            mockPrismaService.donation.findUnique.mockResolvedValue({
                id: 'd1',
                status: 'COMPLETED',
            })
            await service.cancel('d1', false)
            expect(mockPrismaService.donation.update).toHaveBeenCalledWith({
                where: { id: 'd1' },
                data: { status: 'CANCELLED' },
            })
        })

        it('should refund and mark as REFUNDED', async () => {
            mockPrismaService.donation.findUnique.mockResolvedValue({
                id: 'd1',
                status: 'COMPLETED',
                transactionId: 'tx_123',
                eventId: 'evt_1',
            })
            await service.cancel('d1', true)
            expect(mockPaymentService.refundDonation).toHaveBeenCalledWith('tx_123')
            expect(mockPrismaService.donation.update).toHaveBeenCalledWith({
                where: { id: 'd1' },
                data: { status: 'REFUNDED' },
            })
        })

        it('should throw BadRequestException if refund fails', async () => {
            mockPrismaService.donation.findUnique.mockResolvedValue({
                id: 'd1',
                status: 'COMPLETED',
                transactionId: 'tx_123',
            })
            mockPaymentService.refundDonation.mockRejectedValue(new Error('Refund Error'))
            await expect(service.cancel('d1', true)).rejects.toThrow(BadRequestException)
        })

        it('should throw BadRequestException if missing transactionId for stripe refund', async () => {
            mockPrismaService.donation.findUnique.mockResolvedValue({
                id: 'd1',
                status: 'COMPLETED',
                paymentMethod: 'stripe',
            })
            await expect(service.cancel('d1', true)).rejects.toThrow(
                'Cannot refund: Missing Transaction ID',
            )
        })

        it('should mark as REFUNDED for cash without transactionId', async () => {
            mockPrismaService.donation.findUnique.mockResolvedValue({
                id: 'd1',
                status: 'COMPLETED',
                paymentMethod: 'cash',
            })
            await service.cancel('d1', true)
            expect(mockPrismaService.donation.update).toHaveBeenCalledWith({
                where: { id: 'd1' },
                data: { status: 'REFUNDED' },
            })
        })
    })

    describe('findAll', () => {
        it('should return paginated donations', async () => {
            const donations = [{ id: 'd1' }]
            mockPrismaService.donation.findMany.mockResolvedValue(donations)
            mockPrismaService.donation.count.mockResolvedValue(1)

            const result = await service.findAll('evt_1', 10, 0, 'search', 'COMPLETED')

            expect(result.data).toEqual(donations)
            expect(result.total).toEqual(1)
            expect(mockPrismaService.donation.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        eventId: 'evt_1',
                        status: 'COMPLETED',
                        OR: expect.any(Array),
                    }),
                }),
            )
        })
    })

    describe('getExportData', () => {
        it('should return CSV data with search', async () => {
            const donations = [
                {
                    id: 'd1',
                    createdAt: new Date(),
                    donorName: 'John',
                    donorEmail: 'john@example.com',
                    amount: 1000,
                    currency: 'USD',
                    status: 'COMPLETED',
                    paymentMethod: 'stripe',
                    message: 'Hello!',
                    isAnonymous: false,
                },
            ]
            mockPrismaService.donation.findMany.mockResolvedValue(donations)

            const result = await service.getExportData('evt_1', 'John', 'COMPLETED')
            expect(result).toContain('John')
            expect(mockPrismaService.donation.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        OR: expect.any(Array),
                    }),
                }),
            )
        })
    })
})
