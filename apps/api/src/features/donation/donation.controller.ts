import {
    Controller,
    Post,
    Body,
    Headers,
    Req,
    BadRequestException,
    Inject,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { PAYMENT_PROVIDER } from './interfaces/payment-provider.interface';
import type { PaymentProvider } from './interfaces/payment-provider.interface';
import type { Request } from 'express';

import { GatewayGateway } from '../gateway/gateway.gateway';

@Controller('donations')
export class DonationController {
    constructor(
        @Inject('PAYMENT_PROVIDER')
        private readonly paymentService: PaymentProvider,
        private readonly donationGateway: GatewayGateway,
    ) { }

    @Post('intent')
    async createPaymentIntent(
        @Body() body: { amount: number; currency?: string; metadata?: any },
    ) {
        if (!body.amount || body.amount <= 0) {
            throw new BadRequestException('Invalid amount');
        }
        // Amount is expected in the smallest currency unit (e.g., cents for USD/EUR).
        // Frontend is responsible for converting user input to cents.
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

        // NestJS needs raw body for Stripe signature verification
        // This requires main.ts configuration to allow raw body for this route or globally

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
                    // TODO: Record donation in DB via DonationService (to be created)
                    this.donationGateway.emitDonation({
                        amount: paymentIntent.amount,
                        currency: paymentIntent.currency,
                        donorName: paymentIntent.metadata?.donorName || 'Anonymous',
                        message: paymentIntent.metadata?.message,
                        isAnonymous: paymentIntent.metadata?.isAnonymous === 'true',
                    });
                    break;
                default:
                    console.log(`Unhandled event type ${event.type}`);
            }

            return { received: true };
        } catch (err) {
            throw new BadRequestException(`Webhook Error: ${err.message}`);
        }
    }
}
