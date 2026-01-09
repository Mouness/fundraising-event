import { Injectable, Logger } from '@nestjs/common';
import { IncomingHttpHeaders } from 'http';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

import {
  PaymentProvider,
  CreatePaymentIntentResult,
  PaymentConfig,
} from '../interfaces/payment-provider.interface';
import { StripeProviderConfig } from '@fundraising/white-labeling';

@Injectable()
export class StripeService implements PaymentProvider {
  private readonly logger = new Logger(StripeService.name);

  constructor(private configService: ConfigService) { }

  private getClient(config?: PaymentConfig): Stripe {
    const stripeConfig = config as StripeProviderConfig;
    const secretKey =
      stripeConfig?.secretKey || this.configService.get<string>('STRIPE_SECRET_KEY');

    if (!secretKey) {
      this.logger.error(
        'Stripe Secret Key is missing (Check DB Config or ENV)',
      );
      throw new Error('Stripe Secret Key is not configured');
    }

    return new Stripe(secretKey, {
      apiVersion: '2025-12-15.clover', // Updated to match SDK version
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
    config?: PaymentConfig,
  ): Promise<CreatePaymentIntentResult> {
    try {
      const stripe = this.getClient(config);
      const paymentIntent = await stripe.paymentIntents.create({
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
    config?: PaymentConfig,
  ) {
    const stripeConfig = config as StripeProviderConfig;
    const webhookSecret =
      stripeConfig?.webhookSecret ||
      this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }

    const signature =
      typeof headers === 'string' ? headers : headers?.['stripe-signature'];
    if (!signature) {
      return Promise.reject(new Error('Missing stripe-signature header'));
    }

    const stripe = this.getClient(config);
    return Promise.resolve(
      stripe.webhooks.constructEvent(payload, signature, webhookSecret),
    );
  }

  async refundDonation(paymentIntentId: string, config?: PaymentConfig): Promise<any> {
    try {
      const stripe = this.getClient(config);
      return await stripe.refunds.create({
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
