import { Injectable } from '@nestjs/common';
import { IncomingHttpHeaders } from 'http';
import { StripeService } from './stripe.service';
import { PayPalService } from './paypal.service';
import { WhiteLabelingService } from '../../white-labeling/white-labeling.service';

import { PaymentConfig } from '../interfaces/payment-provider.interface';

@Injectable()
export class PaymentService {
  constructor(
    private readonly stripeService: StripeService,
    private readonly payPalService: PayPalService,
    private readonly whiteLabelingService: WhiteLabelingService,
  ) { }

  async getProvider() {
    const { provider } = await this.getPaymentContext();
    return provider;
  }

  private async getPaymentContext() {
    // 1. Fetch Global Settings (Payment is always global-level)
    const settings = await this.whiteLabelingService.getGlobalSettings();

    return this.resolveContext(settings || {});
  }

  private resolveContext(settings: any) {
    const providerName = settings?.donation?.payment?.provider || 'stripe';
    const config = settings?.donation?.payment?.config || {};

    const providerConfig =
      (providerName === 'paypal' ? config.paypal : config.stripe) || {};

    const providerService = providerName === 'paypal' ? this.payPalService : this.stripeService;

    return { provider: providerService, config: providerConfig as PaymentConfig, providerName };
  }

  async getGlobalCurrency(): Promise<string> {
    const settings = await this.whiteLabelingService.getGlobalSettings();
    return settings.donation?.payment?.currency || 'usd';
  }

  // Facade methods
  async createPaymentIntent(amount: number, currency: string, metadata: any) {
    const { provider, config } = await this.getPaymentContext();
    return provider.createPaymentIntent(amount, currency, metadata, config);
  }

  async constructEventFromPayload(
    headers: IncomingHttpHeaders | string,
    payload: Buffer,
    providerName?: string,
  ) {
    const settings = await this.whiteLabelingService.getGlobalSettings();
    const resolvedProviderName = providerName || settings?.donation?.payment?.provider || 'stripe';

    const provider = resolvedProviderName === 'paypal' ? this.payPalService : this.stripeService;
    const config = (resolvedProviderName === 'paypal'
      ? settings?.donation?.payment?.config?.paypal
      : settings?.donation?.payment?.config?.stripe) || {};

    return provider.constructEventFromPayload(headers, payload, config as PaymentConfig);
  }

  async refundDonation(transactionId: string) {
    const { provider, config } = await this.getPaymentContext();
    return provider.refundDonation(transactionId, config);
  }
}
