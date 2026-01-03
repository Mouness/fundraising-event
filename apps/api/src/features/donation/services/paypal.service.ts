import { Injectable, Logger } from '@nestjs/common';
import { IncomingHttpHeaders } from 'http';
import { ConfigService } from '@nestjs/config';
import {
  PaymentProvider,
  CreatePaymentIntentResult,
} from '../interfaces/payment-provider.interface';

@Injectable()
export class PayPalService implements PaymentProvider {
  private readonly logger = new Logger(PayPalService.name);
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;

  constructor(private configService: ConfigService) {
    const sandbox = this.configService.get<string>('PAYPAL_SANDBOX') === 'true';
    this.baseUrl = sandbox
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com';

    this.clientId = this.configService.get<string>('PAYPAL_CLIENT_ID') || '';
    this.clientSecret =
      this.configService.get<string>('PAYPAL_CLIENT_SECRET') || '';

    if (!this.clientId || !this.clientSecret) {
      this.logger.warn('PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET not defined');
    }
  }

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString(
      'base64',
    );
    try {
      const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });

      if (!response.ok) {
        throw new Error(
          `Failed to get PayPal access token: ${response.statusText}`,
        );
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      this.logger.error(`Error getting access token: ${error.message}`);
      throw error;
    }
  }

  /**
   * Creates a PayPal Order (equivalent to PaymentIntent)
   */
  async createPaymentIntent(
    amount: number,
    currency: string = 'USD',
    metadata: Record<string, any> = {},
  ): Promise<CreatePaymentIntentResult> {
    try {
      const accessToken = await this.getAccessToken();

      // PayPal expects standard units (e.g. 10.00), not cents.
      // Assuming amount passed is in CENTS.
      const amountUnit = (amount / 100).toFixed(2);

      const payload = {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: currency.toUpperCase(),
              value: amountUnit,
            },
            custom_id: JSON.stringify(metadata), // Storing metadata in custom_id or just relying on local DB
          },
        ],
      };

      const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Failed to create PayPal order: ${err}`);
      }

      const data = await response.json();

      return {
        id: data.id,
        // PayPal doesn't have a 'client_secret' in the same way Stripe does for some flows,
        // but for standard JS SDK, the Order ID is enough.
        // We will return the ID as the secret too or null. Use ID for both to be safe.
        clientSecret: data.id,
      };
    } catch (error) {
      this.logger.error(`Error creating PayPal order: ${error.message}`);
      throw error;
    }
  }

  // Verification via API
  async constructEventFromPayload(
    headers: IncomingHttpHeaders | string,
    payload: Buffer,
  ): Promise<any> {
    const webhookId = this.configService.get<string>('PAYPAL_WEBHOOK_ID');
    if (!webhookId) {
      this.logger.warn(
        'PAYPAL_WEBHOOK_ID not set. Skipping verification (INSECURE).',
      );
      return JSON.parse(payload.toString());
    }

    const accessToken = await this.getAccessToken();
    const body = JSON.parse(payload.toString());

    const verificationBody = {
      auth_algo: headers['paypal-auth-algo'],
      cert_url: headers['paypal-cert-url'],
      transmission_id: headers['paypal-transmission-id'],
      transmission_sig: headers['paypal-transmission-sig'],
      transmission_time: headers['paypal-transmission-time'],
      webhook_id: webhookId,
      webhook_event: body,
    };

    try {
      const response = await fetch(
        `${this.baseUrl}/v1/notifications/verify-webhook-signature`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(verificationBody),
        },
      );

      if (!response.ok) {
        throw new Error(
          `PayPal verification API failed: ${response.statusText}`,
        );
      }

      const result = await response.json();
      if (result.verification_status !== 'SUCCESS') {
        throw new Error(
          'PayPal webhook verification failed: Invalid Signature',
        );
      }

      return body;
    } catch (error) {
      this.logger.error(`Webhook verification error: ${error.message}`);
      throw error;
    }
  }

  async refundDonation(paymentId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      // Look up the capture ID associated with this Order ID
      const orderRes = await fetch(
        `${this.baseUrl}/v2/checkout/orders/${paymentId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      if (!orderRes.ok) throw new Error('Order not found');
      const orderData = await orderRes.json();

      // Find capture ID from purchase units
      const captureId =
        orderData.purchase_units?.[0]?.payments?.captures?.[0]?.id;
      if (!captureId)
        throw new Error(
          'No capture found for this order. Has it been captured?',
        );

      const response = await fetch(
        `${this.baseUrl}/v2/payments/captures/${captureId}/refund`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) throw new Error('Refund failed');
      return await response.json();
    } catch (error) {
      this.logger.error(`Error refunding PayPal donation: ${error.message}`);
      throw error;
    }
  }
}
