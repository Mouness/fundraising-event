import { Injectable, BadRequestException } from '@nestjs/common';
import { IncomingHttpHeaders } from 'http';
import { StripeService } from './stripe.service';
import { PayPalService } from './paypal.service';
import { PrismaService } from '../../../database/prisma.service';
import { PaymentProvider } from '../interfaces/payment-provider.interface';
import { WhiteLabelingService } from '../../white-labeling/white-labeling.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly stripeService: StripeService,
    private readonly payPalService: PayPalService,
    private readonly prisma: PrismaService,
    private readonly whiteLabelingService: WhiteLabelingService,
  ) {}

  async getProvider(eventId?: string): Promise<PaymentProvider> {
    // 1. Check Global Settings first
    const globalConfig = await this.prisma.configuration.findFirst({
      where: { scope: 'GLOBAL' },
    });

    let provider = 'stripe'; // Default
    const config: any = globalConfig ? globalConfig : {};

    // For now, payment configuration is strictly global.
    // Event-level overrides are not yet supported or required.

    // Parsing the config structure from GlobalSettingsPage
    // structure: { payment: { provider: 'stripe' | 'paypal' } }
    if (config.payment?.provider) {
      provider = config.payment.provider;
    }

    switch (provider) {
      case 'paypal':
        return this.payPalService;
      case 'stripe':
      default:
        return this.stripeService;
    }
  }

  async getGlobalCurrency(): Promise<string> {
    const settings = await this.whiteLabelingService.getGlobalSettings();
    // Mapped structure puts payment config in donation.payment
    return settings.donation?.payment?.currency || 'usd';
  }

  // Facade methods
  async createPaymentIntent(amount: number, currency: string, metadata: any) {
    const eventId = metadata?.eventId;
    const provider = await this.getProvider(eventId);
    return provider.createPaymentIntent(amount, currency, metadata);
  }

  async constructEventFromPayload(
    headers: IncomingHttpHeaders | string,
    payload: Buffer,
    providerName: string = 'stripe',
  ) {
    if (providerName === 'paypal') {
      return this.payPalService.constructEventFromPayload(headers, payload);
    }
    return this.stripeService.constructEventFromPayload(headers, payload);
  }

  async refundDonation(eventId: string | undefined, transactionId: string) {
    const provider = await this.getProvider(eventId);
    return provider.refundDonation(transactionId);
  }
}
