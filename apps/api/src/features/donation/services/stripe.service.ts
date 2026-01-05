import { Injectable, Logger } from '@nestjs/common';
import { IncomingHttpHeaders } from 'http';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

import {
  PaymentProvider,
  CreatePaymentIntentResult,
} from '../interfaces/payment-provider.interface';

@Injectable()
export class StripeService implements PaymentProvider {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      this.logger.error(
        'STRIPE_SECRET_KEY is not defined in environment variables',
      );
      // In dev mode, we might want to throw or just log. For now, logging.
    }

    this.stripe = new Stripe(secretKey || 'sk_test_placeholder', {
      // apiVersion: '2024-12-18.acacia', // Letting SDK default to avoid type mismatch
    });
  }

  /**
   * Creates a Stripe PaymentIntent for the specified amount.
   * @param amount Amount in cents (smallest currency unit)
   * @param currency Currency code (default: 'usd')
   * @param metadata Additional metadata to attach to the intent
   * @returns Object containing the clientSecret and intent ID
   */
  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata: Record<string, any> = {},
  ): Promise<CreatePaymentIntentResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount, // Amount in cents
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });
      if (!paymentIntent.client_secret) {
        throw new Error('Failed to retrieve client secret from Stripe');
      }
      return {
        clientSecret: paymentIntent.client_secret,
        id: paymentIntent.id,
      };
    } catch (error) {
      this.logger.error(`Error creating payment intent: ${error.message}`);
      throw error;
    }
  }

  constructEventFromPayload(
    headers: IncomingHttpHeaders | string,
    payload: Buffer,
  ) {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );

    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }

    const signature =
      typeof headers === 'string' ? headers : headers?.['stripe-signature'];
    if (!signature) {
      return Promise.reject(new Error('Missing stripe-signature header'));
    }

    return Promise.resolve(
      this.stripe.webhooks.constructEvent(payload, signature, webhookSecret),
    );
  }

  async refundDonation(paymentIntentId: string): Promise<any> {
    try {
      return await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
      });
    } catch (error) {
      this.logger.error(
        `Error refunding donation ${paymentIntentId}: ${error.message}`,
      );
      throw error;
    }
  }
}
