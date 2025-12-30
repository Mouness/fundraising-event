import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateDonationParams } from './interfaces/donation-service.interface';

@Injectable()
export class DonationService {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: CreateDonationParams) {
        let eventId = data.eventId;

        if (!eventId) {
            // Fallback: Find the first event (assuming single event context)
            const defaultEvent = await this.prisma.event.findFirst({
                select: { id: true }
            });
            if (defaultEvent) {
                eventId = defaultEvent.id;
            } else {
                // Critical: No event exists. Create a seed event or fail?
                // For now, logging error and creating a fallback placeholder might be too aggressive.
                // We'll throw an error if no event exists.
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
}
