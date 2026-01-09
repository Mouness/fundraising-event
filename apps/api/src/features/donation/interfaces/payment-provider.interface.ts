import { IncomingHttpHeaders } from 'http'

import { StripeProviderConfig, PayPalProviderConfig } from '@fundraising/white-labeling'

export interface CreatePaymentIntentResult {
    clientSecret: string
    id: string
}

export type PaymentConfig = StripeProviderConfig | PayPalProviderConfig | Record<string, any>

export interface PaymentProvider {
    createPaymentIntent(
        amount: number,
        currency: string,
        metadata?: any,
        config?: PaymentConfig,
    ): Promise<CreatePaymentIntentResult>
    constructEventFromPayload(
        headers: IncomingHttpHeaders | string,
        payload: Buffer,
        config?: PaymentConfig,
    ): Promise<any>
    refundDonation(paymentIntentId: string, config?: PaymentConfig): Promise<any>
}

export const PAYMENT_PROVIDER = 'PAYMENT_PROVIDER'
