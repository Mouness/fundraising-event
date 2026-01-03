import {
    Controller,
    Post,
    Body,
    Headers,
    Req,
    BadRequestException,
    Inject,
    Get,
    Query,
    Res,
    UseGuards,
    Patch,
    Param,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { RawBodyRequest } from '@nestjs/common';
import { PAYMENT_PROVIDER } from './interfaces/payment-provider.interface';
import type { PaymentProvider } from './interfaces/payment-provider.interface';
import type { Request } from 'express';

import { GatewayGateway } from '../gateway/gateway.gateway';
import { EmailProducer } from '../queue/producers/email.producer';
import { DonationService } from './donation.service';

import { CreateDonationDto, OfflineDonationDto } from '@fundraising/types';
import { EventsService } from '../events/events.service';

@Controller('donations')
export class DonationController {
    constructor(
        @Inject('PAYMENT_PROVIDER')
        private readonly paymentService: PaymentProvider,
        private readonly donationGateway: GatewayGateway,
        private readonly emailProducer: EmailProducer,
        private readonly donationService: DonationService,
        private readonly eventsService: EventsService,
    ) { }

    @Get()
    async findAll(
        @Query('eventId') eventId?: string,
        @Query('limit') limit: number = 50,
        @Query('offset') offset: number = 0,
        @Query('search') search?: string,
        @Query('status') status?: string,
    ) {
        return this.donationService.findAll(eventId, limit, offset, search, status);
    }

    @Get('export')
    @UseGuards(AuthGuard('jwt'))
    async exportCsv(
        @Res() res: any,
        @Query('eventId') eventId?: string,
        @Query('search') search?: string,
        @Query('status') status?: string,
    ) {
        const csv = await this.donationService.getExportData(eventId, search, status);
        const filename = `donations-${new Date().toISOString().split('T')[0]}.csv`;

        res.set({
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="${filename}"`,
        });

        return res.send(csv);
    }

    @Post('intent')
    async createPaymentIntent(
        @Body() body: CreateDonationDto,
    ) {
        if (!body.amount || body.amount <= 0) {
            throw new BadRequestException('Invalid amount');
        }
        return this.paymentService.createPaymentIntent(
            body.amount,
            body.currency || 'usd',
            body.metadata,
        );
    }

    @Post('stripe/webhook')
    async handleStripeWebhook(
        @Headers('stripe-signature') signature: string,
        @Req() req: RawBodyRequest<Request>,
    ) {
        if (!signature) {
            throw new BadRequestException('Missing stripe-signature header');
        }

        try {
            if (!req.rawBody) {
                throw new BadRequestException('Raw body not available');
            }
            const event = await this.paymentService.constructEventFromPayload(
                signature,
                req.rawBody,
            );

            // Handle the event
            switch (event.type) {
                case 'payment_intent.succeeded':
                    const paymentIntent = event.data.object;
                    console.log('PaymentIntent was successful!', paymentIntent);

                    // Persist to DB
                    await this.donationService.create({
                        amount: paymentIntent.amount,
                        transactionId: paymentIntent.id,
                        status: 'COMPLETED',
                        paymentMethod: 'stripe',
                        donorName: paymentIntent.metadata?.donorName,
                        donorEmail: paymentIntent.metadata?.donorEmail,
                        // Note: Stripe metadata values are strings. 'true'/'false'.
                        isAnonymous: paymentIntent.metadata?.isAnonymous === 'true',
                        message: paymentIntent.metadata?.message,
                        metadata: paymentIntent.metadata,
                    });

                    // Emit to Live Screen
                    this.donationGateway.emitDonation({
                        amount: paymentIntent.amount,
                        currency: paymentIntent.currency,
                        donorName: paymentIntent.metadata?.donorName || 'Anonymous',
                        message: paymentIntent.metadata?.message,
                        isAnonymous: paymentIntent.metadata?.isAnonymous === 'true',
                    });

                    // Send Email Receipt
                    if (paymentIntent.metadata?.donorEmail) {
                        try {
                            // Resolve Event Slug
                            const eventId = paymentIntent.metadata?.eventId;
                            // If eventId is missing, we can't send a branded receipt. 
                            // Fallback to default or skip? Skipping or erroring is safer.
                            if (eventId) {
                                const event = await this.eventsService.findOne(eventId);
                                if (event) {
                                    await this.emailProducer.sendReceipt(
                                        paymentIntent.metadata.donorEmail,
                                        paymentIntent.amount / 100,
                                        paymentIntent.id,
                                        event.slug
                                    );
                                }
                            }
                        } catch (e) {
                            console.error('Failed to send receipt email', e);
                        }
                    }
                    break;
                default:
                    console.log(`Unhandled event type ${event.type}`);
            }

            return { received: true };
        } catch (err) {
            throw new BadRequestException(`Webhook Error: ${err.message}`);
        }
    }
    @Post()
    @UseGuards(AuthGuard('jwt'))
    async createOfflineDonation(
        @Body() body: OfflineDonationDto,
        @Req() req: any,
    ) {
        const user = req.user;
        const eventId = user.eventId || body.eventId; // Use token eventId if available, fallback to body

        if (!eventId) {
            throw new BadRequestException('Event ID is required');
        }
        if (!body.amount || body.amount <= 0) {
            throw new BadRequestException('Invalid amount');
        }

        console.log('Received offline donation:', body);

        // Persist to DB
        // Generate a pseudo-ID for transaction if it's cash, or use timestamp
        const txId = `OFFLINE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        await this.donationService.create({
            amount: body.amount,
            transactionId: txId,
            status: 'COMPLETED',
            paymentMethod: body.type || 'cash',
            donorName: body.donorName,
            donorEmail: body.donorEmail,
            isAnonymous: !body.donorName,
            eventId: eventId,
            metadata: {
                isOfflineCollected: true,
                collectedAt: body.collectedAt,
                collectorId: user.userId,
            }
        });

        // 1. Emit to Live Screen
        this.donationGateway.emitDonation({
            amount: body.amount,
            currency: 'usd',
            donorName: body.donorName || 'Anonymous',
            message: `Collected via ${body.type}`,
            isAnonymous: !body.donorName,
        });

        // 2. Send Email Receipt if email provided
        if (body.donorEmail) {
            try {
                const event = await this.eventsService.findOne(eventId);
                if (event) {
                    await this.emailProducer.sendReceipt(
                        body.donorEmail,
                        body.amount / 100,
                        txId,
                        event.slug
                    );
                }
            } catch (e) {
                console.error('Failed to send offline receipt', e);
            }
        }

        return { success: true };
    }

    @Patch(':id')
    @UseGuards(AuthGuard('jwt'))
    async updateDonation(
        @Param('id') id: string,
        @Body() body: { donorName?: string; donorEmail?: string; isAnonymous?: boolean; message?: string },
    ) {
        return this.donationService.update(id, body);
    }

    @Post(':id/cancel')
    @UseGuards(AuthGuard('jwt'))
    async cancelDonation(
        @Param('id') id: string,
        @Body() body: { shouldRefund?: boolean },
    ) {
        return this.donationService.cancel(id, body.shouldRefund);
    }
}
