import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { CreateDonationParams } from './interfaces/donation-service.interface'
import { BadRequestException, NotFoundException } from '@nestjs/common'

import { PaymentService } from './services/payment.service'
import { GatewayGateway } from '../gateway/gateway.gateway'
import { EmailProducer } from '../queue/producers/email.producer'
import { EventsService } from '../events/events.service'

@Injectable()
export class DonationService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly paymentService: PaymentService,
        private readonly donationGateway: GatewayGateway,
        private readonly emailProducer: EmailProducer,
        private readonly eventsService: EventsService,
    ) {}

    /**
     * Unified processor for successful donations from any source (Stripe, PayPal, Offline)
     */
    async processSuccessfulDonation(data: {
        amount: number
        currency: string
        transactionId: string
        paymentMethod: string
        donorName?: string
        donorEmail?: string
        isAnonymous?: boolean
        message?: string
        metadata?: any
        eventId: string
        staffMemberId?: string
    }) {
        // 1. Persist to DB
        const donation = await this.create({
            amount: data.amount,
            currency: data.currency,
            transactionId: data.transactionId,
            status: 'COMPLETED',
            paymentMethod: data.paymentMethod,
            donorName: data.donorName,
            donorEmail: data.donorEmail,
            isAnonymous: data.isAnonymous,
            message: data.message,
            metadata: data.metadata,
            eventId: data.eventId,
            staffMemberId: data.staffMemberId,
        })

        // 2. Emit to Live Screen
        this.donationGateway.emitDonation({
            amount: data.amount,
            currency: data.currency,
            donorName: data.donorName || 'Anonymous',
            message: data.message,
            isAnonymous: data.isAnonymous,
            eventId: data.eventId,
        })

        // 3. Send Email Receipt
        if (data.donorEmail) {
            try {
                const event = await this.eventsService.findOne(data.eventId)
                if (event) {
                    await this.emailProducer.sendReceipt(
                        data.donorEmail,
                        data.amount / 100,
                        data.transactionId,
                        event.slug,
                    )
                }
            } catch (e) {
                console.error('Failed to send receipt email', e)
            }
        }

        return donation
    }

    async create(data: CreateDonationParams) {
        let eventId = data.eventId

        // Validate if provided event exists
        if (eventId) {
            const exists = await this.prisma.event.count({ where: { id: eventId } })
            if (exists === 0) {
                console.warn(
                    `Donation attempt with invalid eventId: ${eventId}. Falling back to default.`,
                )
                eventId = undefined
            }
        }

        if (!eventId) {
            const defaultEvent = await this.prisma.event.findFirst({
                select: { id: true },
            })
            if (defaultEvent) {
                eventId = defaultEvent.id
            } else {
                throw new Error('No event found to link donation to.')
            }
        }

        try {
            return await this.prisma.donation.create({
                data: {
                    amount: data.amount,
                    currency: data.currency || 'EUR',
                    donorName: data.donorName,
                    donorEmail: data.donorEmail,
                    message: data.message,
                    isAnonymous: data.isAnonymous ?? false,
                    status: data.status,
                    paymentMethod: data.paymentMethod,
                    transactionId: data.transactionId,
                    eventId: eventId,
                    staffMemberId: data.staffMemberId,
                },
            })
        } catch (error) {
            console.error('Error creating donation:', error)
            throw error
        }
    }

    async update(
        id: string,
        data: {
            donorName?: string
            donorEmail?: string
            isAnonymous?: boolean
            message?: string
        },
    ) {
        return this.prisma.donation.update({
            where: { id },
            data,
        })
    }

    async cancel(id: string, shouldRefund: boolean = false) {
        const donation = await this.prisma.donation.findUnique({ where: { id } })
        if (!donation) throw new NotFoundException('Donation not found')

        if (donation.status === 'CANCELLED' || donation.status === 'REFUNDED') {
            throw new BadRequestException('Donation is already cancelled or refunded')
        }

        let newStatus = 'CANCELLED'

        if (shouldRefund) {
            // Verify refund capability
            if (!donation.transactionId) {
                if (donation.paymentMethod === 'stripe' || donation.paymentMethod === 'paypal') {
                    throw new BadRequestException('Cannot refund: Missing Transaction ID')
                }
                newStatus = 'REFUNDED' // Cash/Other just mark refunded
            } else {
                try {
                    if (donation.transactionId) {
                        await this.paymentService.refundDonation(donation.transactionId)
                    }
                    newStatus = 'REFUNDED'
                } catch (error) {
                    console.error('Refund failed:', error)
                    throw new BadRequestException('Failed to process refund')
                }
            }
        }

        return this.prisma.donation.update({
            where: { id },
            data: { status: newStatus },
        })
    }

    async findAll(
        eventId?: string,
        limit: number = 50,
        offset: number = 0,
        search?: string,
        status?: string,
    ) {
        const where: any = {}

        if (eventId) where.eventId = eventId
        if (status && status !== 'all') where.status = status

        if (search) {
            where.OR = [
                { donorName: { contains: search, mode: 'insensitive' } },
                { donorEmail: { contains: search, mode: 'insensitive' } },
            ]
        }

        const [data, total] = await Promise.all([
            this.prisma.donation.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: Number(limit),
                skip: Number(offset),
                include: {
                    staffMember: {
                        select: { id: true, name: true, code: true },
                    },
                },
            }),
            this.prisma.donation.count({ where }),
        ])

        return { data, total }
    }

    /**
     * Generates a CSV string for all donations matching the criteria.
     */
    async getExportData(eventId?: string, search?: string, status?: string): Promise<string> {
        const where: any = {}
        if (eventId) where.eventId = eventId
        if (status && status !== 'all') where.status = status
        if (search) {
            where.OR = [
                { donorName: { contains: search, mode: 'insensitive' } },
                { donorEmail: { contains: search, mode: 'insensitive' } },
            ]
        }

        const donations = await this.prisma.donation.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        })

        const headers = [
            'ID',
            'Date',
            'Donor Name',
            'Donor Email',
            'Amount',
            'Currency',
            'Status',
            'Payment Method',
            'Message',
            'Anonymous',
        ]
        const csvRows = [headers.join(',')]

        for (const donation of donations) {
            const row = [
                donation.id,
                donation.createdAt.toISOString(),
                `"${(donation.donorName || '').replace(/"/g, '""')}"`,
                donation.donorEmail || '',
                donation.amount.toString(),
                donation.currency,
                donation.status,
                donation.paymentMethod,
                `"${(donation.message || '').replace(/"/g, '""')}"`,
                donation.isAnonymous,
            ]
            csvRows.push(row.join(','))
        }

        return csvRows.join('\n')
    }
}
