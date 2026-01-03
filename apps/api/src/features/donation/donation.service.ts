import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateDonationParams } from './interfaces/donation-service.interface';
import { Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import type { PaymentProvider } from './interfaces/payment-provider.interface';

@Injectable()
export class DonationService {
    constructor(
        private readonly prisma: PrismaService,
        @Inject('PAYMENT_PROVIDER') private readonly paymentService: PaymentProvider,
    ) { }

    async create(data: CreateDonationParams) {
        let eventId = data.eventId;

        if (!eventId) {
            const defaultEvent = await this.prisma.event.findFirst({
                select: { id: true }
            });
            if (defaultEvent) {
                eventId = defaultEvent.id;
            } else {
                throw new Error('No event found to link donation to.');
            }
        }

        try {
            return await this.prisma.donation.create({
                data: {
                    amount: data.amount,
                    currency: 'USD',
                    donorName: data.donorName,
                    donorEmail: data.donorEmail,
                    message: data.message,
                    isAnonymous: data.isAnonymous ?? false,
                    status: data.status,
                    paymentMethod: data.paymentMethod,
                    stripePaymentIntentId: data.paymentMethod === 'stripe' ? data.transactionId : null,
                    eventId: eventId,
                },
            });
        } catch (error) {
            console.error('Error creating donation:', error);
            throw error;
        }
    }

    async update(id: string, data: { donorName?: string; donorEmail?: string; isAnonymous?: boolean; message?: string }) {
        return this.prisma.donation.update({
            where: { id },
            data,
        });
    }

    async cancel(id: string, shouldRefund: boolean = false) {
        const donation = await this.prisma.donation.findUnique({ where: { id } });
        if (!donation) throw new NotFoundException('Donation not found');

        if (donation.status === 'CANCELLED' || donation.status === 'REFUNDED') {
            throw new BadRequestException('Donation is already cancelled or refunded');
        }

        let newStatus = 'CANCELLED';

        if (shouldRefund) {
            if (donation.paymentMethod !== 'stripe' || !donation.stripePaymentIntentId) {
                if (donation.paymentMethod === 'stripe') {
                    throw new BadRequestException('Cannot refund: Missing Stripe Payment Intent ID');
                }
                newStatus = 'REFUNDED';
            } else {
                try {
                    await this.paymentService.refundDonation(donation.stripePaymentIntentId);
                    newStatus = 'REFUNDED';
                } catch (error) {
                    console.error('Stripe refund failed:', error);
                    throw new BadRequestException('Failed to process refund with Stripe');
                }
            }
        }

        return this.prisma.donation.update({
            where: { id },
            data: { status: newStatus },
        });
    }

    async findAll(
        eventId?: string,
        limit: number = 50,
        offset: number = 0,
        search?: string,
        status?: string
    ) {
        const where: any = {};

        if (eventId) where.eventId = eventId;
        if (status && status !== 'all') where.status = status;

        if (search) {
            where.OR = [
                { donorName: { contains: search, mode: 'insensitive' } },
                { donorEmail: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [data, total] = await Promise.all([
            this.prisma.donation.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: Number(limit),
                skip: Number(offset),
            }),
            this.prisma.donation.count({ where })
        ]);

        return { data, total };
    }

    /**
     * Generates a CSV string for all donations matching the criteria.
     */
    async getExportData(eventId?: string, search?: string, status?: string): Promise<string> {
        const where: any = {};
        if (eventId) where.eventId = eventId;
        if (status && status !== 'all') where.status = status;
        if (search) {
            where.OR = [
                { donorName: { contains: search, mode: 'insensitive' } },
                { donorEmail: { contains: search, mode: 'insensitive' } },
            ];
        }

        const donations = await this.prisma.donation.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        const headers = ['ID', 'Date', 'Donor Name', 'Donor Email', 'Amount', 'Currency', 'Status', 'Payment Method', 'Message', 'Anonymous'];
        const csvRows = [headers.join(',')];

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
                donation.isAnonymous
            ];
            csvRows.push(row.join(','));
        }

        return csvRows.join('\n');
    }
}
